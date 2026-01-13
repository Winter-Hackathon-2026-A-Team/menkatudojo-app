# 長いコマンドを省略して打てるようにするための設定

up:        ## 起動
	docker compose up -d
down:      ## 停止
	docker compose down
build:     ## ビルド
	docker compose up --build
db:		   ## MySQLコンテナに入る
	docker compose exec -it db mysql -u dev_user -p
