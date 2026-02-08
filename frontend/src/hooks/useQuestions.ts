// 質問取得後のデータ整形、エラー分岐
import { fetchQuestionData } from '@/api/questions';
import { Question } from '@/types/question';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useGroupedQuestions = () => {
  const query = useQuery({
    queryKey: ['questions'],
    queryFn: fetchQuestionData,
    staleTime: Infinity,
    select: (responseData) => {
      return responseData.questions.reduce(
        (acc, q) => {
          if (!acc[q.categoryName]) acc[q.categoryName] = [];
          acc[q.categoryName].push(q);
          return acc;
        },
        {} as Record<string, Question[]>,
      );
    },
  });

  // エラーオブジェクトからステータスコードを取得
  const status = axios.isAxiosError(query.error) ? query.error.response?.status : undefined;

  return {
    ...query,
    // 500系、またはレスポンスが返ってこないネットワークエラー
    isCriticalError: query.isError && (!status || status >= 500),
    // クライアント側で対処可能なエラー
    isClientError: query.isError && status !== undefined && status >= 400 && status < 500,
  };
};
