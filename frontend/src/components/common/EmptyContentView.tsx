// 400系エラー＋値がない場合に出す
import { Box, Button, Typography } from '@mui/material';
import { MainLayout } from '../layout/MainLayout';

interface Props {
  title?: string;C
  message?: string;
  onRetry?: () => void;
  actionText?: string;
}

export const EmptyContentView = ({
  title = '表示できる情報がありません',
  message = '条件を変更するか、しばらく時間を置いてから再度お試しください。',
  onRetry,
  actionText = 'ページを更新する',
}: Props) => (
  <MainLayout>
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="outlined" onClick={onRetry}>
          {actionText}
        </Button>
      )}
    </Box>
  </MainLayout>
);
