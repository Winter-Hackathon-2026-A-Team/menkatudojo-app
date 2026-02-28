# アプリ名

### 面カツ道場<br></br>

# 開発環境

- Python 3.13 &nbsp;&nbsp; # 最新の安定バージョン
- Node 22 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; # 最新のLTSバージョン
- MySQL 8.4 &nbsp;&nbsp;&nbsp; # AWS RDS MySQLのLTS(8.4)と整合<br>

# ディレクトリ構成

```
.
├── backend/                # APIサーバー (FastAPI / Python 3.13)
│   ├── alembic/            # DBマイグレーション管理 (Alembic)
│   ├── main.py             # アプリケーションのエントリーポイント
│   ├── models/             # SQLAlchemy エンティティ定義
│   ├── routers/            # エンドポイント（APIルーティング）定義
│   └── services/           # ビジネスロジック・AI分析処理の実装
├── docker/                 # 各コンテナのビルド用 Dockerfile
│   ├── backend/
│   ├── frontend/
│   └── mysql/
├── docker-compose.yml      # ローカル開発環境の一括起動定義
├── docs/                   # プロジェクト全体の設計ドキュメント
│   ├── backend/            # バックエンド詳細設計
│   └── frontend/           # フロントエンド詳細設計
├── frontend/               # フロントエンド (React / Vite / TypeScript)
│   ├── src/                # コンポーネントおよびUIロジック
│   └── README.md           # フロントエンド概要
├── infra/                  # インフラ構築定義 (Terraform / AWS)
│   ├── main.tf             # AWSリソース定義のメインファイル
│   └── modules/            # VPC, ECS, RDS等の再利用可能なモジュール
├── Makefile                # 開発効率化のためのショートカットコマンド集
└── README.md               # プロジェクト全体の概要・起動手順（本ファイル）
```

# 開発環境起動から終了までの手順

## 1) 環境変数ファイル.envの作成

.env.exampleをコピーして、.envファイルをプロジェクトルートディレクトリ直下に保存する。
注）.envファイルは必ず、.env.exampleファイルと同じ階層に保存すること。（Dockerの設定ファイルで環境変数.envのファイルパスを指定しているため。）

```
cp .env.example .env
```

以下が.env.exampleの中身であり、コピーした.envを「各自で変更する設定」を各自で変更する。

```
#=====共通設定=====
MYSQL_DATABASE=myapp_db                                 # 開発環境で使うデータベース名（チームで共通・固定）
MYSQL_USER=dev_user                                     # 開発用のデータベースユーザ名（チーム共通）
MYSQL_HOST=db                                           # コンテナが接続するDBコンテナ名(db)（チーム共通
MYSQL_PORT=3306                                         # MySQLポート番号
USERNAME=appuser                                        # コンテナ内のユーザーネーム（チーム共通）
GROUPNAME=appgroup                                      # コンテナ内のグループネーム（チーム共通）
APP_ENV=dev                                             # dev:開発　prod:本番　切替
TZ=Asia/Tokyo                                           # タイムゾーン設定（チーム共通）
CORS_ORIGINS=http://localhost:3000                      # フロントからバックへ通信許可
#=====各自で設定お願いします=====
MYSQL_PASSWORD=                                         # 各自がローカル環境で設定するDBユーザーパスワード(環境開発で各自設定、非公開)
MYSQL_ROOT_PASSWORD=                                    # MYSQLのrootパスワード(開発環境で各自設定、非公開)

SECRET_KEY=                                             # FastAPIの署名付きcookie

#Mac/Windowsユーザは1000のままで問題ありません
#Linuxユーザは id -u / id -g の結果を入力してください
UID=1000
GID=1000

#===== AI / 分析設定 (Gemini API) =====
# https://aistudio.google.com/ で取得したキーを設定してください
GEMINI_API_KEY=
# 動作確認済みモデル: gemini-2.5-flash
GEMINI_MODEL_NAME=gemini-2.5-flash

#===== ストレージ設定 (MinIO / S3共通) =====
AWS_REGION_NAME=us-east-1
# ローカル開発ではMinIOのバケット名として使用されます
S3_BUCKET_NAME=menkatu-recordings

#===== 録画・アップロード制限設定 =====
# フロントエンドのバリデーションおよびバックエンドの制限値
ALLOW_RECORDING_MIME_TYPE=video/webm
MAX_RECORDING_FILESIZE=50000000 # 50MB
MAX_RECORDING_DURATION_S=90 # 90秒

#===== MinIO 接続設定 (Local用) =====
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=password123
```

