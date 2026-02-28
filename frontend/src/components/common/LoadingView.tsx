import { Box, CircularProgress, Typography, Stack } from '@mui/material';

export const LoadingView = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100%',
      bgcolor: 'background.default',
    }}
  >
    <Stack spacing={2} alignItems="center">
      <CircularProgress size={60} thickness={4} color="primary" />
      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          fontWeight: 'medium',
          letterSpacing: 1.2,
        }}
      >
        読み込み中...
      </Typography>
    </Stack>
  </Box>
);