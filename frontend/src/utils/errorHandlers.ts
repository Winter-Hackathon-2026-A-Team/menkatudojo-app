// エラーオブジェクトをユーザー向けの言葉に変換する役割
import axios from 'axios';

export const getErrorMessage = (error: unknown): string => {
  // 型安全性の担保：unknown型で受け取り、axiosのエラーかチェックする
  if (!axios.isAxiosError(error)) return '予期せぬエラーが発生しました。';

  const status = error.response?.status;
  // バックエンドからのレスポンスボディの型を想定
  const data = error.response?.data as { code?: string } | undefined;
  const code = data?.code;

  // 1. 500系（サーバー側）の汎用的な処理
  if (status && status >= 500) {
    if (status === 503) return '現在メンテナンス中です。';
    return 'システムエラーが発生しました。時間をおいて再度お試しください。';
  }

  // 2. 400系（クライアント側・共通）
  if (status === 401) return 'セッションが切れました。再度ログインしてください。';
  if (status === 403) return 'アクセス権限がありません。';
  if (status === 429) return '時間を置いてから再度お試しください。';

  // 3. 機能固有のルール（codeで分岐）
  // 今後、バックエンドとコードが確定した際にここを更新する
  switch (code) {
    case 'QUESTIONS_NOT_FOUND':
      return '対象の質問が見つかりませんでした。';
    case 'USER_NOT_FOUND':
      return 'ユーザー情報が見つかりません。';
    case 'VALIDATION_ERROR':
      return '入力内容に不備があります。';
    default:
      // statusが404でcodeがない場合なども含めたデフォルト
      if (status === 404) return 'ページが見つかりませんでした。';
      return 'データの取得に失敗しました。';
  }
};
