from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

import os
import logging

from config.settings import settings
from database import engine, get_db

#開発か本番かをチェックし、ログを切り分ける
log_level = logging.DEBUG if settings.DEBUG else logging.INFO
#サーバ側で動作記録保持
logging.basicConfig(
    level=log_level,
    #"levelname":INFO|DEBUG, "name":ファイル名, "message":ログの内容
    format="%(levelname)s: %(name)s: %(message)s"
    )
logger = logging.getLogger(__name__)

#データベース疎通確認
@asynccontextmanager
async def lifespan(app: FastAPI):
    #起動時の処理
    try:
        async with engine.begin() as conn:
            #ヘルスチェック(SELECT 1)で疎通確認
            await conn.execute(text("SELECT 1"))
        logger.info("Database connection successful.")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")

    #アプリが終了するまで待機
    yield

    #終了処理
    await engine.dispose()
    logger.info("Database connection closed.")

#アプリケーションの初期化
app = FastAPI(
    title=settings.APP_NAME,
    #ブラウザに詳細なエラーを表示する
    debug=settings.DEBUG,
    #左側:FastAPIライブラリ。起動・終了時の処理を受け取る
    lifespan=lifespan,
    )

#セッションミドルウェアの設定
app.add_middleware(
    #セッション機能を有効
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
)

#CORS設定
app.add_middleware(
    CORSMiddleware,
    #アクセスを許可するオリジンのリストを指定
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    #GET,POST等のHTTPメソッド許可
    allow_methods=["*"],
    #HTTPヘッダーのカスタムヘッダーを許可。フロントで自由に設定できるように*としてますが、本番環境に上げる時は要相談。
    allow_headers=["*"],
)

#ヘルスチェック
@app.get("/health")
def health_check():
    return {"status": "ok", "env": os.getenv("APP_ENV", "dev")}

@app.get("/db-test")
async def db_test(db: AsyncSession = Depends(get_db)):
    #DB接続とバージョン情報の取得確認
    result = await db.execute(text("SELECT VERSION()"))
    version = result.scalar()
    return {
        "database_version": version,
        "status": "connected"
    }