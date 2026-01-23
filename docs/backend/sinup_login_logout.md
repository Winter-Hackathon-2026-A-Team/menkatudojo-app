## １．機能一覧

- 新規登録
  - ユーザーを作成し、セッションを作成
- ログイン
  - 認証成功時にセッションを発行
- ログアウト
  - セッションを失わせる
- 認証判定
  - Cookieのsession_idからユーザーを特定

## ２．API設計

### 2.1 新規登録

POST `/api/auth/signup`

目的

- 新しいユーザーを作成する
- 作成後、自動的にログイン状態にする

受け取るデータ

- email
- username
- password

成功時

- セッションを発行
- Cookieにsession_idをセット
- HTTP 201

失敗例

- email重複
- バリデーションエラー

---

### 2.2 ログイン

POST `/api/auth/login`

目的

- 認証を行い、ログイン状態にする

受け取るデータ

- email
- password

成功時

- セッションを発行
- Cookieにsession_idをセット
- HTTP 200

失敗時

- 認証失敗
- HTTP 401

---

### 2.3 ログアウト

POST `/api/auth/logout`

目的

- 現在のセッションを失効させる

受け取るデータ

- なし（Cookieからsession_idを取得）

成功時

- sessions.revoked_atを更新
- Cookieを削除
- HTTP 204

---

### 2.4 認証チェック（内部利用）

共通処理：`get_current_user`

目的

- リクエストがログイン済みか判定する
- ログイン中ならuserレコードを返す

失敗時

- 未ログイン → HTTP 401

## ３．セッション管理ルール

セッション発行時

- ランダムで推測不可能な`session_id`を生成
- sessionsに保存：
  - session_id
  - user_id
  - expires_at（例：現在＋７日）

セッションが有効な条件

```
revoked_at IS NULL
AND expires_at > NOW()
```

ログアウト時

- `revoked_at = NOW()`に更新
- Cookieを削除

## ４．DB操作の流れ

### 4.1 新規登録の流れ

1. リクエストを受け取る
1. emailが既にusersに存在しないか確認
1. passwordをハッシュ化
1. usersにINSERT
1. セッションを作成
1. Cookieにsession_idをセット
1. 成功レスポンス

---

### 4.2 ログインの流れ

1. emailでusersを検索
1. 見つからなければ失敗
1. passwordと入力値を比較
1. 一致したらセッション作成
1. Cookieにsession_idをセット
1. 成功レスポンス

---

### 4.3 ログアウト流れ

1. Cookieからsession_idを取得
1. sessionsを検索
1. 存在すればrevoked_atを更新
1. Cookie削除
1. 成功レスポンス

## ５．バリデーション方針

新規登録

- email：形式チェック
- username：1~100文字
- password：8文字以上

※UIがでも行うが、必ずバックでもチェック

## ６．エラーハンドリング

| ケース         | HTTP | メッセージ           |
| -------------- | ---- | -------------------- |
| email重複      | 409  | Email already exists |
| ログイン失敗   | 401  | Invalid credentials  |
| 未ログイン     | 401  | Not authenticated    |
| バリデーション | 422  | FastAPI標準          |

※セキュリティ上、ログイン失敗理由は分けない

## ７．ディレクトリ設計イメージ
```
backend/
├── config/               # 既存
├── database.py           # 既存（DB接続）
├── main.py               # 既存（FastAPI app）
├── requirements.txt      # 既存
├── routers/
│   ├── __init__.py
│   └── auth.py           # signup / login / logout
├── schemas/
│   ├── __init__.py
│   └── auth.py           # リクエスト/レスポンスのPydantic
├── services/
│   ├── __init__.py
│   ├── user_service.py   # ユーザー作成・認証
│   └── session_service.py# セッション発行・失効
└── core/
    ├── __init__.py
    └── security.py       # hash/verify, session_id生成
```

## ８．定数
- セッション有効期限：７日
- 同時ログイン：許可
- Cookie名：`session_id`
- Cookie属性：
    - HttpOnly：true
    - SameSite：Lax
    - Secure：本番のみtrue