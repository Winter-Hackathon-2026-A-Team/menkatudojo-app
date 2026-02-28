import { fetchHistory } from '@/api/recording';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export const useHistory = (page: number, limit: number = 6) => {
  return useQuery({
    queryKey: ['history', page, limit],
    queryFn: () => fetchHistory(page, limit),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error: any) => {
      const status = error.response?.status;
      if (status === 401 || status === 403 || status === 404) return false;
      return failureCount < 2;
    },
  });
};
