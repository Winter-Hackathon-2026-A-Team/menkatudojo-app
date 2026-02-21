import { Personality } from '@/types/personality';

export const PERSONALITIES: Personality[] = [
  {
    avatarId: 1,
    personalityId: 1,
    name: "優しい師範",
    avatarUrl: "/avatar1.png",
    description: "前向きな気持ちで続けられるよう支えてくれる師範",
  },
  {
    avatarId: 2,
    personalityId: 2,
    name: "熱血師範",
    avatarUrl: "/avatar2.png",
    description: "ユーザーが自身の熱量を表現できているかを評価する師範",
  },
  {
    avatarId: 3,
    personalityId: 3,
    name: "論理的師範",
    avatarUrl: "/avatar3.png",
    description: "回答に論理的な整合性があるかを評価する師範",
  }
];