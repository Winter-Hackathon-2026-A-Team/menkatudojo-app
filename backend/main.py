from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from routers.auth import router as auth_router
from middlewares.csrf import CSRFMiddleware
from fastapi.responses import JSONResponse

import os
import logging
import models

from config.settings import settings
from database import engine, get_db, Base

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

            # 開発環境(dev)の場合、モデルのテーブルを自動作成
            if os.getenv("APP_ENV", "dev") == "dev":
                await conn.run_sync(models.Base.metadata.create_all)

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

@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    # detailが辞書かつ'code'キーを持つ場合、フラットな構造で返す
    if isinstance(exc.detail, dict) and "code" in exc.detail:
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.detail,  # {"code": "..."} が直接返る
        )
    # それ以外の標準的なHTTPExceptionはそのまま
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

#セッションミドルウェアの設定
app.add_middleware(
    CSRFMiddleware,
    exempt_paths={
        "/docs",
        "/openapi.json",
    },
    protect_prefixes=("/api",),
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
    allow_headers=["*", "x-xsrf-token"],
)

#認証ルーターを登録
app.include_router(auth_router)

#ヘルスチェック
@app.get("/api/health")
def health_check():
    return {"status": "ok", "env": os.getenv("APP_ENV", "dev")}

@app.get("/api/db-test")
async def db_test(db: AsyncSession = Depends(get_db)):
    #DB接続とバージョン情報の取得確認
    result = await db.execute(text("SELECT VERSION()"))
    version = result.scalar()
    return {
        "database_version": version,
        "status": "connected"
    }