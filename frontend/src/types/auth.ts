// Type Scriptの型定義

// globalState: 認証状態
export type AuthStatus = 'initializing' | 'authenticated' | 'unAuthenticated' | 'error';

// globalState: userオブジェクト
export interface User {
  userId: string;
  username: string;
}

// globalState: 認証状態＋userの情報の有無
export interface AuthState {
  status: AuthStatus;
  user: User | null;
}

// APIレスポンス(initializeAuth)・success
export interface AuthResponse extends User {}

// APIレスポンス(initializeAuth)・error
export interface AuthErrorResponse {
  code: 'UNAUTHORIZED';
  user: null;
}

// Login/Signup失敗時のエラーコード
export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_ALREADY_EXISTS'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_SERVER_ERROR';

// 4. API失敗時のレスポンス構造（Axiosの error.response.data の中身）
export interface ApiErrorResponse {
  code: AuthErrorCode;
  details?: {
    field: string;
    reason: string;
  }[];
}
