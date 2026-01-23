### 使用技術と選定理由
- Vite:修正がすぐに画面に反映され、高速な開発環境が得られるため
- Axios:baseURL等、HTTP通信の共通設定をカプセル化して保守性を高めるため
Tailwind Css:一貫性のあるデザインを迅速に実装するため
ESLint／Prettier：コードの品質の担保、書式の自動的な統一

 備考：
- 今後の構成によってはbaseURLを.envから取得、およびDockerfileの修正を検討 