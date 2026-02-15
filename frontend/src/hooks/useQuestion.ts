// TODO: エラー対応を実装する
import { useQuery } from '@tanstack/react-query';
import { fetchQuestion } from '@/api/recording';

export const useQuestion = (questionId: string | undefined) => {
  return useQuery({
    queryKey: ['question', questionId],
    queryFn: async () => {
      try {
        if (!questionId) throw new Error('questionId is undefined');
        const data = await fetchQuestion(Number(questionId));
        return data;
      } catch (error) {
        console.error(`[API Error] Failed to fetch question ID: ${questionId}`, error);
        throw error; // TanStack Queryにエラーを伝播させる
      }
    },
    enabled: !!questionId,
    staleTime: Infinity,
    // リトライ設定：とりあえずデフォルト
    retry: 1,
  });
};