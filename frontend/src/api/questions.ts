import client from '@/api/client';
import { Question, QuestionResponse } from '@/types/question';

export const fetchQuestionData = async (): Promise<QuestionResponse> => {
    const response = await client.get<Question[]>('/questions');
    return response.data;
};

// // 本番用 (API定義完全準拠版)
// import { Question, QuestionResponse } from '@/types/question';
// import client from '@/api/client';

// /**
//  * 質問一覧取得 (GET /api/questions)
//  */
// export const fetchQuestionData = async (): Promise<QuestionResponse> => {
//   const response = await client.get<QuestionResponse>('/questions');
  
//   return response.data;
// };

// /**
//  * 質問作成 (POST /api/questions)
//  */
// export const createQuestion = async (data: { 
//   categoryName: string; 
//   questionContent: string; 
// }): Promise<{ message: string }> => {
//   const response = await client.post<{ message: string }>('/questions', data);
//   return response.data;
// };
