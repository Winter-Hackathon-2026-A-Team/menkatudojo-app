from logging.config import fileConfig
from sqlalchemy import create_engine, pool
from alembic import context
import os

from database import Base
from models import user, session, attempt, avatar, feedback, question, recording, category

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 環境変数から取得
database_url = os.getenv("DATABASE_URL")

# aiomysql → pymysql に変換
sync_database_url = database_url.replace(
    "mysql+aiomysql",
    "mysql+pymysql"
)

target_metadata = Base.metadata


def run_migrations_online():
    connectable = create_engine(
        sync_database_url,
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    pass
else:
    run_migrations_online()
