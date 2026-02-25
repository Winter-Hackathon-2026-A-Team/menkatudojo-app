import { RecordingState } from '@/types/recording';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { CountdownOverlay } from './CountdownOverlay';

interface Props {
  state: RecordingState;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  currentStream: MediaStream | null;
  interviewer: any;
  isQuestionLoading: boolean;
}

export const RecordingVideoView = ({
  state,
  videoRef,
  currentStream,
  interviewer,
  isQuestionLoading,
}: Props) => {
  const [isVideoReady, setIsVideoReady] = useState(false);

  // 1. ストリームのセット
  useEffect(() => {
    const video = videoRef.current;
    if (video && currentStream && state.phase !== 'completed') {
      if (video.srcObject !== currentStream) {
        video.srcObject = currentStream;
      }
    }
  }, [state.phase, currentStream, videoRef]);

  // 2. 状態によるフラグの抽出
  const isRecording = state.phase === 'recording';
  const isEndingSoon = isRecording && state.isEndingSoon;

  const formatTime = (seconds: number) => {
    const mm = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const ss = (seconds % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  // 3. 初期化時のリセット
  useEffect(() => {
    if (state.phase === 'initializing') {
      setIsVideoReady(false);
    }
  }, [state.phase]);

  const onVideoLoad = () => {
    setTimeout(() => {
      setIsVideoReady(true);
    }, 1000);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: 'min(100%, calc((100vh - 200px) * 16 / 9))',
        height: 'min(100%, calc(100vw * 9 / 16))',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'black',
        // --- 残り5秒で枠を赤 ---
        border: isEndingSoon ? '4px solid #ff1744' : '2px solid #333',
        boxShadow: isEndingSoon ? '0 0 20px rgba(255, 23, 68, 0.6)' : 'none',
        transition: 'all 0.3s ease-in-out',
        ...(isEndingSoon && {
          animation: 'pulse-border 1s infinite',
        }),
        '@keyframes pulse-border': {
          '0%': { opacity: 1 },
          '50%': { opacity: 0.7 },
          '100%': { opacity: 1 },
        },
      }}
    >
      {state.phase === 'completed' ? (
        <video
          src={state.videoURL}
          controls
          autoPlay
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={onVideoLoad}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
              opacity: isVideoReady ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
            }}
          />

          {/* 録画中バッジとタイマー */}
          {isRecording && (
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: isEndingSoon ? 'rgba(255, 23, 68, 0.8)' : 'rgba(0,0,0,0.6)',
                px: 2,
                py: 0.5,
                borderRadius: 2,
                zIndex: 2,
                transition: 'background-color 0.3s ease',
              }}
            >
              <FiberManualRecordIcon
                sx={{
                  color: '#ff1744',
                  fontSize: 18,
                  animation: 'blink 1s infinite step-end',
                }}
              />
              <Typography
                variant="subtitle2"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                {formatTime(Math.max(0, state.totalSeconds - state.elapsed))}
              </Typography>
            </Box>
          )}
        </>
      )}

      {/* カウントダウン */}
      {state.phase === 'countdown' && state.count !== undefined && (
        <CountdownOverlay count={state.count} interviewer={interviewer} />
      )}

      {/* ローディングオーバーレイ */}
      {(state.phase === 'initializing' || !isVideoReady) && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'black',
            zIndex: 10,
          }}
        >
          <CircularProgress color="primary" sx={{ mb: 2 }} />
          <Typography variant="caption" sx={{ color: 'grey.500' }}>
            {isQuestionLoading ? '質問を取得中...' : 'カメラを起動中...'}
          </Typography>
        </Box>
      )}

      {/* 面接官アバター */}
      <Box
        sx={{
          position: 'absolute',
          top: '1.5%',
          left: '1.5%',
          width: '20%',
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          overflow: 'hidden',
          zIndex: 2,
          border: isEndingSoon ? '3px solid #ff1744' : '3px solid rgba(255, 255, 255, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border 0.3s ease',
        }}
      >
        <img
          src={interviewer.url}
          alt={interviewer.name}
          style={{
            width: '130%',
            height: '130%',
            objectFit: 'cover',
            transform: 'translateY(5%)',
          }}
        />
      </Box>

      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}
      </style>
    </Box>
  );
};
