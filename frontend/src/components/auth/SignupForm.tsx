// Signupフォーム。未入力チェックはこちらで。レスポンスデータの個別エラーもこちらに流す
// パスワードチェックを強化する場合は追記する
import { Box, Button, TextField } from '@mui/material';
import React, { useState } from 'react';

interface SignupFormProps {
  onSignup: (username: string, email: string, password: string) => Promise<void>;
  isLoading: boolean;
  externalErrors?: {
    username?: string;
    email?: string;
    password?: string;
  };
}

export const SignupForm = ({ onSignup, isLoading , externalErrors}: SignupFormProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [confirmEmailError, setConfirmEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // メール形式チェック用の正規表現
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let isValid = true;

    // ユーザーネームバリデーション
    if (!username) {
      setUsernameError('ユーザー名を入力してください');
      isValid = false;
    } else {
      setUsernameError('');
    }

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

    if (email !== confirmEmail) {
      setConfirmEmailError('メールアドレスが一致しません');
      isValid = false;
    } else {
      setConfirmEmailError('');
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

    if (password !== confirmPassword) {
      setConfirmPasswordError('パスワードが一致しません');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    if (!isValid) return;
    await onSignup(username, email, password);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <TextField
        fullWidth
        label="ユーザーネーム"
        error={!!usernameError}
        helperText={usernameError}
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          if (usernameError) setUsernameError('');
        }}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="メールアドレス"
        error={!!emailError || !!externalErrors?.email}
        helperText={emailError || externalErrors?.email}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (emailError) setEmailError('');
        }}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="メールアドレス（確認用）"
        error={!!confirmEmailError}
        helperText={confirmEmailError}
        value={confirmEmail}
        onChange={(e) => {
          setConfirmEmail(e.target.value);
          if (confirmEmailError) setConfirmEmailError('');
        }}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="パスワード"
        type="password"
        error={!!passwordError || !!externalErrors?.password}
        helperText={passwordError || externalErrors?.password}
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (passwordError) setPasswordError('');
        }}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="パスワード（確認用）"
        type="password"
        error={!!confirmPasswordError}
        helperText={confirmPasswordError}
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          if (confirmPasswordError) setConfirmPasswordError('');
        }}
        sx={{ mb: 4 }}
      />
      <Button type="submit" fullWidth variant="contained" disabled={isLoading} size="large">
        {isLoading ? '登録処理中...' : '新規登録'}
      </Button>
    </Box>
  );
};
