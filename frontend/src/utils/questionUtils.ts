import { Question } from '@/types/question';

// ランダムにIDを抽出する
export const getRandomQuestionId = (
  groupedQuestions: Record<string, Question[]>
): number | null => {
  // すべてのカテゴリの質問を1つの配列に
  const allQuestions = Object.values(groupedQuestions).flat();
  
  if (allQuestions.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * allQuestions.length);
  
  return allQuestions[randomIndex].questionId;
};