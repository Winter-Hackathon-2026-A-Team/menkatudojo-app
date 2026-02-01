// src/components/AuthGuard.tsx
import { ErrorView } from '@/components/common/ErrorView';
import { LoadingView } from '@/components/common/LoadingView';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { status, initializeAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // 完全に未認証（401確定後）ならログインへ
    if (status === 'unAuthenticated') {
      navigate('/login');
    }
  }, [status, navigate]);

  // 読み込み中
  if (status === 'initializing') {
    return <LoadingView />;
  }

  // サーバーエラー（500系や通信障害）
  if (status === 'error') {
    return <ErrorView message="通信に失敗しました" onRetry={initializeAuth} />;
  }

  // 認証済み：中身を表示
  return status === 'authenticated' ? <>{children}</> : null;
};
