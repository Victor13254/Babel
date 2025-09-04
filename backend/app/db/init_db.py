from sqlalchemy.orm import Session
from app.modules.users.models import User
from app.core.security import get_password_hash
from app.core.config import settings


def init_db(db: Session):

    admin_email = settings.ADMIN_EMAIL
    admin_password = settings.ADMIN_PASSWORD

    user = db.query(User).filter(User.email == admin_email).first()

    if not user:
        user = User(
            email=admin_email,
            hashed_password=get_password_hash(admin_password),
            is_active=True
        )
        db.add(user)
        db.commit()