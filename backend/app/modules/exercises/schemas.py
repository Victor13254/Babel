from pydantic import BaseModel
from typing import Literal

class ExerciseBase(BaseModel):
    lesson_id: int
    type: Literal["translate", "vocab", "listening"]
    prompt: dict
    answer: dict
    config: dict | None = None

class ExerciseCreate(ExerciseBase): pass
class ExerciseUpdate(BaseModel):
    lesson_id: int | None = None
    type: Literal["translate", "vocab", "listening"] | None = None
    prompt: dict | None = None
    answer: dict | None = None
    config: dict | None = None

class ExerciseOut(ExerciseBase):
    id: int
    class Config: orm_mode = True

class AttemptCreate(BaseModel):
    exercise_id: int
    submitted: dict
    duration_ms: int = 0

class AttemptOut(BaseModel):
    id: int
    exercise_id: int
    user_id: int
    is_correct: bool
    score: int
    feedback: str | None
    duration_ms: int
    submitted: dict

    class Config:
        orm_mode = True
