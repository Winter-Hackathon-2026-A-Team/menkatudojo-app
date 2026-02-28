// components/features/authority-check/DeviceErrorView.tsx
import { MediaErrorInfo } from '@/types/media';
import WarningAmbiguityIcon from '@mui/icons-material/WarningAmber';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';

interface Props {
  error: MediaErrorInfo;
  onRetry: () => void;
}

export const DeviceErrorView = ({ error, onRetry }: Props) => {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 4, textAlign: 'center', maxWidth: 500, mx: 'auto', borderStyle: 'dashed' }}
    >
      <Stack spacing={3} alignItems="center">
        <WarningAmbiguityIcon color="error" sx={{ fontSize: 64 }} />
        <Box>
          <Typography variant="h6" gutterBottom color="error.main">
            {error.type === 'permission_denied' && 'カメラ・マイクの使用を許可してください'}
            {error.type === 'device_not_found' && 'デバイスが見つかりません'}
            {error.type === 'already_in_use' && 'デバイスが他のアプリで使用中です'}
            {error.type === 'unknown' && '予期せぬエラーが発生しました'}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {error.detail}
          </Typography>
        </Box>
        <Box>
          {error.type === 'permission_denied' ? (
            <Stack spacing={2}>
              <Typography
                variant="body2"
                sx={{ bgcolor: 'amber.50', p: 2, borderRadius: 1, border: '1px solid orange' }}
              >
                <strong>設定変更の手順:</strong>
                <br />
                1. ブラウザのアドレスバー左側にある「鍵アイコン（または設定アイコン）」をクリック
                <br />
                2. カメラとマイクを「許可」に変更
                <br />
                3. 変更後、以下の「ページを再読み込み」を押してください
              </Typography>
              <Button
                variant="contained"
                onClick={() => window.location.reload()}
                color="warning"
              >
                ページを再読み込みして再試行
              </Button>
            </Stack>
          ) : (
            <Button variant="contained" onClick={onRetry}>
              再試行する
            </Button>
          )}
        </Box>
      </Stack>
    </Paper>
  );
};
