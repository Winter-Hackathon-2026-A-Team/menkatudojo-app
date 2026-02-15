#### 1. ディレクトリ構成と責務

1. `@/api/`: 外部通信の実装。Backend（FastAPI）とのインターフェース。

- `client`: axios設定
- `auth`: 認証関連のAPI
- `questions`: 質問選択関連のAPI
- `recording`: 録画関連のAPI

2. `@/contexts/`: アプリケーション全体のグローバルな状態（認証・メッセージ等）を管理。

- `AuthContext`: ログイン状態の管理。アプリ起動時の初期化（`initialize`）
- `MessageContext`: 全ページ共通のメッセージエリアの管理。

3. `@/components/`: 再利用可能なUIコンポーネント。

- `AuthGuard`: 特定のルートに対するアクセス制限（認証チェック）を担当。
- `/common/`
  - `EmptyContentView`: 400系エラー時の対応画面。
  - `ErrorView`: 500系エラー時の対応画面。
  - `Header`: headerのUI。
  - `LoadingView`: 読み込み中画面のUI。
- `/features/`
  - `questions/QuestionList`：質問選択画面のメインUI（アコーディオン）
  - `authority-check/PersonalitySelector`：アバター選択UI
  - `recording/
      - AnalysisOverlay`：AI分析中のオーバーレイ
      - CountdownOverlay`：録画開始カウントダウンのオーバーレイ
      - RecordingHeader`：録画画面のヘッダーエリアコンポーネント
      - RecordingVideoView`：録画画面のカメラエリアコンポーネント
      - RecordingControls`：録画画面のボタンエリアコンポーネント
- `/layout/`
  - `GlobalMessageBar`：全ページ共通のメッセージエリアのUI
  - `MainLayout`：メインレイアウト（ヘッダー・共通メッセージエリア・各ページのコンテンツの枠組み）
  - `PageHeader`：各ページのアナウンスエリアの枠組み

4. `@/constants/`

- `personalities`: アバター情報をハードコード
- `interviewers`: 面接官情報をハードコード

5. `@/hooks/`

- `useGroupedQuestions`： 質問取得後の状態管理とデータの整形
- `useQuestion`： 質問IDに紐づく質問内容・録画可能時間を取得
- `useAudioAnalyser`： Web Audio APIを使って音量検知
- `useMediaStream`： getUserMediaを使ってカメラ・マイクのストリームを取得
- `useRecording`： 録画関連のロジック
- `useUploadAnswer`： 録画した動画のアップロード関連のロジック

6. `@/pages/`: 各ルートに対応する最上位コンポーネント。

- `TopPage`：ランディングページ
- `LoginPage`：ログイン
- `SignupPage`：新規登録
- `DashboardPage`：ダッシュボード
- `QuestionSelectionPage`：質問選択
- `AuthorityCheckPage`：デバイス権限チェック・アバター選択
- `InterviewSessionPage`：面接練習録画
- `AnalysisResultPage`： 分析結果画面
- `dev/HealthCheckPage`：backend, DBとの疎通確認

7. `@/theme/`: デザインシステム（MUI）のテーマ定義。

8. `@/types/`: TypeScript型定義

9. `@/utils/`:

- `errorHandlers`：backendからのレスポンスコード→ユーザーへのメッセージの変換

#### 2. 設計のルール

- @/pages は複数のコンポーネントを組み合わせて画面を構成する。直接 API 呼び出し（axios等）は書かず、必ず @/api または @/hooks を経由する。
- 一つのファイルは基本的に一つの責務を担う構成を心がける
- すべての Hook（useState, useQuery 等）は、コンポーネント内のあらゆる return 文よりも上に記述する。
