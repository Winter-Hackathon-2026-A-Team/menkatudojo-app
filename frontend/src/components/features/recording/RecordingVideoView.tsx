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
  useEffect(() => {
    const video = videoRef.current;
    if (video && currentStream && state.phase !== 'completed') {
      if (video.srcObject !== currentStream) {
        video.srcObject = currentStream;
      }
    }
  }, [state.phase, currentStream, videoRef]);

  const formatTime = (seconds: number) => {
    const mm = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const ss = (seconds % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  // initializing: Video準備フラグ：false
  useEffect(() => {
    if (state.phase === 'initializing') {
      setIsVideoReady(false);
    }
  }, [state.phase]);
  
  // 画面のチラつき防止のためにタイムラグを設定
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
        border: '2px solid #333',
        bgcolor: 'black',
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
          {state.phase === 'recording' && (
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: 'rgba(0,0,0,0.6)',
                px: 2,
                py: 0.5,
                borderRadius: 2,
                zIndex: 2,
              }}
            >
              <FiberManualRecordIcon sx={{ color: 'error.main', fontSize: 18 }} />
              <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>
                {formatTime(Math.max(0, state.totalSeconds - state.elapsed))}
              </Typography>
            </Box>
          )}
        </>
      )}

      {state.phase === 'countdown' && state.count !== undefined && (
        <CountdownOverlay count={state.count} interviewer={interviewer} />
      )}

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

      {/* アバター表示 */}
      <Box
        sx={{
          position: 'absolute',
          top: '1%',
          left: '1%',
          width: '20%',
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          overflow: 'hidden',
          zIndex: 2,
          border: '3px solid rgba(255, 255, 255, 0.3)',
          // bgcolor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
    </Box>
  );
};
