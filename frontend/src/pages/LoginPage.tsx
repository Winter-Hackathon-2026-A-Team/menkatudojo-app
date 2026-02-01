import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, Box, Container, Link, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // エラーコードとメッセージのマッピング
  const ERROR_MESSAGES: Record<string, string> = {
    INVALID_CREDENTIALS: 'メールアドレスまたはパスワードが正しくありません。',
    // アカウントロックなど、その他のエラーがあれば追記
  };

  const handleLoginSubmit = async (email: string, password: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      // 2. サーバーのエラーコードをメッセージに変換
      const errorCode = err.response?.data?.code || 'INVALID_CREDENTIALS';
      setError(ERROR_MESSAGES[errorCode] || ERROR_MESSAGES['INVALID_CREDENTIALS']);
    } finally {
      // 3. 成功・失敗に関わらずローディングを解除
      setIsSubmitting(false);
    }
  };
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: -8,
        }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 5 }}>
          ログイン
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 5. フォームコンポーネント */}
        <LoginForm onLogin={handleLoginSubmit} isLoading={isSubmitting} />
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            <Link component={RouterLink} to="/signup" variant="body2">
              新規登録はこちら
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};
