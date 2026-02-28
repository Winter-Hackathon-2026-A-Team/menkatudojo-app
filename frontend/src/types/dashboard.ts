import { HistoryItem } from './recording';

export interface DashboardStats {
  totalCount: number;
  totalDays: number;
  totalDurationSeconds: number;
}

// ダッシュボードAPI全体のレスポンス型
export interface DashboardResponse {
  stats: DashboardStats;
  latestAnswers: HistoryItem[];
}