from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.core.auth import get_current_user
from app.modules.profiles.schemas import ProfileOut, ProfileUpdate
from app.modules.profiles.crud import crud_profile
from app.core.rbac import requires

router = APIRouter(prefix="/profiles", tags=["profiles"])

@router.get("/me", response_model=ProfileOut, dependencies=[Depends(requires("profile:read:self"))])
def get_my_profile(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud_profile.get_or_create(db, current_user.id)

@router.put("/me", response_model=ProfileOut, dependencies=[Depends(requires("profile:update:self"))])
def update_my_profile(payload: ProfileUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud_profile.update(db, current_user.id, payload)
