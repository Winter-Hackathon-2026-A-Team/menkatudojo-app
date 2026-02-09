import { useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // 追加
import { useMessage } from '@/contexts/MessageContext';
import { Alert, Container } from '@mui/material';

export const GlobalMessageBar = () => {
  const { message, clearMessage } = useMessage();
  const location = useLocation(); // 現在のURLパスを取得

  // ページ遷移（URLパスの変化）を検知してメッセージを消す
  useEffect(() => {
    if (message) {
      clearMessage();
    }
  }, [location.pathname]); // パスが変わるたびに実行

  if (!message) return null;

  return (
    <Container
      maxWidth="lg"
      sx={{
        maxWidth: { lg: '1000px' },
        mt: 1, 
        px: { xs: 2, lg: 0 },
      }}
    >
      <Alert severity={message.type} onClose={clearMessage} sx={{ borderRadius: '8px' }}>
        {message.text}
      </Alert>
    </Container>
  );
};