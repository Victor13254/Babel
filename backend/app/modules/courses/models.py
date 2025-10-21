from sqlalchemy import String, Integer, Boolean, SmallInteger, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base import Base

class Course(Base):
    __tablename__ = "courses"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(120))
    lang: Mapped[str] = mapped_column(String(10))
    level: Mapped[str | None] = mapped_column(String(20))
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)

    modules = relationship("Module", back_populates="course", cascade="all, delete")
    #tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), index=True)

class Module(Base):
    __tablename__ = "modules"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"))
    title: Mapped[str] = mapped_column(String(120))
    position: Mapped[int] = mapped_column(SmallInteger, default=0)

    course = relationship("Course", back_populates="modules")
    lessons = relationship("Lesson", back_populates="module", cascade="all, delete")
    #tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), index=True)

class Lesson(Base):
    __tablename__ = "lessons"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    module_id: Mapped[int] = mapped_column(ForeignKey("modules.id"))
    title: Mapped[str] = mapped_column(String(120))
    position: Mapped[int] = mapped_column(SmallInteger, default=0)
    summary: Mapped[str | None] = mapped_column(String(500))

    module = relationship("Module", back_populates="lessons")
    blocks = relationship("LessonBlock", back_populates="lesson", cascade="all, delete")
    #tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), index=True)


class LessonBlock(Base):
    __tablename__ = "lesson_blocks"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id"))
    type: Mapped[str] = mapped_column(String(10))
    position: Mapped[int] = mapped_column(SmallInteger, default=0)

    text: Mapped[str | None] = mapped_column(Text, nullable=True)
    media_id: Mapped[int | None] = mapped_column(ForeignKey("media_assets.id"), nullable=True)

    lesson = relationship("Lesson", back_populates="blocks")
    media = relationship("MediaAsset", lazy="joined")
    #tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), index=True)

