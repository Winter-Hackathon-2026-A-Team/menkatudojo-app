// 挙動確認用のモック
import client from '@/api/client';
import { AuthResponse } from '@/types/auth';

export const authApi = {
  // 1. 認証初期化
  // authApi モック内
  initialize: async (): Promise<AuthResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 開発中、常にログイン状態で始めたい場合はここを有効にする
    return {
      userId: '1',
      username: 'Test_User',
    };

    // 未ログイン状態をテストしたい場合は以下を throw する
    // throw { response: { status: 401 } };
  },

  // 2. ログイン
  login: async (email: string, password: string): Promise<AuthResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 800)); // 通信待機

    // 1. サーバーエラー（500）
    // テストしたい時だけ下のコメントを外す
    // throw { response: { status: 500 } };

    // 2. 正常系：特定のメールアドレスとパスワードのみ許可
    if (email === 'test@example.com' && password === 'password1234') {
      return {
        userId: '1',
        username: 'Test_User',
      };
    }

    // 3. ユーザー起因のエラー（401 Unauthorized）
    // 実際のAPIの挙動に合わせて、responseオブジェクトを模倣してスローする
    throw {
      response: {
        status: 401,
        data: { code: 'INVALID_CREDENTIALS' },
      },
    };
  },

  // 3. 新規登録
  signup: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 1. バリデーションエラー（VALIDATION_ERROR）
    // モックとして「値が特定条件を満たさない場合」を再現
    const validationErrors = [];
    if (!email.includes('@')) {
      validationErrors.push({ field: 'email', reason: 'invalid_format' });
    }
    if (password.length < 8) {
      validationErrors.push({ field: 'password', reason: 'too_short' });
    }

    if (validationErrors.length > 0) {
      throw {
        response: {
          status: 422, // FastAPIのバリデーションエラーは通常422
          data: {
            code: 'VALIDATION_ERROR',
            details: validationErrors,
          },
        },
      };
    }

    // 2. 重複エラー（EMAIL_ALREADY_EXISTS）
    if (email === 'test@example.com') {
      throw {
        response: {
          status: 409,
          data: { code: 'EMAIL_ALREADY_EXISTS' },
        },
      };
    }

    // 3. 成功パターン（test2@example.com）
    if (email === 'test2@example.com') {
      return {
        userId: '2',
        username: username,
      };
    }

    // 4. その他の不明なエラー（500系テスト用）
    throw {
      response: {
        status: 500,
        data: { code: 'INTERNAL_SERVER_ERROR' },
      },
    };
  },

  // 4. ログアウト
  logout: async (): Promise<void> => {
    await client.post('/auth/logout');
  },
};

// TODO：backendとの疎通完了後はこちらのコードのみを残す
// 本番用
// import client from '@/api/client';
// import { AuthResponse } from '@/types/auth';

// export const authApi = {
//   // 1. 認証初期化
//   initialize: async (): Promise<AuthResponse> => {
//     const response = await client.get<AuthResponse>('/auth/initialize');
//     return response.data;
//   },

//   // 2. ログイン
//   login: async (email: string, password: string): Promise<AuthResponse> => {
//     const response = await client.post<AuthResponse>('/auth/login', { email, password });
//     return response.data;
//   },

//   // 3. 新規登録
//   signup: async (username: string, email: string, password: string): Promise<AuthResponse> => {
//     const response = await client.post<AuthResponse>('/auth/signup', { username, email, password });
//     return response.data;
//   },

//   // 4. ログアウト
//   logout: async (): Promise<void> => {
//     await client.post('/auth/logout');
//   },
// };
