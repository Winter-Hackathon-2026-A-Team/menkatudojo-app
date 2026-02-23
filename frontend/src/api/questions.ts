// TODO：本番ではコメントアウト
// questionのapiリクエスト
// import { Question, QuestionResponse } from '@/types/question';

// // カテゴリ・質問のモックデータ
// const mockQuestions: Question[] = [
//   {
//     questionId: 1,
//     categoryName: '経験の言語化と自己分析',
//     questionContent:
//       'これまでの経歴の中で、最も成果を出したエピソードと、その成果を出せた要因を自己分析してください。',
//     source: 'system',
//     sortOrder: 1,
//     durationLimitSeconds: 90,
//   },
//   {
//     questionId: 2,
//     categoryName: '経験の言語化と自己分析',
//     questionContent:
//       '周囲からどのような人物だと評価されることが多いですか？また、それに対して自身ではどう捉えていますか？',
//     source: 'system',
//     sortOrder: 2,
//     durationLimitSeconds: 90,
//   },
//   {
//     questionId: 3,
//     categoryName: '経験の言語化と自己分析',
//     questionContent:
//       '仕事において大切にしている『譲れない軸（価値観）』は何ですか？それが組織にどう貢献できると考えますか？',
//     source: 'system',
//     sortOrder: 3,
//     durationLimitSeconds: 90,
//   },
//   {
//     questionId: 4,
//     categoryName: '課題解決と適応能力',
//     questionContent:
//       '過去に経験した最大の挫折や失敗は何ですか？また、そこから何を学び、その後の行動にどう活かしましたか？',
//     source: 'system',
//     sortOrder: 4,
//     durationLimitSeconds: 90,
//   },
//   {
//     questionId: 5,
//     categoryName: '課題解決と適応能力',
//     questionContent:
//       '意見の異なる相手と合意形成を図らなければならない時、どのような手順や配慮でコミュニケーションを取りますか？',
//     source: 'system',
//     sortOrder: 5,
//     durationLimitSeconds: 90,
//   },
//   {
//     questionId: 6,
//     categoryName: '課題解決と適応能力',
//     questionContent:
//       '正解がない、あるいは情報が不足している状況で決断を迫られた際、何を基準に判断を下しますか？',
//     source: 'system',
//     sortOrder: 6,
//     durationLimitSeconds: 90,
//   },
//   {
//     questionId: 7,
//     categoryName: '目標設定と自己研鑽',
//     questionContent:
//       '現在、個人として掲げている中長期的な目標と、その達成のために具体的に継続している習慣はありますか？',
//     source: 'system',
//     sortOrder: 7,
//     durationLimitSeconds: 90,
//   },
//   {
//     questionId: 8,
//     categoryName: '目標設定と自己研鑽',
//     questionContent:
//       '新しい知識やスキルを習得する際、情報の信憑性をどう担保し、効率的に自分のものにしていますか？',
//     source: 'system',
//     sortOrder: 8,
//     durationLimitSeconds: 90,
//   },
//   {
//     questionId: 9,
//     categoryName: '目標設定と自己研鑽',
//     questionContent:
//       '環境の変化（役割の変更や予期せぬトラブル等）に対して、自身のパフォーマンスを維持するために意識していることは何ですか？',
//     source: 'system',
//     sortOrder: 9,
//     durationLimitSeconds: 90,
//   },
// ];

// /**
//  * 質問一覧取得 (GET /api/questions)
//  */
// export const fetchQuestionData = async (): Promise<QuestionResponse> => {
//   await new Promise((resolve) => setTimeout(resolve, 800));

//   // --- モック用のテストコード（確認したいケースに合わせてコメントアウトを切り替える） ---

//   // ケース1: 500サーバーエラーを確認したい場合
//   // throw { response: { status: 500, data: { code: "INTERNAL SERVER ERROR" } }, isAxiosError: true };

//   // ケース2: 404質問なしを確認したい場合
//   // throw { response: { status: 404, data: { code: "QUESTIONS_NOT_FOUND" } }, isAxiosError: true };

//   // ケース3: ネットワークエラー（statusなし）を確認したい場合
//   // throw { isAxiosError: true };
//   return {
//     questions: [...mockQuestions],
//   };
// };

// 本番用
import client from '@/api/client';
import { Question, QuestionResponse } from '@/types/question';

export const fetchQuestionData = async (): Promise<QuestionResponse> => {
    const response = await client.get<Question[]>('/questions');
    return response.data;
};
