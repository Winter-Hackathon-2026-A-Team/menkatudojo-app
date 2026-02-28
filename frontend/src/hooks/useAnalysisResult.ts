import { checkAnalysisStatus } from '@/api/recording';
import { useQuery } from '@tanstack/react-query';

export const useAnalysisResult = (answerId: string | undefined) => {
  return useQuery({
    queryKey: ['analysisResult', answerId],
    queryFn: () => checkAnalysisStatus(answerId!),
    enabled: !!answerId, // answerId がある時だけ実行
    staleTime: 1000 * 60 * 5, // 5分間はキャッシュを新鮮とみなす
    // 500系以外はリトライ停止
    retry: (failureCount, error: any) => {
      const status = error.response?.status;
      if (status === 401 || status === 403 || status === 404) return false;
      return failureCount < 2; // 500系などは2回までリトライ
    },
  });
};
