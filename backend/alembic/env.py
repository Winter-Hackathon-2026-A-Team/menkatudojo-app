from logging.config import fileConfig
from sqlalchemy import create_engine
from sqlalchemy import pool
from alembic import context

# Base と全モデルを import
from database import Base
from models import user, session, attempt, avatar, feedback, question, recording, transcript
# from models import *
from config.settings import settings

# Alembic Config object
config = context.config

# ログ設定
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Alembic 用に同期 URL に変換
sync_database_url = settings.DATABASE_URL.replace(
    "mysql+aiomysql", "mysql+pymysql"
)

# target_metadata は全モデルの Base
target_metadata = Base.metadata

# オフラインモード
def run_migrations_offline() -> None:
    url = sync_database_url
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,  # 型変更も検知
    )

    with context.begin_transaction():
        context.run_migrations()

# オンラインモード
def run_migrations_online() -> None:
    connectable = create_engine(sync_database_url, poolclass=pool.NullPool)

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,  # 型変更も検知
        )

        with context.begin_transaction():
            context.run_migrations()

# 実行モード判定
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()




# from logging.config import fileConfig

# from sqlalchemy import engine_from_config
# from sqlalchemy import pool

# from alembic import context

# from database import Base
# from models import user, session, attempt, avatar, feedback, question, recording
# from config.settings import settings

# # this is the Alembic Config object, which provides
# # access to the values within the .ini file in use.
# config = context.config

# # Interpret the config file for Python logging.
# # This line sets up loggers basically.
# if config.config_file_name is not None:
#     fileConfig(config.config_file_name)

# sync_database_url = settings.DATABASE_URL.replace(
#     "mysql+aiomysql",
#     "mysql+pymysql"
# )

# config.set_main_option("sqlalchemy.url", sync_database_url)


# # add your model's MetaData object here
# # for 'autogenerate' support
# # from myapp import mymodel
# # target_metadata = mymodel.Base.metadata
# target_metadata = Base.metadata

# # other values from the config, defined by the needs of env.py,
# # can be acquired:
# # my_important_option = config.get_main_option("my_important_option")
# # ... etc.


# def run_migrations_offline() -> None:
#     """Run migrations in 'offline' mode.

#     This configures the context with just a URL
#     and not an Engine, though an Engine is acceptable
#     here as well.  By skipping the Engine creation
#     we don't even need a DBAPI to be available.

#     Calls to context.execute() here emit the given string to the
#     script output.

#     """
#     url = config.get_main_option("sqlalchemy.url")
#     context.configure(
#         url=url,
#         target_metadata=target_metadata,
#         literal_binds=True,
#         dialect_opts={"paramstyle": "named"},
#     )

#     with context.begin_transaction():
#         context.run_migrations()


# def run_migrations_online() -> None:
#     """Run migrations in 'online' mode.

#     In this scenario we need to create an Engine
#     and associate a connection with the context.

#     """
#     connectable = engine_from_config(
#         config.get_section(config.config_ini_section, {}),
#         prefix="sqlalchemy.",
#         poolclass=pool.NullPool,
#     )

#     with connectable.connect() as connection:
#         context.configure(
#             connection=connection, target_metadata=target_metadata
#         )

#         with context.begin_transaction():
#             context.run_migrations()


# if context.is_offline_mode():
#     run_migrations_offline()
# else:
#     run_migrations_online()
