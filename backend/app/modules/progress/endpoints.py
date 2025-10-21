from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.core.auth import get_current_user, require_admin
from app.modules.progress.schemas import *
from app.modules.progress.crud import crud_progress, crud_xp, crud_badge, crud_streak
from app.core.rbac import requires

router = APIRouter(prefix="/progress", tags=["progress"])

@router.get("/me", response_model=list[ProgressOut], dependencies=[Depends(requires("progress:read:self"))])
def my_progress(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud_progress.my_progress(db, current_user.id)

@router.post("/upsert", response_model=ProgressOut, dependencies=[Depends(requires("progress:upsert:self"))])
def upsert_progress(payload: ProgressUpsert, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # toque de racha al registrar progreso
    crud_streak.touch(db, current_user.id)
    res = crud_progress.upsert(db, current_user.id, payload)
    return res

@router.post("/xp", response_model=XpEventOut, dependencies=[Depends(requires("xp:add:self"))])
def add_xp(payload: XpEventCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    e = crud_xp.add(db, current_user.id, payload)
    crud_badge.maybe_award(db, current_user.id)
    return e

@router.post("/badges", response_model=BadgeOut, dependencies=[Depends(requires("badges:create"))])
def create_badge(payload: BadgeCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    return crud_badge.create(db, payload)

@router.get("/streak/me", response_model=StreakOut, dependencies=[Depends(requires("streak:read:self"))])
def my_streak(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud_streak.touch(db, current_user.id)
