from sqlalchemy.orm import Session
from app.modules.profiles.models import Profile
from app.modules.profiles.schemas import ProfileUpdate

class ProfileCRUD:
    def get_or_create(self, db: Session, user_id: int) -> Profile:
        prof = db.get(Profile, user_id)
        if prof:
            return prof
        prof = Profile(user_id=user_id, preferences={})
        db.add(prof); db.commit(); db.refresh(prof)
        return prof

    def update(self, db: Session, user_id: int, obj: ProfileUpdate) -> Profile:
        prof = self.get_or_create(db, user_id)
        for k, v in obj.dict(exclude_unset=True).items():
            setattr(prof, k, v)
        db.add(prof); db.commit(); db.refresh(prof)
        return prof

crud_profile = ProfileCRUD()
