from pydantic_settings import BaseSettings
import os

SESSION_EXPIRE_DAYS = int(os.getenv("SESSION_EXPIRE_DAYS", "7"))
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"

class Settings(BaseSettings):
    APP_NAME: str = "menkatudojo-App"
    DATABASE_URL: str = ""
    SECRET_KEY: str = "defalt-secret-key"
    #CORSを許可するURLのリスト。Pydanticが文字列を変換してくれる
    CORS_ORIGINS: list[str] = []
    DEBUG: bool = False

    class Config:
        env_file = ".env"

#Pydanticは型ヒントを利用してデータのバリデーションと設定管理を行うライブラリ
#FastAPIの内部でPydanticを採用しているらしいです