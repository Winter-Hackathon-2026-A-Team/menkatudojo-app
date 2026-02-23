import { authApi } from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useMessage } from '@/contexts/MessageContext';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';

// --- 1. 基本情報フォーム ---
const BasicInfoForm = ({ onClose }: { onClose: () => void }) => {
  const { user, initializeAuth } = useAuth();
  const { showMessage } = useMessage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // フロントエンド・バリデーション
    const newErrors: { [key: string]: string } = {};
    if (!formData.username.trim()) newErrors.username = 'ユーザー名は必須です';
    if (formData.password.length < 8)
      newErrors.password = '確認のため8文字以上のパスワードが必要です';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.updateProfile(formData);
      await initializeAuth();
      showMessage('プロフィールを更新しました', 'success');
      onClose();
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErrors({ username: error.response.data.detail?.[0]?.msg || '入力内容に誤りがあります' });
      } else {
        showMessage('更新に失敗しました', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit} sx={{ mt: 1 }} noValidate>
      <TextField
        label="ユーザー名"
        fullWidth
        required
        error={!!errors.username}
        helperText={errors.username}
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
      />
      <TextField
        label="メールアドレス"
        fullWidth
        required
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <TextField
        label="本人確認用パスワード"
        fullWidth
        required
        type="password"
        error={!!errors.password}
        helperText={errors.password || '変更を保存するには現在のパスワードが必要です'}
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <Button type="submit" variant="contained" disabled={isSubmitting}>
        保存
      </Button>
    </Stack>
  );
};

// --- 2. パスワード変更フォーム ---
const PasswordChangeForm = ({ onClose }: { onClose: () => void }) => {
  const { showMessage } = useMessage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: { [key: string]: string } = {};
    if (formData.newPassword.length < 8)
      newErrors.newPassword = '新しいパスワードは8文字以上必要です';
    if (formData.newPassword !== formData.confirmPassword)
      newErrors.confirmPassword = 'パスワードが一致しません';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.updatePassword(formData);
      showMessage('パスワードを変更しました', 'success');
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.detail?.[0]?.msg || '現在のパスワードが正しくありません';
      setErrors({ currentPassword: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit} sx={{ mt: 1 }} noValidate>
      <TextField
        label="現在のパスワード"
        type="password"
        required
        error={!!errors.currentPassword}
        helperText={errors.currentPassword}
        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
      />
      <TextField
        label="新しいパスワード"
        type="password"
        required
        error={!!errors.newPassword}
        helperText={errors.newPassword}
        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
      />
      <TextField
        label="新しいパスワード（確認）"
        type="password"
        required
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
      />
      <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
        更新
      </Button>
    </Stack>
  );
};

// --- 3. メインモーダル ---
export const ProfileEditModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [tabIndex, setTabIndex] = useState(0);
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 'bold' }}>ユーザー設定</DialogTitle>
      <Tabs value={tabIndex} onChange={(_, i) => setTabIndex(i)} variant="fullWidth">
        <Tab label="基本情報" />
        <Tab label="パスワード" />
      </Tabs>
      <DialogContent sx={{ pb: 3 }}>
        {tabIndex === 0 ? (
          <BasicInfoForm onClose={onClose} />
        ) : (
          <PasswordChangeForm onClose={onClose} />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
};
