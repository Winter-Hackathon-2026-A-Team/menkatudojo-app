export type MediaErrorType = 'permission_denied' | 'device_not_found' | 'already_in_use' | 'unknown';
export type DeviceType = 'camera' | 'microphone' | 'both' | 'unknown';
export type MediaStatus = 'checking' | 'ready' | 'error';

// エラー・デバイスの種類、ブラウザからのエラーメッセージ
export interface MediaErrorInfo {
  type: MediaErrorType;
  device: DeviceType;
  detail: string;
}

export interface MediaState {
  stream: MediaStream | null;
  videoStatus: MediaStatus;
  audioStatus: MediaStatus;
  audioLevel: number; // 0-100
  error: MediaErrorInfo | null;
}