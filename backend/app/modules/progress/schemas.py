from pydantic import BaseModel
from datetime import date, datetime

class ProgressUpsert(BaseModel):
    lesson_id: int
    completed: bool
    best_score: int | None = None

class ProgressOut(BaseModel):
    user_id: int
    lesson_id: int
    completed: bool
    best_score: int
    last_attempt_at: datetime | None

    class Config: orm_mode = True

class XpEventCreate(BaseModel):
    source: str
    delta: int

class XpEventOut(BaseModel):
    id: int
    user_id: int
    source: str
    delta: int
    class Config: orm_mode = True

class BadgeCreate(BaseModel):
    code: str
    name: str
    description: str
    rule: dict

class BadgeOut(BadgeCreate):
    id: int
    class Config: orm_mode = True

class StreakOut(BaseModel):
    user_id: int
    current_days: int
    longest_days: int
    last_day: date | None
    class Config: orm_mode = True
