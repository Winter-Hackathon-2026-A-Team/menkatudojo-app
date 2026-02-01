// src/pages/DashboardPage.tsx
import { useAuth } from '@/contexts/AuthContext';

export const DashboardPage = () => {
  const { user, status, logout } = useAuth();

  return (
    <div>
      <h1>ダッシュボード</h1>
      <p>{user?.username}さんのダッシュボード</p>
      <button onClick={logout}>ログアウト</button>
    </div>
  );
};
