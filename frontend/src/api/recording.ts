import { AnalysisResponse, PreUploadRequest, PreUploadResponse, HistoryResponse } from '@/types/recording';
import client from '@/api/client';
import { Question } from '@/types/question';
import axios from 'axios';

/**
 * 質問取得
 */
export const fetchQuestion = async (id: number): Promise<Question> => {
  const { data } = await client.get<Question>(`/questions/${id}`);
  return data;
};

/**
 * 署名付きURL取得
 */
export const getPresignedUrl = async (params: PreUploadRequest): Promise<PreUploadResponse> => {
  const { data } = await client.post<PreUploadResponse>('/answers/pre-upload', params);
  return data;
};

/**
 * S3/MinIOへのアップロード
 */
export const uploadToS3 = async (url: string, blob: Blob, onProgress?: (p: number) => void) => {
  await axios.put(url, blob, {
    headers: { 'Content-Type': blob.type },
    onUploadProgress: (e) => {
      const percent = Math.round((e.loaded * 100) / (e.total ?? 1));
      onProgress?.(percent);
    }
  });
};

/**
 * 分析ステータス確認
 */
export const checkAnalysisStatus = async (answerId: string): Promise<AnalysisResponse> => {
  const { data } = await client.get<AnalysisResponse>(`/answers/${answerId}`);
  return data;
};

// /**
//  * 履歴一覧の取得
//  */
export const fetchHistory = async (page: number = 1, limit: number = 6): Promise<HistoryResponse> => {
  const { data } = await client.get<HistoryResponse>('/answers', {
    params: { page, limit }
  });
  return data;
// };
