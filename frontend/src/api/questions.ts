import client from '@/api/client';
import { QuestionResponse } from '@/types/question';

/**
 * 質問一覧取得 (GET /questions)
 */
export const fetchQuestionData = async (): Promise<QuestionResponse> => {
  const response = await client.get<QuestionResponse>('/questions');
  return response.data;
};

/**
 * 質問作成 (POST /questions)
 */
export const createQuestion = async (data: {
  categoryName: string;
  questionContent: string;
}): Promise<{ message: string }> => {
  const response = await client.post<{ message: string }>('/questions', data);
  return response.data;
};
