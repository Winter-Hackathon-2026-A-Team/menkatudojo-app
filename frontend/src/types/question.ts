// questionの型定義
export interface Question {
  questionId: number;
  categoryName: string;
  questionContent: string;
  source: 'system' | 'user';
  sortOrder: number;
  durationLimitSeconds: number;
}

export interface QuestionResponse {
  questions: Question[];
}
