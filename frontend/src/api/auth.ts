import client from '@/api/client';
import { AuthResponse } from '@/types/auth';

export const authApi = {
  // 1. 認証初期化
  initialize: async (): Promise<AuthResponse> => {
    const response = await client.get<AuthResponse>('/auth/initialize');
    return response.data;
  },

  // 2. ログイン
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await client.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  // 3. 新規登録
  signup: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await client.post<AuthResponse>('/auth/signup', { username, email, password });
    return response.data;
  },

  // 4. ログアウト
  logout: async (): Promise<void> => {
    await client.post('/auth/logout');
  },
};
