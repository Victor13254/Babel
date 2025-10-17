from pydantic import BaseModel, EmailStr, conint, constr
from typing import Literal

class RegisterFull(BaseModel):
    email: EmailStr
    password: constr(min_length=8)

    first_name: constr(min_length=1)
    last_name: constr(min_length=1)
    username: constr(min_length=3)

    age: conint(ge=13, le=120)
    country: constr(min_length=2)

    native_lang: constr(min_length=2)
    target_lang: constr(min_length=2)
    level: Literal["A1","A2","B1","B2","C1","C2"]

    daily_goal_min: conint(ge=5, le=180)
    accept_terms: bool | None = None

class UserOut(BaseModel):
    id: int
    email: str
    is_active: bool
    role: Literal["admin", "user"]

    class Config:
        orm_mode = True
