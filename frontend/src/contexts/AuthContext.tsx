import { authApi } from '@/api/auth';
import { ErrorView } from '@/components/common/ErrorView';
import { LoadingView } from '@/components/common/LoadingView';
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
  // 1. 初期化ロジック：statusをvoid（戻り値なし）に修正
  const initializeAuth = async (): Promise<void> => {
    setState((prev) => ({ ...prev, status: 'initializing' }));
    try {
      const userData = await authApi.initialize();
      setState({ status: 'authenticated', user: userData });
    } catch (error: any) {
      const status = error.response?.status;

      // 2. 認証NG（401, 403）は「未認証」ステートへ
      if (status === 401 || status === 403) {
        setState({ status: 'unAuthenticated', user: null });
      }
      // 3. それ以外のエラー（500やネットワークエラー）
      else {
        const errorMessage =
          status === 500
            ? 'サーバーとの接続に問題が発生しました。時間をおいて再度お試しください。'
            : '通信環境が不安定か、サーバーに応答がありません。ネットワーク設定を確認してください。';

        setState({
          status: 'error',
          user: null,
          errorMessage: errorMessage,
        });
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
      {(() => {
        // 1. エラー時は最優先で ErrorView (Guardの外側でも漏らさない)
        if (state.status === 'error') {
          return <ErrorView message={state.errorMessage ?? '通信失敗'} onRetry={initializeAuth} />;
        }

        // 2. 初期化中 (initializing) は、children を出さずに LoadingView を出す
        if (state.status === 'initializing') {
          return <LoadingView />;
        }

        // 3. 状態が authenticated / unAuthenticated に確定した時だけ、初めて children を通す
        return children;
      })()}
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
