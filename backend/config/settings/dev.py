from .base import Settings
from pydantic import Field

class DevSettings(Settings):
    #MySQLを非同期で使用する設定
    DATABASE_URL: str = "mysql+aiomysql://user:password@db:3306/myapp_db"
    #CORSの許可
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    DEBUG: bool = True
    AWS_ACCESS_KEY_ID: str = Field(validation_alias="MINIO_ACCESS_KEY")
    AWS_SECRET_ACCESS_KEY: str = Field(validation_alias="MINIO_SECRET_KEY")
    S3_ENDPOINT_URL: str = Field(validation_alias="MINIO_ENDPOINT")
    S3_BUCKET_NAME: str = Field(validation_alias="MINIO_BUCKET_NAME")