import { checkAnalysisStatus, getPresignedUrl, uploadToS3 } from '@/api/recording';
import { AnalysisResponse } from '@/types/recording';
import { useCallback, useRef, useState } from 'react';

type OnComplete = (response: AnalysisResponse) => void;

export const useUploadAnswer = () => {
  const [progress, setProgress] = useState(0);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 分析ステータスのポーリング（Analyzingフェーズ）
   */
  const startPolling = useCallback(
    (
      answerId: string,
      onSuccess: (data: AnalysisResponse) => void,
      onFail: (errCode: string) => void,
    ) => {
      let pollCount = 0;
      const MAX_POLLS = 20; // 3秒×20回 = 最大1分

      pollingTimerRef.current = setInterval(async () => {
        pollCount++;
        try {
          const data = await checkAnalysisStatus(answerId);

          if (data.analysisStatus === 'completed') {
            if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
            onSuccess(data);
          } else if (data.analysisStatus === 'failed' || pollCount >= MAX_POLLS) {
            throw new Error(
              data.analysisStatus === 'failed' ? 'ANALYSIS_FAILED' : 'POLLING_TIMEOUT',
            );
          }
        } catch (err: any) {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          onFail(err.message || 'POLLING_ERROR');
        }
      }, 3000);
    },
    [],
  );

  /**
   * アップロードと分析のメインフロー（Uploadingフェーズ）
   */
  const startUploadAndAnalysis = useCallback(
    async (
      blob: Blob,
      questionId: number,
      avatarId: number,
      personalityId: number,
      onStateChange: (phase: 'uploading' | 'analyzing' | 'error', details?: any) => void,
      onComplete: OnComplete,
    ) => {
      let retryCount = 0;
      const MAX_RETRIES = 3;

      const execute = async () => {
        try {
          // 1. 署名付きURL取得
          onStateChange('uploading');
          const { uploadUrl, answerId } = await getPresignedUrl({
            questionId,
            characterConfig: {
              personalityId,
              avatarId,
            },
          });

          // 2. S3/MinIOへPUT（axios）
          await uploadToS3(uploadUrl, blob, (percent) => {
            setProgress(percent);
          });

          // 3. 成功したら分析フェーズへ移行しポーリング開始
          onStateChange('analyzing');
          startPolling(answerId, onComplete, (errCode) =>
            onStateChange('error', { code: errCode, severity: 'fatal' }),
          );
        } catch (err) {
          // 失敗時、3回までリトライを実行
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            await execute();
          } else {
            onStateChange('error', {
              code: 'UPLOAD_FAILED_AFTER_RETRIES',
              message: '動画の送信に失敗しました。',
              severity: 'fatal',
            });
          }
        }
      };

      await execute();
    },
    [startPolling],
  );

  /**
   * クリーンアップ（アンマウント時や削除依頼時に使用）
   */
  const cancelAll = useCallback(() => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
    }
  }, []);

  return { startUploadAndAnalysis, progress, cancelAll };
};
