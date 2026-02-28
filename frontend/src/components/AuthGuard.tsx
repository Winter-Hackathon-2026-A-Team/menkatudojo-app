import { ErrorView } from '@/components/common/ErrorView';
import { LoadingView } from '@/components/common/LoadingView';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

export const AuthGuard = () => {
  const { status, initializeAuth, errorMessage } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'unAuthenticated') {
      navigate('/login');
    }
  }, [status, navigate]);


  // 1. ロード中
  if (status === 'initializing') return <LoadingView />;

  // 2. 500エラーなど
  if (status === 'error') {
    return <ErrorView message={errorMessage ?? '通信失敗'} onRetry={initializeAuth} />;
  }

  // 3. 認証済みのみ中身
  if (status === 'authenticated') return <Outlet />;

  // 4. status === 'unAuthenticated' の時は navigate が効くまで何も出さない
  return null;
};
