import { fetchQuestion } from '@/api/recording';
import { useQuery } from '@tanstack/react-query';

export const useQuestion = (questionId: string | undefined) => {
  const query = useQuery({
    queryKey: ['question', questionId],
    queryFn: async () => {
      if (!questionId || isNaN(Number(questionId))) {
        throw new Error('不正な質問です');
      }
      return await fetchQuestion(Number(questionId));
    },
    enabled: !!questionId,
    staleTime: Infinity,
    // 404などはリトライしても解決しない
    retry: (failureCount, error: any) => {
      const status = error.response?.status;
      if (status === 404 || status === 400) return false;
      return failureCount < 2;
    },
  });

  const status = (query.error as any)?.response?.status;

  return {
    ...query,
    // 500系またはネットワークエラーを「致命的」と定義
    isCriticalError: query.isError && (!status || status >= 500),
    // 400系（存在しないIDなど）を「クライアントエラー」と定義
    isClientError: query.isError && status >= 400 && status < 500,
  };
};
