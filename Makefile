# 長いコマンドを省略して打てるようにするための設定
# 例) make 〇〇

up:        ## 起動
	docker compose up -d
down:      ## 停止
	docker compose down
build:     ## ビルド
	docker compose up --build
db:		   ## MySQLコンテナに入る
	docker compose exec -it db mysql -u dev_user -p
minio-ls:  ## MinIOのバケット一覧を確認
	docker exec minio sh -c "mc alias set check http://localhost:9000 \$$MINIO_ROOT_USER \$$MINIO_ROOT_PASSWORD && mc ls check"
ps:		   ## コンテナのステータスを確認
	docker compose ps