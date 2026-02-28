import { fetchQuestionData } from '@/api/questions';
import { Question } from '@/types/question';
import { useQuery } from '@tanstack/react-query';

export const useGroupedQuestions = () => {
  return useQuery({
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
    retry: (failureCount, error: any) => {
      const status = error.response?.status;
      if (status === 401 || status === 403 || status === 404) return false;
      return failureCount < 2;
    },
  });
};
