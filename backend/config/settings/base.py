from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "menkatudojo-App"
    DATABASE_URL: str = ""
    SECRET_KEY: str = "defalt-secret-key"
    #CORSを許可するURLのリスト。Pydanticが文字列を変換してくれる
    CORS_ORIGINS: list[str] = []
    DEBUG: bool = False
    ALLOW_RECORDING_MIME_TYPE: str
    MAX_RECORDING_FILESIZE: int
    MAX_RECORDING_DURATION_S: int
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION_NAME: str
    S3_ENDPOINT_URL: str | None = None
    S3_BUCKET_NAME: str
    TZ: str

    class Config:
        env_file = ".env"

#Pydanticは型ヒントを利用してデータのバリデーションと設定管理を行うライブラリ
#FastAPIの内部でPydanticを採用しているらしいです