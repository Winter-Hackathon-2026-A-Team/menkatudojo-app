import os
from .dev import DevSettings
from .prod import ProdSettings

def get_settings():
    env = os.getenv("APP_ENV", "dev")

    if env == "prod":
        return ProdSettings()
    return DevSettings()

settings = get_settings()