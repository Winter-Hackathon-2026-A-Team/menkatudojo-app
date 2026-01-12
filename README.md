# アプリ名
### 面カツ道場<br></br>

# 開発環境
- Python 3.13 &nbsp;&nbsp; # 最新の安定バージョン
- Node 22  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; # 最新のLTSバージョン
- MySQL 8.4 &nbsp;&nbsp;&nbsp; # AWS RDS MySQLのLTS(8.4)と整合<br>

# ディレクトリ構成
```
.
├── backend
│   ├── config
│   │   ├── __init__.py
│   │   └── settings
│   │       ├── __init__.py
│   │       ├── base.py
│   │       ├── dev.py
│   │       └── prod.py
│   ├── database.py
│   ├── main.py
│   └── requirements.txt
├── docker
│   ├── backend
│   │   └── Dockerfile
│   ├── frontend
│   │   └── Dockerfile
│   └── mysql
│       └── my.cnf
├── docker-compose.yml
├── frontend
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   │   └── vite.svg
│   ├── README.md
│   ├── src
│   │   ├── api.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── assets
│   │   │   └── react.svg
│   │   ├── index.css
│   │   └── main.jsx
│   └── vite.config.js
└── README.md
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
```
# 起動時のdockerコマンド
初回起動ではイメージをビルドする必要があるため、以下のコマンドで起動させる。
```
docker compose up --build
```
- バックエンド : http://localhost:8000
- フロントエンド : http://localhost:3000<br></br>

2回目以降
```
docker compose up -d
```
# 疎通確認
## ①バックエンドの疎通確認
ブラウザまたは`curl`でアクセスし、JSONが返ってくるか確認。
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
## ④データベース直接操作
MySQLの中身を直接確認・操作する手順<br>
```
docker exec -it mysql_db mysql -u　dev_user -p[.envで設定したPW]
```
ログアウト
```
exit
```
## ⑤終了時のdockerコマンド
```
docker compose down
```