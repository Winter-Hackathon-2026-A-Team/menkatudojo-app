import { authApi } from '@/api/auth';
import { LoadingView } from '@/components/common/LoadingView';
import { AuthState } from '@/types/auth';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
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
    } finally {
      setState({ status: 'unAuthenticated', user: null });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, initializeAuth }}>
      {/* statusがinitializingならLoadingを返し、それ以外でchildrenを返す */}
      {state.status === 'initializing' ? <LoadingView /> : children}
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
