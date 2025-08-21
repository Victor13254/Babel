from sqlalchemy.orm import Session
from app.modules.users.models import User
from app.core.security import get_password_hash


def init_db(db: Session):
    # Crea usuario admin si no existe
    admin_email = "admin@babel.local"
    user = db.query(User).filter(User.email == admin_email).first()
    if not user:
        user = User(email=admin_email, hashed_password=get_password_hash("admin"), is_active=True)
    db.add(user)
    db.commit()