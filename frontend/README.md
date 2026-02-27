### 使用技術と選定理由
- Vite:修正がすぐに画面に反映され、高速な開発環境が得られるため
- Axios:baseURL等、HTTP通信の共通設定をカプセル化して保守性を高めるため
- TanStack Query: サーバー状態（Server State）とクライアント状態を明確に分離するため
- MUI (Material UI):Figmaで構築したデザインを正確に短期間で実装するため
- ESLint／Prettier：コードの品質の担保、書式の自動的な統一

### ディレクトリ構成
- api/: API通信の基盤と各エンドポイントの定義
- hooks/: 複数のコンポーネントで再利用するカスタムフック（状態管理や副作用の分離）
- utils/: 汎用的な関数（文字列整形など）
- assets/: 画像、フォント、アイコンなどの静的リソース
- contexts/: 認証状態などグローバルな状態管理
- pages/: ルーティングと対応する各画面のコンポーネント
- theme/: MUIのテーマの一元管理
- types/: TypeScriptの型定義
 備考：
- 今後の構成によってはbaseURLを.envから取得、およびDockerfileの修正を検討 

### 詳細なファイル構成と設計方針
設計の詳細は [docs/frontend/structure.md](./docs/frontend/structure.md) を参照してください。