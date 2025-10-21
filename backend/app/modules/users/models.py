from sqlalchemy import String, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
from sqlalchemy import ForeignKey, UniqueConstraint


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    role: Mapped[str] = mapped_column(String(20), nullable=False, default="user", server_default="user")

    #tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), index=True)
    #__table_args__ = (
    #    UniqueConstraint("tenant_id", "email", name="uq_user_tenant_email"),
    #)