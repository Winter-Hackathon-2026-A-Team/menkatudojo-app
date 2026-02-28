import { useMessage } from '@/contexts/MessageContext';
import { Alert, Container } from '@mui/material';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // 追加

export const GlobalMessageBar = () => {
  const { message, clearMessage } = useMessage();
  const location = useLocation();

  useEffect(() => {
    if (message) {
      clearMessage();
    }
  }, [location.pathname]);

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
      <Alert
        // message.type ('success', 'error', 'info', 'warning') をそのまま渡す
        severity={message.type}
        onClose={clearMessage}
        variant="standard"
        sx={{
          borderRadius: '8px',
          fontWeight: 'bold',
          border: (theme) => `1px solid ${theme.palette[message.type].main}40`,
        }}
      >
        {message.text}
      </Alert>
    </Container>
  );
};
