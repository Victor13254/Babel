from sqlalchemy import String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.db.base import Base

class Profile(Base):
    __tablename__ = "profiles"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    display_name: Mapped[str | None] = mapped_column(String(80))
    native_lang: Mapped[str | None] = mapped_column(String(10))
    target_lang: Mapped[str | None] = mapped_column(String(10))
    target_level: Mapped[str | None] = mapped_column(String(20))  # A1..C2
    avatar_url: Mapped[str | None] = mapped_column(String(255))
    preferences: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped["DateTime"] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="profile", uselist=False)
    #tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), index=True)

