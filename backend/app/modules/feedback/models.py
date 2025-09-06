from sqlalchemy import Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.db.base import Base

class TeacherFeedback(Base):
    __tablename__ = "teacher_feedback"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    attempt_id: Mapped[int] = mapped_column(ForeignKey("attempts.id"))
    teacher_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    comment_md: Mapped[str] = mapped_column(String(2000))
    created_at: Mapped["DateTime"] = mapped_column(DateTime(timezone=True), server_default=func.now())
