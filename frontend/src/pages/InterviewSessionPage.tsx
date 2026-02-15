// TODO: onCloseをモーダル展開→確認後に終了に変更する
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
import { FeedbackData } from '@/types/recording';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const InterviewSessionPage = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const { videoRef, mediaState, setupDevices } = useMediaStream();

  // 1. マウント時にlocalStorageから設定を復元
  const [characterConfig] = useState(() => {
    const saved = localStorage.getItem('selectedAvatarId');
    const avatarId = saved ? Number(saved) : PERSONALITIES[0].avatarId;

    // 定数から該当する師範(Personality)を特定
    const personality = PERSONALITIES.find((p) => p.avatarId === avatarId) || PERSONALITIES[0];

    return {
      avatarId: personality.avatarId,
      personalityId: personality.personalityId,
    };
  });

  // 質問内容・録画可能時間を取得
  const { data: question, isLoading: isQuestionLoading, isError } = useQuestion(questionId);
  // デバッグ用
  if (isError) {
    return console.log('質問内容取得に失敗');
  }

  const {
    state,
    setReady,
    startCountdown,
    stopRecording,
    resetRecording,
    currentStream,
    setState,
  } = useRecording();

  const { startUploadAndAnalysis, progress, cancelAll } = useUploadAnswer();

  // 面接官の選択
  const [interviewer] = useState(
    () => INTERVIEWERS[Math.floor(Math.random() * INTERVIEWERS.length)],
  );

  useEffect(() => {
    if (state.phase !== 'initializing' || !question) return;

    let isMounted = true; // クリーンアップ用

    const initCamera = async () => {
      const stream = await setupDevices();
      if (stream && isMounted) {
        // 1. streamをセットし、録画機能を有効にする
        setReady(question, {
          ...mediaState,
          stream,
          videoStatus: mediaState.videoStatus,
          audioStatus: mediaState.audioStatus,
          audioLevel: 0,
          error: null,
        });
      }
    };

    initCamera();

    return () => {
      isMounted = false;
    };
  }, [question, state.phase]);

  // アンマウント時にポーリングを停止
  useEffect(() => {
    return () => cancelAll();
  }, [cancelAll]);

  // 確定ボタン
  const handleConfirm = async () => {
    if (state.phase !== 'completed') return;

    await startUploadAndAnalysis(
      state.videoBlob,
      state.question.questionId,
      characterConfig.avatarId, // 取得したIDを注入
      characterConfig.personalityId,
      (phase, details) => {
        setState((prev) => ({
          ...prev,
          phase: phase,
          ...(details || {}),
        }));
      },
      (feedback: FeedbackData) => {
        // 成功時：結果画面へ（履歴に残さないようreplace）
        console.log('分析結果:', feedback);
        navigate('/analysis-result', { state: { feedback }, replace: true });
      },
    );
  };

  return (
    <Box
      sx={{
        bgcolor: '#121212',
        height: '100vh',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <RecordingHeader state={state} isLoading={isQuestionLoading} onClose={() => navigate(-1)} />{' '}
      {/* TODO: モーダル展開させる */}
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
      <AnalysisOverlay
        open={state.phase === 'uploading' || state.phase === 'analyzing'}
        phase={state.phase}
        progress={progress}
      />
    </Box>
  );
};
