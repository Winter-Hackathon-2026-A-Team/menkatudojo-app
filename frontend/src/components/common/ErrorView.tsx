// TODO：UI調整する
import { useNavigate } from 'react-router-dom';

export const ErrorView = ({ message, onRetry }: { message: string; onRetry?: () => void }) => {
  const navigate = useNavigate();
  return (
    <div>
      <h2>サーバーエラーが発生しました</h2>
      <p>{message}</p>
      {onRetry && <button onClick={onRetry}>やり直す</button>}
      <button onClick={() => navigate('/')}>トップへ戻る</button>
    </div>
  );
};
