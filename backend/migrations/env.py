# backend/migrations/env.py
from logging.config import fileConfig
import os
import sys

from alembic import context
from sqlalchemy import engine_from_config, pool
# Alembic config (alembic.ini)
config = context.config

# Logging (opcional)
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# === Importa tu app ===
# BASE_DIR = .../backend  (padre de migrations)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Ahora ya puedes importar tus modelos/base
from app.db.base import Base

from app.modules.users import models as users_models
from app.modules.profiles import models as profiles_models
from app.modules.courses import models as courses_models
from app.modules.exercises import models as exercises_models
from app.modules.progress import models as progress_models
from app.modules.media import models as media_models
from app.modules.community import models as community_models
from app.modules.feedback import models as teacher_feedback_models
from app.modules.tenants import models as tenants_models
target_metadata = Base.metadata

# === URL de BD ===
# Toma primero de env var (Docker: viene de .env),
# si no, del alembic.ini (sqlalchemy.url)
DATABASE_URL = os.getenv("DATABASE_URL") or config.get_main_option("sqlalchemy.url")
config.set_main_option("sqlalchemy.url", DATABASE_URL)



def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
