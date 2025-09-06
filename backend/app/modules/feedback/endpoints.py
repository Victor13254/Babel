from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.core.auth import get_current_user
from app.modules.feedback.schemas import *
from app.modules.feedback.crud import crud_feedback
from app.core.rbac import requires

router = APIRouter(prefix="/feedback", tags=["feedback"])

def require_teacher(current_user=Depends(get_current_user)):
    if current_user.role not in ("admin"):  # ajusta segun tus roles
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Teacher role required")
    return current_user

@router.post("/", response_model=TeacherFeedbackOut, dependencies=[Depends(requires("feedback:create"))])
def create_feedback(payload: TeacherFeedbackCreate, db: Session = Depends(get_db), current_user=Depends(require_teacher)):
    return crud_feedback.create(db, current_user.id, payload)

@router.get("/by-attempt/{attempt_id}", response_model=list[TeacherFeedbackOut], dependencies=[Depends(requires("feedback:read"))])
def list_feedback(attempt_id: int, db: Session = Depends(get_db), _=Depends(require_teacher)):
    return crud_feedback.list_by_attempt(db, attempt_id)
