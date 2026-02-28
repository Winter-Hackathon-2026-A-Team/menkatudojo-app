import { RecordingState } from '@/types/recording';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import StopIcon from '@mui/icons-material/Stop';
import { Button, CircularProgress, Stack } from '@mui/material';

interface Props {
  state: RecordingState;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onConfirm: () => void;
  uploadProgress: number;
}

export const RecordingControls = ({
  state,
  onStart,
  onStop,
  onReset,
  onConfirm,
  uploadProgress,
}: Props) => {
  // フェーズごとにボタンレイヤーを出し分ける
  switch (state.phase) {
    case 'completed':
      return (
        <Stack
          direction={{ xs: 'column-reverse', sm: 'row' }}
          spacing={3}
          justifyContent="center"
          alignItems={'center'}
        >
          <Button
            variant="outlined"
            onClick={onReset}
            startIcon={<ReplayIcon />}
            sx={{ color: 'white', borderColor: 'white', width: { xs: '90%', sm: 230 } }}
          >
            もう一度練習する
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={onConfirm}
            startIcon={<AutoAwesomeIcon />}
            sx={{ width: { xs: '90%', sm: 230 } }}
          >
            フィードバックを受ける
          </Button>
        </Stack>
      );

    case 'uploading':
    case 'analyzing':
    case 'error':
      return (
        <Stack direction="row" justifyContent="center">
          <Button variant="contained" color="error" onClick={onReset}>
            再試行
          </Button>
        </Stack>
      );

    default:
      // initializing, ready, countdown, recording の場合
      return (
        <Stack direction="row" justifyContent="center">
          <Button
            variant="contained"
            // ready/recordingのみenabled
            disabled={state.phase !== 'ready' && state.phase !== 'recording'}
            // ready: onStart, recording: onStop
            onClick={state.phase === 'recording' ? onStop : onStart}
            sx={{
              borderRadius: '50%',
              width: '80px',
              height: '80px',
              minWidth: 0,
              bgcolor: state.phase === 'recording' ? 'error.main' : 'primary.main',
              '&:hover': {
                bgcolor: state.phase === 'recording' ? 'error.dark' : 'primary.dark',
              },
            }}
          >
            {state.phase === 'recording' ? (
              <StopIcon sx={{ fontSize: 40 }} />
            ) : // initializing: ローディング中...
            state.phase === 'initializing' ? (
              <CircularProgress size={32} color="inherit" />
            ) : (
              <PlayArrowIcon sx={{ fontSize: 40, ml: 0.5 }} />
            )}
          </Button>
        </Stack>
      );
  }
};
