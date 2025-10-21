from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Integer, Boolean, DateTime, Date, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.db.base import Base

class UserProgress(Base):
    __tablename__ = "user_progress"
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id"), primary_key=True)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    best_score: Mapped[int] = mapped_column(Integer, default=0)
    last_attempt_at: Mapped["DateTime"] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), index=True)
    __table_args__ = (
        UniqueConstraint("tenant_id", "email", name="uq_user_tenant_email"),
    )

class XpEvent(Base):
    __tablename__ = "xp_events"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    source: Mapped[str] = mapped_column(String(50))
    delta: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped["DateTime"] = mapped_column(DateTime(timezone=True), server_default=func.now())

    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), index=True)
    __table_args__ = (
        UniqueConstraint("tenant_id", "email", name="uq_user_tenant_email"),
    )

class Badge(Base):
    __tablename__ = "badges"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(50), unique=True)
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(String(300))
    rule: Mapped[dict] = mapped_column(JSONB, default=dict)  # p.ej {type:"xp", threshold:500}
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), index=True)
    __table_args__ = (
        UniqueConstraint("tenant_id", "email", name="uq_user_tenant_email"),
    )

class UserBadge(Base):
    __tablename__ = "user_badges"
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    badge_id: Mapped[int] = mapped_column(ForeignKey("badges.id"), primary_key=True)
    awarded_at: Mapped["DateTime"] = mapped_column(DateTime(timezone=True), server_default=func.now())
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), index=True)
    __table_args__ = (
        UniqueConstraint("tenant_id", "email", name="uq_user_tenant_email"),
    )

class Streak(Base):
    __tablename__ = "streaks"
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    current_days: Mapped[int] = mapped_column(Integer, default=0)
    longest_days: Mapped[int] = mapped_column(Integer, default=0)
    last_day: Mapped["Date"] = mapped_column(Date)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), index=True)
    __table_args__ = (
        UniqueConstraint("tenant_id", "email", name="uq_user_tenant_email"),
    )

class LeaderboardDaily(Base):
    __tablename__ = "leaderboard_daily"
    date: Mapped["Date"] = mapped_column(Date, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    xp: Mapped[int] = mapped_column(Integer, default=0)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), index=True)
    __table_args__ = (
        UniqueConstraint("tenant_id", "email", name="uq_user_tenant_email"),
    )
