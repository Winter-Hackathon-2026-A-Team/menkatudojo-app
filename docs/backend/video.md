## 録画機能

バックエンド側で必要機能

1. 署名付きURLの生成
2. S3に保存された動画ファイルサイズ/MIMETYPEの検証、およびそれらのDB登録

### 1. 署名付きURLの生成

POST `/api/video/presigned-url`

入力

- 質問ID
- 実際の録画時間
- セッションID(Cookieから取得)

出力

- 署名付きURL

使用する環境変数

S3_BUCKET_NAME_VIDEO: S3バケット名

MAX_VIDEO_FILESIZE: 上限動画ファイルサイズ = 90 * 10**6  # 90MB

ALLOW_VIDEO_MIME_TYPE: 許容動画MIME TYPE = “video/webm” 

処理

- 回答レコード情報生成
    - 回答内部IDの生成
        - 生成しない。auto incrementで対応。
    - 回答外部IDの生成
        - UUIDを生成
    - CookieからセッションIDを取得
    - セッションIDからユーザーID取得
    - 処理状態=processingの生成
- 回答テーブルにレコードを登録。
    - 登録するカラム
    - エラー出たらロールバックし、フロントにエラーを返す
- 動画レコード情報生成
    - ストレージキー（videos/{yyyy}/{mm}/{UUID}.webm）の生成
- 動画テーブルにレコードを登録。
    - エラー出たらロールバックし、フロントにエラーを返す
- ストレージーキーとS3バケット名を基に署名付きURLを作成
    
    Content Typeはvideo/webmを指定する。
    
    ファイルサイズに制約（1byte~90Mbyte）を設ける
    
    `boto3`の`generate_presigned_post`メソッドで生成
    
    ```python
    
    request = s3.generate_presigned_post(
        Bucket=S3_BUCKET_NAME_VIDEO,
        Key=storage_key,
        Fields={
            "Content-Type": ALLOW_VIDEO_MIME_TYPE,
        },
        Conditions=[
            ["starts-with", "$Content-Type", "video/webm"],
            ["content-length-range", 1, MAX_VIDEO_FILESIZE], # 1~max_filesize[byte]まで可
        ],
        ExpiresIn=300,
    )
    
    ```
    

### 2. S3に保存された動画ファイルサイズ/MIMETYPEの検証、およびそれらのDB登録

POST `/api/feedback` (S3に動画アップロード完了されたら、フィードバック作成処理と並行で実施？)

- S3に保存された動画ファイルのサイズとMIMETYPE検証（`validate＿video` 関数呼び出し）
- 動画ファイルサイズ/MIMETYPEをDB登録

関数名`validate＿video`

入力

- ストレージキー

出力

- 検証結果 boolean(True:OK,False:NG)
- ファイルサイズ
- MIMETYPE
- エラー内容
    - 下記メッセージのいずれかor両方が返される。
        - 動画が存在しない
        - ファイルサイズ超過
        - MIMETYPEが規定のTYPEでない
    

使用する環境変数

S3_BUCKET_NAME_VIDEO: S3バケット名

MAX_VIDEO_FILESIZE: 上限動画ファイルサイズ = 90 * 10**6  # 90MB

ALLOW_VIDEO_MIME_TYPE: 許容動画MIME TYPE = “video/webm” 

処理

- ストレージキーから対象の動画ファイルのファイルサイズとMIMETYPEを取得
- ファイルサイズとMIMETYPEを検証
- 検証結果を返す。

## ディレクトリ構成

```python
backend/
├── config/               # 既存
├── database.py           # 既存（DB接続）
├── main.py               # 既存（FastAPI app）
├── requirements.txt      # 既存
├── routers/
│   ├── __init__.py
│   ├── feedback.py.       # feedback
│   └── video.py           # presigned-url
├── schemas/
│   ├── __init__.py
│   └── video.py           # リクエスト/レスポンスのPydantic
├── services/
│   ├── __init__.py
│   └── video_service.py   # 動画周りの処理(署名付きURL発行、S3に保存された動画の検証)
│   
└── core/
```
