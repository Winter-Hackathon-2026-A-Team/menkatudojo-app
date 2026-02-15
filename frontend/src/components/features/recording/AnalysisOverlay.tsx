import { Backdrop, Box, CircularProgress, Stack, Typography } from '@mui/material';

interface Props {
  open: boolean;
  phase: 'uploading' | 'analyzing' | string;
  progress: number;
}

export const AnalysisOverlay = ({ open, phase, progress }: Props) => {
  return (
    <Backdrop
      open={open}
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(4px)', // 背景ぼかし
      }}
    >
      <Stack spacing={3} alignItems="center">
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          {phase === 'uploading' ? (
            <>
              <CircularProgress variant="determinate" value={progress} size={80} thickness={4} />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h6" component="div">
                  {Math.round(progress)}%
                </Typography>
              </Box>
            </>
          ) : (
            <CircularProgress size={80} thickness={4} />
          )}
        </Box>

        <Box textAlign="center">
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
            {phase === 'uploading' ? '動画を送信中...' : 'AIが分析中...'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {phase === 'uploading'
              ? 'ネットワーク状況により時間がかかる場合があります'
              : '回答の詳細を解析しています。そのままお待ちください。'}
          </Typography>
        </Box>
      </Stack>
    </Backdrop>
  );
};
