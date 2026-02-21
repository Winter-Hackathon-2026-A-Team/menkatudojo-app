// アバター（師範）の型定義
export interface Personality {
  avatarId: number; // アバターID
  personalityId: number;     // 性格ID
  name: string;  // alt属性用
  avatarUrl: string;    // アバター画像のパス
  description?: string;  // 師範の説明（UI表示用）
}