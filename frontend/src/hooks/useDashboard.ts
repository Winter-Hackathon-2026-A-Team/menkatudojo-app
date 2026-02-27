import { fetchDashboardData } from '@/api/dashboardApi';
import { useQuery } from '@tanstack/react-query';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error: any) => {
      const status = error.response?.status;
      if (status === 401 || status === 403 || status === 404) return false;
      // 500系やネットワークエラーは2回までリトライ
      return failureCount < 2;
    },
  });
};
