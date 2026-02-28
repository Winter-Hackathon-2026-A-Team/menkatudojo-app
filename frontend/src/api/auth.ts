import client from '@/api/client';
import { AuthResponse, UpdatePasswordRequest, UpdateProfileRequest, User } from '@/types/auth';

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

  // プロフィール更新
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await client.put<User>('/user/profile', data);
    return response.data;
  },

  // パスワード更新
  updatePassword: async (data: UpdatePasswordRequest): Promise<{ message: string }> => {
    const response = await client.put<{ message: string }>('/user/password', data);
    return response.data;
  },
};
