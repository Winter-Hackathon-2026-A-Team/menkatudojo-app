import { Question } from '@/types/question';
import { AnalysisResponse, PreUploadRequest, PreUploadResponse } from '@/types/recording';
import axios from 'axios';

// 質問内容・録画可能時間の取得
export const fetchQuestion = async (id: number): Promise<Question> => {
  await new Promise((r) => setTimeout(r, 500));
  return {
    questionId: 1,
    categoryName: 'モック',
    questionContent:
      'api/recording.tsの開発用モックの質問。本番では選択した質問IDのContentが表示される。',
    source: 'system',
    sortOrder: 1,
    durationLimitSeconds: 90,
  };
};

// 署名つきURLの取得
export const getPresignedUrl = async (_: PreUploadRequest): Promise<PreUploadResponse> => {
  await new Promise((r) => setTimeout(r, 500));

  const fileName = `test-video-${Date.now()}.webm`;

  return {
    answerId: 'mock-id-123',
    uploadUrl: `http://localhost:9000/my-app-bucket/${fileName}`,
    storageKey: `mock/path/${fileName}`,
  };
};

// MinIOへのアップロード
export const uploadToS3 = async (url: string, blob: Blob, onProgress?: (p: number) => void) => {
  await axios.put(url, blob, {
    headers: { 'Content-Type': blob.type },
    onUploadProgress: (e) => {
      const percent = Math.round((e.loaded * 100) / (e.total ?? 1));
      onProgress?.(percent);
    },
  });
};

// 分析結果の確認
export const checkAnalysisStatus = async (id: string): Promise<AnalysisResponse> => {
  await new Promise((r) => setTimeout(r, 1500));
  return {
    answerId: id,
    analysisStatus: 'completed',
    characterConfig: {
      avatarId: 1,
      personalityId: 1,
    },
    feedback: {
      score: 'A',
      goodPoints: 'モックデータ:良い点',
      improvePoints: 'モックデータ: 改善点',
      nextTip: 'モックデータ: アドバイス',
      videoUrl: '#',
      storageKey: 'mock-key',
    },
  };
};

// 本番用
// import client from '@/api/client';
// import { PreUploadRequest, PreUploadResponse, AnalysisResponse } from '@/types/recording';
// import { Question } from '@/types/question';
// import axios from 'axios';

// /**
//  * 質問取得
//  */
// export const fetchQuestion = async (id: number): Promise<Question> => {
//   const { data } = await client.get<Question>(`/questions/${id}`);
//   return data;
// };

// /**
//  * 署名付きURL取得
//  */
// export const getPresignedUrl = async (params: PreUploadRequest): Promise<PreUploadResponse> => {
//   const { data } = await client.post<PreUploadResponse>('/answers/pre-upload', params);
//   return data;
// };

// /**
//  * S3/MinIOへのアップロード
//  */
// export const uploadToS3 = async (url: string, blob: Blob, onProgress?: (p: number) => void) => {
//   await axios.put(url, blob, {
//     headers: { 'Content-Type': blob.type },
//     onUploadProgress: (e) => {
//       const percent = Math.round((e.loaded * 100) / (e.total ?? 1));
//       onProgress?.(percent);
//     }
//   });
// };

// /**
//  * 分析ステータス確認
//  */
// export const checkAnalysisStatus = async (answerId: string): Promise<AnalysisResponse> => {
//   const { data } = await client.get<AnalysisResponse>(`/answers/${answerId}`);
//   return data;
// };
