from sqlalchemy.orm import Session
from app.modules.profiles.models import Profile
from app.modules.profiles.schemas import ProfileUpdate

DEFAULT_AVATAR_URL = "https://img.freepik.com/vector-gratis/circulo-azul-usuario-blanco_78370-4707.jpg"

class ProfileCRUD:
    def get_or_create(self, db: Session, user_id: int) -> Profile:
        prof = db.get(Profile, user_id)
        if prof:
            return prof
        prof = Profile(
            user_id=user_id,
            display_name=None,
            native_lang=None,
            target_lang=None,
            target_level=None,
            avatar_url=DEFAULT_AVATAR_URL,
            preferences={}
        )
        db.add(prof); db.commit(); db.refresh(prof)
        return prof

    def update(self, db: Session, user_id: int, obj: ProfileUpdate) -> Profile:
        prof = self.get_or_create(db, user_id)
        for k, v in obj.dict(exclude_unset=True).items():
            setattr(prof, k, v)
        db.add(prof); db.commit(); db.refresh(prof)
        return prof

crud_profile = ProfileCRUD()
