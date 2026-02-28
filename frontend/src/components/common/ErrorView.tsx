// 500系エラーのUI
import { Box, Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const ErrorView = ({ message, onRetry }: { message: string; onRetry?: () => void }) => {
  const navigate = useNavigate();
  return (
    <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
      <Typography variant="h6" gutterBottom color="error">
        システムエラーが発生しました
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        {message}
      </Typography>

      <Stack direction="row" spacing={2} justifyContent="center">
        {onRetry && (
          <Button variant="contained" onClick={onRetry}>
            やり直す
          </Button>
        )}
        <Button variant="outlined" onClick={() => navigate('/')}>
          トップへ戻る
        </Button>
      </Stack>
    </Box>
  );
};
