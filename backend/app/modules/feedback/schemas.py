from pydantic import BaseModel

class TeacherFeedbackCreate(BaseModel):
    attempt_id: int
    comment_md: str

class TeacherFeedbackOut(BaseModel):
    id: int
    attempt_id: int
    teacher_id: int
    comment_md: str
    class Config: orm_mode = True
