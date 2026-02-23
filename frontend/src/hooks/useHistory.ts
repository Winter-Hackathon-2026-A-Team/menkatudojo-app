import { fetchHistory } from '@/api/recording';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export const useHistory = (page: number, limit: number = 6) => {
  return useQuery({
    queryKey: ['history', page, limit], // pageごとにキャッシュを分ける
    queryFn: () => fetchHistory(page, limit),

    placeholderData: keepPreviousData,

    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  });
};
