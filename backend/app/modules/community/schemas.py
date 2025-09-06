from pydantic import BaseModel

class ThreadCreate(BaseModel):
    title: str
    course_id: int | None = None
    lesson_id: int | None = None

class ThreadOut(BaseModel):
    id: int
    title: str
    course_id: int | None
    lesson_id: int | None
    author_id: int
    pinned: bool
    class Config: orm_mode = True

class PostCreate(BaseModel):
    thread_id: int
    body_md: str
    parent_post_id: int | None = None

class PostOut(BaseModel):
    id: int
    thread_id: int
    author_id: int
    body_md: str
    parent_post_id: int | None
    class Config: orm_mode = True
