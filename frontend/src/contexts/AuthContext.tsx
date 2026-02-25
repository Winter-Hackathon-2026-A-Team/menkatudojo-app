import { authApi } from '@/api/auth';
import { ErrorView } from '@/components/common/ErrorView';
import { AuthState } from '@/types/auth';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({
    status: 'initializing',
    user: null,
  });

  // 初期化：アプリ起動時にセッションがあるか確認
  const initializeAuth = async () => {
    setState((prev) => ({ ...prev, status: 'initializing' }));
    try {
      const userData = await authApi.initialize();
      setState({ status: 'authenticated', user: userData });
    } catch (error: any) {
      if (error.response?.status === 401) {
        setState({ status: 'unAuthenticated', user: null });
      } else {
        setState({ status: 'error', user: null });
      }
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  // ログイン
  const login = async (email: string, password: string) => {
    const userData = await authApi.login(email, password);
    setState({ status: 'authenticated', user: userData });
  };

  // 新規登録
  const signup = async (username: string, email: string, password: string) => {
    const userData = await authApi.signup(username, email, password);
    setState({ status: 'authenticated', user: userData });
  };

  // ログアウト
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      document.cookie = 'csrf_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      queryClient.clear();
      // 4. Stateを更新して画面を「未認証」に切り替える
      setState({ status: 'unAuthenticated', user: null });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, initializeAuth }}>
      {state.status === 'error' ? (
        <ErrorView message="認証情報の取得に失敗しました。" onRetry={initializeAuth} />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthはAuthProvider内で使用してください');
  }
  return context;
};
