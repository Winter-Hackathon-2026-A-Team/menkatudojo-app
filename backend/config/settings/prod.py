from .base import Settings

class ProdSettings(Settings):
    DATABASE_URL: str
    SECRET_KEY: str
    #ドメイン取得予定
    CORS_ORIGINS: list[str] = ["https://menkatudojo-app.com"]
    DEBUG: bool = False