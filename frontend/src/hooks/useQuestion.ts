import { fetchQuestion } from '@/api/recording';
import { useQuery } from '@tanstack/react-query';

export const useQuestion = (questionId: string | undefined) => {
  return useQuery({
    queryKey: ['question', questionId],
    queryFn: async () => {
      if (!questionId || isNaN(Number(questionId))) {
        // PageErrorHandler でキャッチ
        throw new Error('INVALID_ID');
      }
      return await fetchQuestion(Number(questionId));
    },
    enabled: !!questionId,
    staleTime: Infinity,
    retry: (failureCount, error: any) => {
      const status = error.response?.status;
      if (status === 400 || status === 401 || status === 403 || status === 404) return false;
      return failureCount < 2;
    },
  });
};
