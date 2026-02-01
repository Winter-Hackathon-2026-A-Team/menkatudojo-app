// Loginフォーム。未入力のチェックはこちらで。
import { Box, Button, TextField } from '@mui/material';
import React, { useState } from 'react';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

export const LoginForm = ({ onLogin, isLoading }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // メール形式チェック用の正規表現
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let isValid = true;

    // Emailバリデーション
    if (!email) {
      setEmailError('メールアドレスを入力してください');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('有効なメールアドレス形式で入力してください');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Passwordバリデーション
    if (!password) {
      setPasswordError('パスワードを入力してください');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('パスワードは8文字以上で入力してください');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (!isValid) return;
    await onLogin(email, password);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <TextField
        fullWidth
        label="メールアドレス"
        error={!!emailError}
        helperText={emailError}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (emailError) setEmailError('');
        }}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="パスワード"
        type="password"
        error={!!passwordError}
        helperText={passwordError}
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (passwordError) setPasswordError('');
        }}
        sx={{ mb: 4 }}
      />
      <Button type="submit" fullWidth variant="contained" disabled={isLoading} size="large">
        {isLoading ? 'ログイン中...' : 'ログイン'}
      </Button>
    </Box>
  );
};
