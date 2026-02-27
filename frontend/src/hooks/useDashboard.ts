import { fetchDashboardData } from '@/api/dashboardApi';
import { useQuery } from '@tanstack/react-query';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    staleTime: 1000 * 60 * 5, // 5分間は新鮮とする
  });
};
