import { useState, useCallback, useRef } from 'react';
import { getPresignedUrl, uploadToS3, checkAnalysisStatus } from '@/api/recording';
import { FeedbackData } from '@/types/recording';

export const useUploadAnswer = () => {
  const [progress, setProgress] = useState(0);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 分析ステータスのポーリング（Analyzingフェーズ）
   */
  const startPolling = useCallback((
    answerId: string, 
    onSuccess: (data: FeedbackData) => void, 
    onFail: (errCode: string) => void
  ) => {
    let pollCount = 0;
    const MAX_POLLS = 20; // 3秒×20回 = 最大1分

    pollingTimerRef.current = setInterval(async () => {
      pollCount++;
      try {
        const data = await checkAnalysisStatus(answerId);
        
        if (data.analysisStatus === 'completed' && data.feedback) {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          onSuccess(data.feedback);
        } else if (data.analysisStatus === 'failed' || pollCount >= MAX_POLLS) {
          throw new Error(data.analysisStatus === 'failed' ? 'ANALYSIS_FAILED' : 'POLLING_TIMEOUT');
        }
      } catch (err: any) {
        if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
        onFail(err.message || 'POLLING_ERROR');
      }
    }, 3000);
  }, []);

  /**
   * アップロードと分析のメインフロー（Uploadingフェーズ）
   */
  const startUploadAndAnalysis = useCallback(async (
    blob: Blob,
    questionId: number,
    personalityId: number,
    avatarId: number,
    onStateChange: (phase: 'uploading' | 'analyzing' | 'error', details?: any) => void,
    onComplete: (feedback: FeedbackData) => void
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
        startPolling(
          answerId, 
          onComplete, 
          (errCode) => onStateChange('error', { code: errCode, severity: 'fatal' })
        );

      } catch (err) {
        // 失敗時、3回までリトライを実行
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          console.warn(`Upload retry attempt ${retryCount}...`);
          await execute();
        } else {
          console.log('アップロード失敗')
          onStateChange('error', { 
            code: 'UPLOAD_FAILED_AFTER_RETRIES', 
            message: '動画の送信に失敗しました。', 
            severity: 'fatal' 
          });
        }
      }
    };

    await execute();
  }, [startPolling]);

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