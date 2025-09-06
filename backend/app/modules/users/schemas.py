from pydantic import BaseModel, EmailStr

from typing import Literal

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    is_active: bool
    role: Literal["admin", "user"]

    class Config:
        orm_mode = True