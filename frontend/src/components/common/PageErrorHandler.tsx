import { getErrorMessage, getErrorStatus } from '@/utils/errorHandlers';
import { Navigate } from 'react-router-dom';
import { EmptyContentView } from './EmptyContentView';
import { ErrorView } from './ErrorView';

interface Props {
  error: unknown;
  onRetry?: () => void;
}

export const PageErrorHandler = ({ error, onRetry }: Props) => {
  const status = getErrorStatus(error);
  const message = getErrorMessage(error);

  // 1. 認証切れ (401)　即座にログイン画面へリダイレクトさせる
  if (status === 401) {
    return <Navigate to="/login" replace />;
  }

  // 2. 権限なし・見つからない (403, 404)　表示する中身がない EmptyContentView
  if (status === 403 || status === 404) {
    return <EmptyContentView title="表示できるデータがありません" message={message} />;
  }

  // 3. サーバーエラー・その他 (500系 or ネットワークエラー)　やり直し（onRetry）を促すErrorView
  return <ErrorView message={message} onRetry={onRetry} />;
};
