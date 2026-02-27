// import { HistoryItem } from '@/types/recording';
// import { DashboardResponse } from '@/types/dashboard';

// const MOCK_DASHBOARD_DATA: DashboardResponse = {
//   stats: {
//     totalCount: 25,
//     totalDays: 7,
//     totalDurationSeconds: 3600,
//   },
//   latestAnswers: [
//     {
//       answerId: 'ans-001',
//       categoryName: '自己紹介',
//       questionContent: 'あなたの強みと弱みを教えてください。',
//       createdAt: new Date().toISOString(),
//       characterConfig: {
//         avatarId: 1, // number型
//         personalityId: 101,
//       },
//       feedback: {
//         grade: 'A',
//       },
//     },
//     {
//       answerId: 'ans-002',
//       categoryName: '課題解決と適応能力',
//       questionContent: '過去に経験した最大の挫折や失敗は何ですか？また、そこから何を学び、その後の行動にどう活かしましたか？',
//       createdAt: new Date(Date.now() - 86400000).toISOString(),
//       characterConfig: {
//         avatarId: 2,
//         personalityId: 102,
//       },
//       feedback: {
//         grade: 'B',
//       },
//     },
//     {
//       answerId: 'ans-003',
//       categoryName: '問題解決と適応能力',
//       questionContent: '意見の異なる相手と合意形成を図らなければならない時、どのような手順や配慮でコミュニケーションを取りますか？',
//       createdAt: new Date(Date.now() - 172800000).toISOString(),
//       characterConfig: {
//         avatarId: 3,
//         personalityId: 103,
//       },
//       feedback: {
//         grade: 'C',
//       },
//     },
//   ],
// };

// /**
//  * ダッシュボードデータを取得する（モック）
//  */
// export const fetchDashboardData = async (): Promise<DashboardResponse> => {
//   // 通信遅延のシミュレーション
//   await new Promise((resolve) => setTimeout(resolve, 800));

//   return MOCK_DASHBOARD_DATA;
// };


// 本番用
import client from '@/api/client';
import { DashboardResponse } from '@/types/dashboard';

export const fetchDashboardData = async (): Promise<DashboardResponse> => {
  const { data } = await client.get<DashboardResponse>('/user/dashboard');
  return data;
};