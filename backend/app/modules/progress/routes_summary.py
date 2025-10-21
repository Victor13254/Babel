# app/modules/progress/routes_summary.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.deps import get_db
from app.core.auth import get_current_user
from app.modules.progress.models import XpEvent, UserProgress

router = APIRouter(prefix="/progress", tags=["progress-summary"])

@router.get("/summary")
def my_progress_summary(db: Session = Depends(get_db), user=Depends(get_current_user)):
    total_xp = db.query(func.coalesce(func.sum(XpEvent.delta), 0)).filter(XpEvent.user_id == user.id).scalar() or 0
    lessons_done = db.query(func.count(UserProgress.lesson_id)).filter(
        (UserProgress.user_id == user.id) & (UserProgress.completed == True)
    ).scalar() or 0
    return {"total_xp": int(total_xp), "lessons_done": int(lessons_done)}
