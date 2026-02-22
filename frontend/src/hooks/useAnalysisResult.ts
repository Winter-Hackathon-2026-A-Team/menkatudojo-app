import { checkAnalysisStatus } from '@/api/recording';
import { useQuery } from '@tanstack/react-query';

export const useAnalysisResult = (answerId: string | undefined) => {
  return useQuery({
    queryKey: ['analysisResult', answerId],
    queryFn: () => checkAnalysisStatus(answerId!),
    enabled: !!answerId, // answerId がある時だけ実行
    staleTime: 1000 * 60 * 5, // 5分間はキャッシュを新鮮とみなす
  });
};
