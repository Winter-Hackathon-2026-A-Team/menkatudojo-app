import { ErrorView } from '@/components/common/ErrorView';
import { AnalysisOverlay } from '@/components/features/recording/AnalysisOverlay';
import { RecordingControls } from '@/components/features/recording/RecordingControls';
import { RecordingHeader } from '@/components/features/recording/RecordingHeader';
import { RecordingVideoView } from '@/components/features/recording/RecordingVideoView';
import { INTERVIEWERS } from '@/constants/interviewers';
import { PERSONALITIES } from '@/constants/personalities';
import { useMediaStream } from '@/hooks/useMediaStream';
import { useQuestion } from '@/hooks/useQuestion';
import { useRecording } from '@/hooks/useRecording';
import { useUploadAnswer } from '@/hooks/useUploadAnswer';
import { AnalysisResponse } from '@/types/recording';
import { getErrorMessage } from '@/utils/errorHandlers';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const InterviewSessionPage = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const { videoRef, mediaState, setupDevices } = useMediaStream();
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);

  // 1. 設定の復元（アバター・性格）
  const [characterConfig] = useState(() => {
    const saved = localStorage.getItem('selectedAvatarId');
    const avatarId = saved ? Number(saved) : PERSONALITIES[0].avatarId;
    const personality = PERSONALITIES.find((p) => p.avatarId === avatarId) || PERSONALITIES[0];

    return {
      avatarId: personality.avatarId,
      personalityId: personality.personalityId,
    };
  });

  // 2. 質問データの取得
  const {
    data: question,
    isLoading: isQuestionLoading,
    isError: isQuestionError,
    error: questionError,
    refetch: refetchQuestion,
  } = useQuestion(questionId);

  // 3. 録画状態管理
  const {
    state,
    setReady,
    startCountdown,
    stopRecording,
    resetRecording,
    currentStream,
    setState,
  } = useRecording();

  // 4. 解析・アップロード管理
  const { startUploadAndAnalysis, progress, cancelAll } = useUploadAnswer();

  // 5. 面接官の固定
  const [interviewer] = useState(
    () => INTERVIEWERS[Math.floor(Math.random() * INTERVIEWERS.length)],
  );

  // カメラ・マイクの初期化ロジック
  const initCamera = useCallback(async () => {
    if (!question) return;
    try {
      const stream = await setupDevices();
      if (stream) {
        setReady(question, {
          ...mediaState,
          stream,
          videoStatus: 'ready',
          audioStatus: 'ready',
        });
      }
    } catch (err) {
      console.error('Device setup failed:', err);
    }
  }, [question, setupDevices, setReady, mediaState]);

  // mount時・question取得時の初期化
  useEffect(() => {
    if (state.phase === 'initializing' && question) {
      initCamera();
    }
  }, [state.phase, question, initCamera]);

  // 6. ハンドラー定義
  const handleCloseRequest = () => {
    // 録画中、または録画完了（未保存）の状態なら警告を出す
    if (state.phase === 'recording' || state.phase === 'completed') {
      setIsExitConfirmOpen(true);
    } else {
      navigate(-1);
    }
  };

  const handleConfirmExit = () => {
    cancelAll();
    navigate(-1);
  };

  const handleConfirm = async () => {
    if (state.phase !== 'completed') return;

    await startUploadAndAnalysis(
      state.videoBlob,
      Number(state.question.questionId),
      characterConfig.avatarId,
      characterConfig.personalityId,
      (phase, details) => {
        setState((prev) => ({
          ...prev,
          phase: phase,
          ...(details || {}),
        }));
      },
      (response: AnalysisResponse) => {
        navigate(`/analysis-result/${response.answerId}`, { replace: true });
      },
    );
  };

  // 7. 早期リターンによるエラーハンドリング

  // A. APIからの質問取得エラー
  if (isQuestionError) {
    return (
      <Box
        sx={{
          bgcolor: '#121212',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ErrorView message={getErrorMessage(questionError)} onRetry={() => refetchQuestion()} />
      </Box>
    );
  }

  // B. 録画プロセス中のエラー（デバイス切断、レコーダー失敗など）
  if (state.phase === 'error') {
    return (
      <Box
        sx={{
          bgcolor: '#121212',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ErrorView
          message={state.error.message}
          onRetry={state.error.severity === 'recoverable' ? resetRecording : undefined}
        />
      </Box>
    );
  }

  // 8. メインレンダリング
  return (
    <Box
      sx={{
        bgcolor: '#121212',
        height: '100vh',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <RecordingHeader state={state} isLoading={isQuestionLoading} onClose={handleCloseRequest} />

      {/* 終了確認モーダル */}
      <Dialog
        open={isExitConfirmOpen}
        onClose={() => setIsExitConfirmOpen(false)}
        slotProps={{
          paper: { sx: { bgcolor: '#222', color: 'white', p: 1, backgroundImage: 'none' } },
        }}
      >
        <DialogTitle>練習を終了しますか？</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)' }}>
            録画データは保存されません。本当に終了しますか？
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsExitConfirmOpen(false)} sx={{ color: 'white' }}>
            キャンセル
          </Button>
          <Button onClick={handleConfirmExit} variant="contained" color="error">
            終了する
          </Button>
        </DialogActions>
      </Dialog>

      {/* ビデオ・面接官表示エリア */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          minHeight: 0,
        }}
      >
        <RecordingVideoView
          state={state}
          videoRef={videoRef}
          currentStream={currentStream}
          interviewer={interviewer}
          isQuestionLoading={isQuestionLoading}
        />
      </Box>

      {/* 録画コントロール・操作エリア */}
      <Box sx={{ flexShrink: 0, pb: 4 }}>
        <RecordingControls
          state={state}
          onStart={startCountdown}
          onStop={stopRecording}
          onReset={resetRecording}
          onConfirm={handleConfirm}
          uploadProgress={progress}
        />
      </Box>

      {/* 解析中オーバーレイ */}
      <AnalysisOverlay
        open={state.phase === 'uploading' || state.phase === 'analyzing'}
        phase={state.phase}
        progress={progress}
      />
    </Box>
  );
};
