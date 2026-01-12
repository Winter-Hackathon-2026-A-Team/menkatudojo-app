from .base import Settings

class DevSettings(Settings):
    #MySQLを非同期で使用する設定
    DATABASE_URL: str = "mysql+aiomysql://user:password@db:3306/myapp_db"
    #CORSの許可
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    DEBUG: bool = True