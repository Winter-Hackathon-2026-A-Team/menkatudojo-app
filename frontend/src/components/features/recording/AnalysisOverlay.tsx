import { PERSONALITIES } from '@/constants/personalities';
import { Avatar, Backdrop, Box, CircularProgress, Stack, Typography } from '@mui/material';

interface Props {
  open: boolean;
  phase: 'uploading' | 'analyzing' | string;
  progress: number;
}

export const AnalysisOverlay = ({ open, phase, progress }: Props) => {
  // localStorage から ID を取得し、該当する師範データを特定
  const selectedId =
    typeof window !== 'undefined' ? localStorage.getItem('selectedAvatarId') : null;
  const avatar =
    PERSONALITIES.find((p) => p.personalityId === Number(selectedId)) || PERSONALITIES[0];

  return (
    <Backdrop
      open={open}
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Stack spacing={4} alignItems="center">
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* 師範の画像 */}
          <Avatar
            src={avatar.avatarUrl}
            alt={avatar.name}
            slotProps={{
              img: {
                sx: {
                  objectFit: 'cover',
                  objectPosition: 'center 20%',
                },
              },
            }}
            sx={{
              width: 140,
              height: 140,
              border: '4px solid',
              borderColor: 'primary.main',
              boxShadow: '0 0 20px rgba(25, 118, 210, 0.5)',
            }}
          />
          {/* 進捗リングを画像の外周に配置 */}
          <CircularProgress
            variant={phase === 'uploading' ? 'determinate' : 'indeterminate'}
            value={progress}
            size={160} // Avatarより少し大きく
            thickness={2}
            sx={{
              position: 'absolute',
              color: 'primary.light',
            }}
          />
        </Box>

        <Box textAlign="center" sx={{ px: 3 }}>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
            {avatar.name}が{phase === 'uploading' ? '動画を確認中...' : '分析中...'}
          </Typography>

          <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'primary.light' }}>
            {`「${avatar.message}」`}
            {phase === 'uploading' && ` (${Math.round(progress)}%)`}
          </Typography>
        </Box>
      </Stack>
    </Backdrop>
  );
};
