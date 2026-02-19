機能
- 履歴一覧
    ユーザーごとに、今まで行った面接情報（動画や質問内容など）を返す。
- 履歴詳細
    指定された一つの履歴に対し、面接詳細情報を返す。

## 履歴一覧
### API
GET
/api/answers?page=n&limit=6
※nは取得したいページの数字
### 入力
- ユーザーID（Cookie）
### 出力
```
{
"answerId": integer,
”categoryName”: string,
”questionContent”: string,
"createdAt": string,
"characterConfig": {
    "avatarId": integer,
    "personalityId": integer
  },
”feedback”:{
"grade": str,
}
"meta": {
"totalCount": integer,
”totalPages”: integer,
"currentPage": integer
}
}
```
### 処理
- セッション切れを確認
- limitに上限値を設け、超過していないかチェック
- pageをもとに、対象の履歴を取得
    - ユーザの履歴を実施日時が新しい順に並べた時に　1 + limit x (page-1)番目   ~ 6 + limit x (page-1) 番目の履歴を取得
        - 回答テーブルから回答内部ID、質問ID、実施日時を取得
        - 質問IDを使って、質問テーブルから質問カテゴリ、質問文を取得
        - 回答内部IDを使って、総評、性格IDを取得
- totalCount/Pagesを計算
- レスポンスを返す

### 成功時
- 200


### 失敗時
| status | code                         | 理由 |
| 401 |  { "code": "UNAUTHORIZED"} | セッション切れなど |
| 404 | {”code”, “USER_NOT_FOUND”} | ユーザーが存在しない |
| 422 | {"code", "INVALID_PARAMETER"} | limitが上限値オーバー |
| 500 | {"code": "INTERNAL_SERVER_ERROR"} | サーバ由来のエラー |


## 履歴詳細

### API
GET
/api/answers/{answerId}
### 入力
- ユーザーID（Cookie）
### 出力
```
{
”answerId”: integer,
”categoryName”: string,
”questionContent”: string,
”createdAt”: string,
"characterConfig": {
    "avatarId": integer,
    "personalityId": integer
  },
”transcript”: string,
”feedback”: {
”grade”: string,
”goodPoints”: string,
”improvePoints”: string,
”nextTip”: string,
”videoUrl”: “https://…”,
”storageKey”: string,}
}
```
### 処理
- セッション切れを確認
- answerIdをもとに回答したユーザーIDを取得
- CookieのセッションIDから得たユーザーIDと、answerIdをもとに回答したユーザーIDと一致するか確認
    →一致する場合、処理継続。一致しない場合、403エラーを返す。
- answerIdをもとに、レスポンスに必要な情報をDBから取得。

### 成功時
- 200


### 失敗時
| status | code                         | 理由 |
| 401 |  { "code": "UNAUTHORIZED"} | セッション切れなど |
| 403 | {"code": "FORBIDDEN"} | 他のユーザーの回答を取得しようした |
| 404 | {”code”, “USER_NOT_FOUND”} | ユーザーが存在しない |
| 500 | {"code": "INTERNAL_SERVER_ERROR"} | サーバ由来のエラー |