# 起動時のdockerコマンド

初回起動ではイメージをビルドする必要があるため、以下のコマンドで起動させる。

```
docker compose up --build
```

もしくは

```
make build
```

- バックエンド : http://localhost:8000
- フロントエンド : http://localhost:3000<br></br>

2回目以降

```
docker compose up -d
```

もしくは、

```
make up
```
コンテナ起動後、アプリを正常に動作させるために以下の二つの設定を行う。
データベースマイグレーション
```
docker compose exec backend alembic upgrade head
```

MinIO Webhook 設定（AI分析のトリガー設定）
録画ファイルのアップロードを検知してAI分析を開始するための設定。
※ mc (MinIO Client) のインストールが必要。詳細は末尾の補足を参照。

エイリアスの設定（MinIOへの接続定義）
mc alias set localminio http://localhost:9000 admin password123

Webhook通知先エンドポイントの設定
```
mc admin config set localminio notify_webhook:1 \
  endpoint="http://backend:8000/webhooks/minio-webhooku438fh39ur390ur38iwpqr3" \
  enable=on
```

MinIOの再起動（設定の反映）
```
mc admin service restart localminio
```

イベント通知の登録（dev-bucketへの .webm アップロードを監視）
```
mc event add localminio/dev-bucket arn:minio:sqs:us-east-1:1:webhook --event put --suffix .webm
```

# 疎通確認

## ①バックエンドの疎通確認

ブラウザまたは`curl`でアクセスし、JSONが返ってくるか確認。
注意: ヘルスチェック専用ページを確認する場合は、frontend/src/app.tsx 内の以下の箇所のコメントアウトを外す。
```
<Route path="/dev/health" element={<HealthCheckPage />} />
```

- URL : http://localhost:8000/health
- 結果 : {"status":"ok","env":"dev"}<br>

## ②データベースの疎通確認

バックエンドからMySQLへの疎通確認。

- URL : http://localhost:8000/db-test
- 結果 : {"database_version":"8.4.7","status":"connected"}<br>

## ③フロントエンドの疎通確認

ブラウザで確認

- URL : http://localhost:3000
- 結果 : Vite + React、API Status:ok、db Version:8.4.7が中央に表示

## ④Minioの疎通確認

コマンドプロンプトで疎通確認。

```
make minio-ls
```

結果<br>
docker exec minio sh -c "mc alias set check http://localhost:9000 \$MINIO_ROOT_USER \$MINIO_ROOT_PASSWORD && mc ls check"
Added `check` successfully.

## ④データベース直接操作

MySQLの中身を直接確認・操作する手順<br>

```
docker exec -it mysql_db mysql -u　dev_user -p[.envで設定したPW]
```

もしくは

```
make db
```

ログアウト

```
exit
```

## ⑤終了時のdockerコマンド

```
docker compose down
```

もしくは、

```
make down
```

# 補足
MinIO Client(mc)のインストール
Mac(Apple Silicon)
```
curl -O https://dl.min.io/client/mc/release/darwin-arm64/mc
chmod +x mc
sudo mv mc /usr/local/bin/
```
Windows
```
curl -O https://dl.min.io/client/mc/release/windows-amd64/mc.exe
```
実行権限を付与
```
chmod +x mc
```