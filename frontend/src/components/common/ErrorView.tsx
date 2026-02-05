// 500系エラーのUI
import { MainLayout } from '@/components/layout/MainLayout';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const ErrorView = ({ message, onRetry }: { message: string; onRetry?: () => void }) => {
  const navigate = useNavigate();
  return (
    <MainLayout>
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h6" gutterBottom>
          システムエラーが発生しました
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          {message}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          {onRetry && (
            <Button variant="contained" onClick={onRetry}>
              やり直す
            </Button>
          )}
          <Button variant="outlined" onClick={() => navigate('/')}>
            トップへ戻る
          </Button>
        </Box>
      </Box>
    </MainLayout>
  );
};
