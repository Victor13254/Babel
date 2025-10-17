from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.modules.users.models import User
from app.modules.users.schemas import RegisterFull
from app.core.security import get_password_hash, verify_password
from app.modules.profiles.models import Profile

DEFAULT_AVATAR_URL = "https://img.freepik.com/vector-gratis/circulo-azul-usuario-blanco_78370-4707.jpg"

class UserCRUD:
    def create_with_profile(self, db: Session, obj_in: RegisterFull) -> User:
        user = User(
            email=str(obj_in.email).strip().lower(),
            hashed_password=get_password_hash(obj_in.password),
        )
        db.add(user)

        try:
            db.flush()  # para obtener user.id

            display_name = f"{obj_in.first_name} {obj_in.last_name}".strip() or obj_in.username or user.email

            prof = Profile(
                user_id=user.id,
                display_name=display_name,
                native_lang=obj_in.native_lang,
                target_lang=obj_in.target_lang,
                target_level=obj_in.level,
                avatar_url=DEFAULT_AVATAR_URL,
                # Guardamos extras en preferences (no hay columnas dedicadas)
                preferences={
                    "username": obj_in.username,
                    "age": obj_in.age,
                    "country": obj_in.country,
                    "daily_goal_min": obj_in.daily_goal_min,
                    "accept_terms": obj_in.accept_terms,
                },
            )

            db.add(prof)
            db.commit()
        except IntegrityError:
            db.rollback()
            raise

        db.refresh(user)
        return user

    # existentes
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
