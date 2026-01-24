# ダッシュボード機能設計

## 1. ダッシュボード表示 ====================================================

### a. 役割
- ユーザーの最新の練習履歴3件、統計情報を表示する

### b. 状態管理
- [GlobalState] user: user情報（初期値：null）
- [LocalState] status: idle | loading（初期値） | error ...通信状態の管理
- [LocalState] latestAnswers: Answers[]（初期値：[]） ...最新の練習動画3件の配列
- [LocalState] stats：StatsObject() （初期値:null）...累計スコアなどの情報
- [LocalState] fetchError: string | null（初期値: null）...GET失敗時のメッセージを格納

### c. 関数
- 関数名：fetchDashboardData
- エンドポイント：/api/user/dashboard
- メソッド：GET
- 引数：なし
- 返り値：
  - 成功
    {
    "stats": {
    "totalCount": integer,
    "totalDays": integer,
    "totalDurationSeconds": integer
    },
    "latestAnswers": [
    { "answerId": "string",
    ”categoryName”: “string”,
    ”questionContent”: “string”,
    "createdAt": "string",
    "score": integer,
    ”personalityId”: integer }
    ]
    }

  - 失敗
    {
    "code": "ERROR_CODE_STRING",
    }

### d. ロジック
- 初期化：
  - status: loadingにセット
  - fetchError, submitErrorをクリア
- /api/user/dashbordにGETリクエストを送る
- 成功：
  - stats, latestAnswersにレスポンスを保存。
  - もしlatestAnswers.length===0なら、”まずは練習してみよう！”に差し替える。
  - もしstats===nullなら、表示部分を"0"にする
  - status: idleにセット
- 失敗：
  - 通信エラー:
    - 非同期処理が開始できない | レスポンスが得られない | サーバーエラー
    - status: error
    - fetchErrorに再試行の案内を入れ、ボタン（fetchDashboardData()）を配置し処理を終了


## 2. プロフィール変更 ====================================================

### a. 役割/UXフロー
- username, email, passwordの変更ができる
  - ハンバーガーメニューからプロフィール変更を選択
  - 表示されたモーダルに必要項目を入力
  - 変更ボタンを押下、反映される

### b. 状態管理
- [GlobalState] user: user情報（初期値：null）
- [GlobalState] authStatus: initializing（初期値）| authenticated（成功） | unAuthenticated（否認） | error（通信エラー） ...認証の状態
- [LocalState] status: loading（初期値） | error ...通信状態の管理
- [LocalState] formData:
  { "username": "", "newEmail": "", "confirmEmail": "", "currentPassword": "", "newPassword": "", "confirmPassword": ""} ...入力内容の保持
- [LocalState] isSubmitting: boolean（初期値false）...POST中のみtrue
- [LocalState] isModalOpen: boolean(初期値false) ...プロフィール変更モーダルが出ているか
- [LocalState] errorMessage: Record<string> | null ...バリデーション等の項目別エラー
- [LocalState] globalError: string | null ...モーダル内での全体エラー

### c-1. 関数
- 関数名: updateProfile
- エンドポイント: /api/user/profile
- メソッド: PATCH
- 引数: username, email, currentPassword（本人確認用）
- 返り値:
  - 成功:
    { “userId”: “string”,
    ”username”: “string”,
    }
  - 失敗:
    { "code": "ERROR_CODE_STRING" }

### d-1. ロジック
- 初期化:
  - status: loadingにセット
  - errorMessage, globalErrorをクリア
  - isSubmitting: trueにセットしボタンを連打防止
- バリデーション（front側制御）:
  - formData: 未入力項目がある場合 | usernameが100文字以上 | emailの形式不正 | new/confirmEmailが不一致
    - status: error, errorMessage: <string>をセット, submitButton: enabledにセットし処理を中断
- /api/user/profileにPATCHリクエストを送る
- 成功：
  - user: responseデータを保存
  - IsModalOpen: falseにセット、モーダルを閉じる
  - formDataをクリア
  - isSubmitting: falseにセット、ボタンを押せるようにする
  - 注）CSRFtokenが更新される
- 失敗：
  - 通信エラー：
    - status:error, globalError: "サーバーで問題が発生しました..." をセットし処理を終了
    - isSubmitting: falseにセット、ボタンを押せるようにする
    - formDataの値を保持し処理を終了
  - Email重複（409）, バリデーションエラー（422）：
    - status:error, errorMessage: <string> を出力
    - isSubmitting: falseにセット、ボタンを押せるようにする
    - formDataの値を保持し処理を終了
  - 共通:
    - エラーはモーダル内に限定。本体画面の操作は可能



### c-2. 関数
- 関数名: updatePassword
- エンドポイント: /api/user/password
- メソッド: PATCH
- 引数: currentPassword, newPassword, confirmPassword
- 返り値:
  - 成功:
    { “message”: “success” }
  - 失敗:
    { "code": "ERROR_CODE_STRING" }

### d-2. ロジック
- 初期化:
  - status: loadingにセット
  - errorMessage, globalErrorをクリア
  - isSubmitting: trueにセットしボタンを連打防止
- バリデーション（front側制御）:
  - formData: 未入力項目がある場合 | passwordが8文字以下 | new/confirmPasswordが不一致
    - status: error, errorMessage: <string>をセット, submitButton: enabledにセットし処理を中断
- /api/user/passwordにPATCHリクエストを送る
- 成功：
  - 注）CSRFtokenが更新される
- 失敗：
  - 通信エラー：
    - status:error, globalError: "サーバーで問題が発生しました..." をセット
    - isSubmitting: falseにセット、ボタンを押せるようにする
    - formDataの値を保持し処理を終了
  - バリデーションエラー（422）：
    - status:error, errorMessage: <string> を出力
    - isSubmitting: falseにセット、ボタンを押せるようにする
    - formDataの値を保持し処理を終了
  - 共通:
    - エラーはモーダル内に限定。本体画面の操作は可能