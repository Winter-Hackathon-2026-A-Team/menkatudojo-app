## １．機能概要
本機能は、ユーザーが面接練習用の質問を出題・作成・管理できる機能である。
出題方法は複数用意し、ユーザーが学習目的に応じて質問を取得できるようにする。

## ２．機能要件
### 2.1質問出題機能（MVP）
**2.1.1 全質問ランダム出題**
- システムに登録されている全質問を対象とする
- サーバー側でランダムに１問を選択する
- レスポンスとして質問データを返却する

**入力**
なし

**出力**
- question_id
- question_text
- category
- created_by（公式 or ユーザー）
---
### 2.1.2質問選択出題
- ユーザーが一覧から選択した質問IDを受け取る
- 該当質問をそのまま返却する

**入力**
- question_id

**出力**
- question_id
- question_text
- category
- created_by
---
### 2.2質問作成機能（MVP）
**2.2.1ユーザーによる質問作成**
- ログインユーザーのみ利用可能
- 作成者は現在ログイン中のユーザー
- 作成された質問はDBに保存される

**入力**
- question_text（必須）
- category_id（必須）

**出力**
- 作成された質問情報

**制約**
- question_textは空文字不可
- catebory_idは既存カテゴリであること
---
### 2.3カテゴリ機能（MVP）
- 各質問は１つカテゴリを持つ
- カテゴリは事前にDBに登録されている
- カテゴリは質問の表示や将来的なフィルタに利用される

## ３．追加機能（MVP後）
### 3.1カテゴリ内ランダム出題
- category_idを指定
- 該当カテゴリ内の質問群からランダム１問取得
---
### 3.2複数選択ランダム出題
- ユーザーが複数のquestion_idを送信
- その集合からランダム１問を選択
---
### 3.3ユーザー質問の編集・削除
**編集**
- 自分が作成した質問のみ編集可能
- question_text/category変更可能

**削除**
- 自分が作成した質問のみ削除可能

## ４．認可ルール
| 操作         | 未ログイン | ログイン |
| -------------- | ---- | ---------- |
| 全体ランダム出題 | 可 | 可 |
| 選択出題 | 可 | 可 |
| 質問作成 | 不可 | 可 |
| 編集 | 不可 | 作成者のみ |
| 削除 | 不可 | 作成者のみ |

## ５．データ設計（論理モデル）
**questions**
- id(PK)
- text
- category_id(FK)
- created_by_user_id(FK, NULL可)
- created_at
- updated_at
※created_by_user_idがNULLの場合は「公式質問」
---
**categories**
- id(PK)
- name
- created_at

## ６．API設計
**GET/api/questions/random**
→全体ランダム
**GET/api/questions/{id}**
→指定出題
**POST/api/questions**
→質問作成（要認証）
**GET/api/questions/category=1**
→カテゴリフィルタ
**GET/api/questions/random/category=1**
→カテゴリランダム
**POST/api/questions/random-from-selection**
→複数選択ランダム
