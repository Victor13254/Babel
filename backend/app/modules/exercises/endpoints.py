from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.core.auth import get_current_user, require_admin
from app.modules.exercises.schemas import *
from app.modules.exercises.crud import crud_exercise, crud_attempt
from app.core.rbac import requires

router = APIRouter(prefix="/exercises", tags=["exercises"])

@router.get("/lesson/{lesson_id}", response_model=list[ExerciseOut], dependencies=[Depends(requires("exercises:read"))])
def list_exercises(lesson_id: int, db: Session = Depends(get_db)):
    return crud_exercise.list_by_lesson(db, lesson_id)

@router.post("/", response_model=ExerciseOut, dependencies=[Depends(requires("exercises:create"))])
def create_exercise(payload: ExerciseCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    return crud_exercise.create(db, payload)

@router.put("/{exercise_id}", response_model=ExerciseOut, dependencies=[Depends(requires("exercises:update"))])
def update_exercise(exercise_id: int, payload: ExerciseUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    if not crud_exercise.get(db, exercise_id): raise HTTPException(404, "Exercise not found")
    return crud_exercise.update(db, exercise_id, payload)

# Attempts
@router.post("/attempts", response_model=AttemptOut, dependencies=[Depends(requires("attempts:create"))])
def submit_attempt(payload: AttemptCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud_attempt.create_and_grade(db, current_user.id, payload)

@router.get("/attempts/me", response_model=list[AttemptOut], dependencies=[Depends(requires("attempts:read:self"))])
def my_attempts(exercise_id: int | None = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud_attempt.list_my_attempts(db, current_user.id, exercise_id)
