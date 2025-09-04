from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.modules.users.models import User
from app.modules.users.schemas import UserCreate
from app.core.security import get_password_hash, verify_password

class UserCRUD:
    def create(self, db: Session, obj_in: UserCreate) -> User:

        user = User(
            email=obj_in.email.strip().lower(),
            hashed_password=get_password_hash(obj_in.password),
        )

        db.add(user)

        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise

        db.refresh(user)
        return user

    def get_by_email(self, db: Session, email: str) -> User | None:
        return db.query(User).filter(User.email == email.strip().lower()).first()

    def authenticate(self, db: Session, email: str, password: str) -> User | None:
        user = self.get_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

crud_user = UserCRUD()
