# フロントエンド認証設計

## 1. 認証初期化 ====================================================

### a. 役割
- アプリへのアクセス時・リロード時にsessionによる認証チェックを受け、CSRFtokenを受け取る

### b. 状態管理
- [GlobalState] user: user情報（初期値：null）
- [GlobalState] authStatus: initializing（初期値）| authenticated（成功） | unAuthenticated（否認） | error（通信エラー） ...認証の状態

### c. 関数
- 関数名：initializeAuth
- エンドポイント：/api/auth/initialize
- メソッド：GET
- 引数：なし
- 返り値：
  - 成功
    { “userId”: “string”,
    ”username”: “string”,
    }
  - 失敗
    { ”code”: “UNAUTHORIZED”,
    ”user”: null
    }

### d. ロジック
- 初期化：
  - authStatus: initializingにセット
  - /auth/initializeにGETリクエストを送る
- 成功：
  - authStatus: authenticated, user: responseデータを保存
- 失敗：
  - session無効：authStatus: unauthenticated, user: null, ログイン画面へ遷移
  - 通信エラー：authStatus: error,　user: null, エラー画面に遷移orログイン画面に遷移
- 注）成功・失敗ともにResponse HeaderにCSRFtokenが付与される

### e. CSRF対策
- Double SubmitCookie方式
- backendがResponse Headerに載せたCSRFtoken（HttpOnly=false）を受け取る
- 以降、GET以外のRequest（POST/PUT/DELETE）のHeader（X-XSRF-TOKEN）に付与（共通設定）
- backendがRequest CookieとRequest CustomHeader（X-XSRF-TOKEN）のCSRFtokenを検証、不一致の場合はRequestを拒否する

## 2. ログイン ====================================================

### a. UXフロー
- ユーザーがフォームに入力
- ログインボタンを押下
- 認証成功後、ダッシュボードへ遷移

### b. 状態管理
- [globalState] globalMessage: string | null, error | success | info | null...全体表示用のメッセージ
- [GlobalState] user: user情報（初期値：null）
- [GlobalState] authStatus: initializing（初期値）| authenticated（成功） | unAuthenticated（否認） | error（通信エラー） ...認証の状態
- [LocalState] status: loading（初期値） | error ...通信状態の管理
- [LocalState] isSubmitting: boolean（初期値false）...POST中のみtrue
- [LocalState] formData: { "email": "", "password": ""} ...入力内容の保持
- [LocalState] errorMessage: Record<string> | null ...バリデーション等の項目別エラー

### c. 関数
- 関数名: handleLogin
- エンドポイント: /api/auth/login
- メソッド: POST
- 引数: email, password
- 返り値:
  - 成功:
    { “userId”: “string”,
    ”username”: “string”,
    }
  - 失敗:
    { "code": "INVALID_CREDENTIALS" }

### d. ロジック
- 初期化：
  - status: loadingにセット
  - errorMessage, globalMessageをクリア
  - isSubmitting: trueにセットしボタンを連打防止
- バリデーション（front側制御）
  - formData: 未入力項目がある場合 | emailの形式不正 | passwordが8文字以下
  - status: error, errorMessage: <string>をセット
  - isSubmitting: falseにセット、ボタンを押せるようにして処理を終了
- /api/auth/loginにPOSTリクエストを送る
- 成功：
  - user: responseデータを保存
  - authStatus: authenticatedに更新し、ダッシュボードへ遷移
  - 注）CSRFtokenが更新される
- 失敗：
  - 通信エラー：
    - status:error, globalMessage: "サーバーで問題が発生しました..." をセット
    - isSubmitting: falseにセット、ボタンを押せるようにする
    - formDataの値を保持し処理を終了
  - 認証失敗（401）：
    - status:error, globalMessage: "emailかpasswordのいずれかが不一致..." をセット
    - isSubmitting: falseにセット、ボタンを押せるようにする
    - formDataの値を保持し処理を終了


## 3. 新規登録 ====================================================

### a. UXフロー
- ユーザーがフォームに入力
- 新規登録ボタンを押下
- 認証成功後、ダッシュボードへ遷移

### b. 状態管理
- [globalState] globalMessage: string | null, error | success | info | null...全体表示用のメッセージ
- [GlobalState] user: user情報（初期値：null）
- [GlobalState] authStatus: initializing（初期値）| authenticated（成功） | unAuthenticated（否認） | error（通信エラー） ...認証の状態
- [LocalState] status: loading（初期値） | error ...通信状態の管理
- [LocalState] formData: { "username": "", "email": "", "confirmEmail": "", "password": "", "confirmPassword": "" } ...入力内容の保持
- [LocalState] isSubmitting: boolean（初期値false）...POST中のみtrue
- [LocalState] errorMessage: Record<string> | null ...バリデーション等の項目別エラー

### c. 関数
- 関数名：handleSignup
- エンドポイント：/api/auth/signup
- メソッド：POST
- 引数：username, email, password
- 返り値：
  - 成功
    { “userId”: “string”,
    ”username”: “string”,
    }
  - 失敗
    { "code": "EMIL_ALREADY_EXISTS" }

    {
    "code": "VALIDATTION_ERROR",
    "details": [
    {"field": “email”, "reason": “invalid_format”},
    {"field": “password”, "reason": “too_short”}
    ]
    }

### d. ロジック
- 初期化：
  - status: loadingにセット
  - isSubmitting: trueにセットしボタンを連打防止
  - errorMessage, globalMessageをクリア
- バリデーション（front側制御）
  - formData: 未入力項目がある場合 | usernameが100文字以上 | emailの形式不正 | passwordが8文字以下
    - status: error, errorMessage: <string>をセット
    - isSubmitting: falseにセット、ボタンを押せるようにする
- /api/auth/signupにPOSTリクエストを送る
- 成功：
  - user: responseデータを保存
  - authStatus: authenticatedに更新し、ダッシュボードへ遷移
  - 注）CSRFtokenが更新される
- 失敗：
  - 通信エラー：
    - status:error, globalMessage: "サーバーで問題が発生しました..." をセットし処理を終了
    - isSubmitting: falseにセット、ボタンを押せるようにする
    - formDataの値を保持し処理を終了
    - 注）もしくはindexページに飛ばすか？UXは要検討
  - Email重複（409）, バリデーションエラー（422）：
    - status:error, globalMessage: <string> を出力
    - isSubmitting: falseにセット、ボタンを押せるようにする
    - formDataの値を保持し処理を終了


## 4. ログアウト ====================================================

### a. UXフロー
- ログアウトボタンを押下
- ログイン画面へリダイレクト

### b. 状態管理
- [GlobalState] user: user情報（初期値：null）
- [GlobalState] authStatus: initializing（初期値）| authenticated（成功） | unAuthenticated（否認） | error（通信エラー） ...認証の状態

### c. 関数
- 関数名: handleLogout
- エンドポイント:/api/auth/logout
- メソッド: POST
- 引数: なし
- 返り値: なし

### d. ロジック
- /api/auth/logoutにPOSTリクエストを送る
- authStatus: unAuthenticated, user: nullにセット
- ログインページにリダイレクト(replace:trueにしてブラウザの履歴をスタックさせない)
- 注）CSRFtokenが更新される


## 5. 共通設定 ====================================================
- API通信（axios）への設定
  - 認証維持：セッション維持のためwithCredentialsをtrueに設定
  - CSRF自動化：CSRFtokenがcookieに存在する場合、自動的にX-XSRF-TOKENヘッダーへセットする
