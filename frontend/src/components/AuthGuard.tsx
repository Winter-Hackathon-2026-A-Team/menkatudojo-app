import { ErrorView } from '@/components/common/ErrorView';
import { LoadingView } from '@/components/common/LoadingView';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

export const AuthGuard = () => {
  const { status, initializeAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'unAuthenticated') {
      navigate('/login');
    }
  }, [status, navigate]);

  if (status === 'initializing') return <LoadingView />;
  if (status === 'error')
    return <ErrorView message="通信に失敗しました" onRetry={initializeAuth} />;

  return status === 'authenticated' ? <Outlet /> : null;
};
