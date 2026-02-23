import { MediaErrorInfo, MediaState } from '@/types/media';
import { Question } from '@/types/question';

// ========================================
// Recording State（録画の状態管理）
// ========================================

// ほとんどのフェーズで共通して保持するコンテキスト
interface RecordingBase {
  mediaState: MediaState;
  question: Question;
}

export type RecordingState =
  | { phase: 'initializing'; mediaState?: MediaState } // 初期化時のみ question がない
  | ({ phase: 'ready' } & RecordingBase)
  | ({ phase: 'countdown'; count: number } & RecordingBase)
  | ({
      phase: 'recording';
      elapsed: number;
      totalSeconds: number;
      isEndingSoon: boolean;
    } & RecordingBase)
  | ({ phase: 'completed'; videoBlob: Blob; videoURL: string; elapsed: number } & RecordingBase)
  | ({ phase: 'uploading'; progress: number } & RecordingBase)
  | ({ phase: 'analyzing'; pollCount: number } & RecordingBase)
  | ({ phase: 'error'; error: RecordingError } & RecordingBase);

// ========================================
// Recording Error（エラー情報）
// ========================================

export type ErrorSeverity = 'recoverable' | 'fatal';

export interface RecordingError {
  code: string;
  message: string;
  phase: RecordingState['phase'];
  severity: ErrorSeverity;

  // デバイス関連エラーの場合に使用
  mediaError?: MediaErrorInfo;

  // リカバリーアクション
  recovery?: {
    label: string;
    action: () => Promise<void>;
  };

  // デバッグ用
  details?: unknown;
}

// ========================================
// API Request/Response
// ========================================
// avatarId,personalityIdなどpersonality.ts(type)とも重複する

// 署名付きURL取得
export interface PreUploadRequest {
  questionId: number;
  characterConfig: {
    avatarId: number;
    personalityId: number;
  };
}

export interface PreUploadResponse {
  answerId: string;
  uploadUrl: string;
  storageKey: string;
}

// 分析状態確認
export type AnalysisStatus = 'pending' | 'uploaded' | 'processing' | 'completed' | 'failed';

export interface AnswerDetail {
  answerId: string;
  analysisStatus: AnalysisStatus;
  categoryName: string;
  questionContent: string;
  createdAt: string;
  characterConfig: {
    avatarId: number;
    personalityId: number;
  };
  transcript: string | null;
  feedback: FeedbackData | null;
}

export interface FeedbackData {
  grade: string;
  goodPoints: string;
  improvePoints: string;
  nextTip: string;
  interviewerComment?: string; // 今後、面接官からのコメントも作る場合
  videoUrl: string;
  storageKey: string;
}

export interface AnalysisResponse extends AnswerDetail {
  analysisStatus: AnalysisStatus;
  error?: {
    code: string;
    message: string;
  };
}

// 履歴一覧取得
export interface HistoryItem {
  answerId: string;
  categoryName: string;
  questionContent: string;
  createdAt: string;
  characterConfig: {
    avatarId: number;
    personalityId: number;
  };
  feedback: {
    grade: string;
  };
}

export interface HistoryResponse {
  answers: HistoryItem[];
  meta: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
}
