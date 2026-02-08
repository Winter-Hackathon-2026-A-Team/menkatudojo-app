// globalMessageのレイアウト
import { useMessage } from '@/contexts/MessageContext';
import { Alert, Container } from '@mui/material';

export const GlobalMessageBar = () => {
  const { message, clearMessage } = useMessage();

  if (!message) return null;

  if (!message) return null;

  return (
    <Container
      maxWidth="lg"
      sx={{
        maxWidth: { lg: '1000px' },
        mt: 1, // ヘッダーとの隙間（8px）
        px: { xs: 2, lg: 0 },
      }}
    >
      <Alert severity={message.type} onClose={clearMessage} sx={{ borderRadius: '8px' }}>
        {message.text}
      </Alert>
    </Container>
  );
};
