from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from config.settings import settings

#非同期エンジン作成
engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG)

#データベース操作を行うセッションオブジェクトを取得
AsyncSessionLocal = sessionmaker(
    bind=engine,
    #非同期用のAsyncSessionを指定
    class_=AsyncSession,
    #意図しないタイミングで自動的な再読み込みを発生させないためFalse
    expire_on_commit=False
)

#モデルのベースクラス
Base = declarative_base()

#FastAPIのDependsで使用するためのトランザクション
async def get_db():
    #上記のAsyncSessionLocalを元にインスタンスを作成(コンテキストマネージャ)
    async with AsyncSessionLocal() as session:
        try:
            #returnではなくyieldを使用することで一時停止
            yield session
            #エンドポイント(ロジック)の処理が正常終了した後にコミット
            await session.commit()
            #エラーが発生したときの処理
        except Exception:
            await session.rollback()
            #httpエラーレスポンスをクライアントに返す
            raise
        #最後にデータベースを閉じる
        finally:
            await session.close()