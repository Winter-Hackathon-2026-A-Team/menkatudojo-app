import { SignupForm } from '@/components/auth/SignupForm';
import { useAuth } from '@/contexts/AuthContext';
import { ApiErrorResponse } from '@/types/auth';
import { Alert, Box, Container, Link, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 各フィールドのエラーを一括でSignupFormに渡す
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSignupSubmit = async (username: string, email: string, password: string) => {
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({}); // 個別エラー

    try {
      await signup(username, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      const data = err.response?.data as ApiErrorResponse;

      if (!data) {
        setError('接続に失敗しました。');
        return;
      }

      switch (data.code) {
        case 'VALIDATION_ERROR':
          // APIからのフィールドごとのエラー
          const newErrors: Record<string, string> = {};
          data.details?.forEach((detail) => {
            newErrors[detail.field] =
              detail.reason === 'too_short' ? '文字数が足りません' : '形式が正しくありません';
          });
          setFieldErrors(newErrors);
          break;

        case 'EMAIL_ALREADY_EXISTS':
          setError('このメールアドレスは既に登録されています。');
          break;

        default:
          setError('登録に失敗しました。時間をおいて再度お試しください。');
      }
    } finally {
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
          新規登録
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 5. フォームコンポーネント */}
        <SignupForm
          onSignup={handleSignupSubmit}
          externalErrors={fieldErrors}
          isLoading={isSubmitting}
        />
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            既にアカウントをお持ちの方 {''}
            <Link component={RouterLink} to="/login" variant="body2">
              ログイン
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};
