# app/db/init_db.py
from app.core.config import settings
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.db.base import Base

# IMPORTA TODOS los modelos para registrarlos en Base.metadata
from app.modules.users.models import User
from app.modules.profiles.models import Profile
from app.modules.courses.models import Course, Module, Lesson, LessonBlock
from app.modules.media.models import MediaAsset
from app.modules.exercises.models import Exercise, Attempt
from app.modules.progress.models import UserProgress, XpEvent, Badge, UserBadge, Streak, LeaderboardDaily
from app.modules.community.models import Thread, Post
from app.modules.feedback.models import TeacherFeedback

from app.core.security import get_password_hash

def create_tables():
    # Crea todas las tablas si no existen
    Base.metadata.create_all(bind=engine)

def create_admin():
    db: Session = SessionLocal()
    admin_email = settings.ADMIN_EMAIL
    admin_password = settings.ADMIN_PASSWORD
    existing = db.query(User).filter(User.email == admin_email).first()
    if not existing:
        admin = User(
            email=admin_email,
            hashed_password=get_password_hash(admin_password),
            role="admin",
            is_active=True,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print(f"✅ Admin creado: {admin.email}")
    else:
        print("ℹ️ Admin ya existe")

if __name__ == "__main__":
    create_tables()   # 👈 crea tablas primero
    create_admin()
