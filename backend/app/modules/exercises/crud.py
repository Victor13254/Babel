from sqlalchemy.orm import Session
from app.modules.exercises.models import Exercise, Attempt
from app.modules.exercises.schemas import ExerciseCreate, ExerciseUpdate, AttemptCreate
from difflib import SequenceMatcher

def simple_autograde(ex_type: str, answer: dict, submitted: dict) -> tuple[bool, int, str | None]:
    """
    Reglas simples de corrección:
    - translate: similitud de cadenas (expected.text vs submitted.text)
    - vocab: exact match (expected.key vs submitted.key)
    - listening: exact match de transcript o similitud leve
    """
    try:
        if ex_type == "translate":
            exp = (answer.get("text") or "").strip().lower()
            got = (submitted.get("text") or "").strip().lower()
            sim = SequenceMatcher(None, exp, got).ratio()
            score = int(sim * 100)
            return (score >= 80, score, None)
        elif ex_type == "vocab":
            return (answer.get("key") == submitted.get("key"), 100 if answer.get("key")==submitted.get("key") else 0, None)
        elif ex_type == "listening":
            exp = (answer.get("transcript") or "").strip().lower()
            got = (submitted.get("transcript") or "").strip().lower()
            sim = SequenceMatcher(None, exp, got).ratio()
            score = int(sim * 100)
            return (score >= 85, score, None)
    except Exception as e:
        return (False, 0, f"Error grading: {e}")
    return (False, 0, None)

class ExerciseCRUD:
    def create(self, db: Session, obj: ExerciseCreate) -> Exercise:
        e = Exercise(**obj.dict())
        db.add(e); db.commit(); db.refresh(e); return e

    def update(self, db: Session, id: int, obj: ExerciseUpdate) -> Exercise:
        e = db.get(Exercise, id)
        for k,v in obj.dict(exclude_unset=True).items(): setattr(e,k,v)
        db.add(e); db.commit(); db.refresh(e); return e

    def get(self, db: Session, id: int) -> Exercise | None:
        return db.get(Exercise, id)

    def list_by_lesson(self, db: Session, lesson_id: int):
        return db.query(Exercise).filter_by(lesson_id=lesson_id).all()

class AttemptCRUD:
    def create_and_grade(self, db: Session, user_id: int, obj: AttemptCreate) -> Attempt:
        ex = db.get(Exercise, obj.exercise_id)
        is_correct, score, fb = simple_autograde(ex.type, ex.answer, obj.submitted)
        a = Attempt(
            exercise_id=ex.id,
            user_id=user_id,
            submitted=obj.submitted,
            is_correct=is_correct,
            score=score,
            feedback=fb,
            duration_ms=obj.duration_ms,
        )
        db.add(a); db.commit(); db.refresh(a)
        return a

    def list_my_attempts(self, db: Session, user_id: int, exercise_id: int | None = None):
        q = db.query(Attempt).filter(Attempt.user_id == user_id)
        if exercise_id: q = q.filter(Attempt.exercise_id == exercise_id)
        return q.order_by(Attempt.id.desc()).all()

crud_exercise = ExerciseCRUD()
crud_attempt  = AttemptCRUD()
