from pydantic_settings import BaseSettings

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