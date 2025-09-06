from sqlalchemy.orm import Session
from app.modules.feedback.models import TeacherFeedback
from app.modules.feedback.schemas import TeacherFeedbackCreate

class FeedbackCRUD:
    def create(self, db: Session, teacher_id: int, obj: TeacherFeedbackCreate) -> TeacherFeedback:
        f = TeacherFeedback(teacher_id=teacher_id, **obj.dict())
        db.add(f); db.commit(); db.refresh(f); return f

    def list_by_attempt(self, db: Session, attempt_id: int):
        return db.query(TeacherFeedback).filter_by(attempt_id=attempt_id).all()

crud_feedback = FeedbackCRUD()
