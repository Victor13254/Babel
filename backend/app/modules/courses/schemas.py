from pydantic import BaseModel, root_validator
from typing import Literal, Optional
from app.modules.media.schemas import MediaOut


class CourseBase(BaseModel):
    title: str
    lang: str
    level: str | None = None
    is_published: bool = False

class CourseCreate(CourseBase): pass
class CourseUpdate(BaseModel):
    title: str | None = None
    lang: str | None = None
    level: str | None = None
    is_published: bool | None = None

class CourseOut(CourseBase):
    id: int
    class Config: orm_mode = True

class ModuleBase(BaseModel):
    title: str
    position: int = 0

class ModuleCreate(ModuleBase):
    course_id: int

class ModuleUpdate(BaseModel):
    title: str | None = None
    position: int | None = None

class ModuleOut(ModuleBase):
    id: int
    course_id: int
    class Config: orm_mode = True

class LessonBase(BaseModel):
    title: str
    position: int = 0
    summary: str | None = None

class LessonCreate(LessonBase):
    module_id: int

class LessonUpdate(BaseModel):
    title: str | None = None
    position: int | None = None
    summary: str | None = None

class LessonOut(LessonBase):
    id: int
    module_id: int
    class Config: orm_mode = True

class BlockBase(BaseModel):
    type: Literal["text","image", "audio", "video"]
    text: Optional[str] = None
    media_id: Optional[int] = None
    position: int = 0

    @root_validator
    def validate_by_type(cls, values):
        t = values.get("type")
        text = values.get("text")
        media_id = values.get("media_id")
        if t == "text":
            if not (text and text.strip()):
                raise ValueError("Para bloques de tipo 'text' el campo 'text' es obligatorio")
            # para texto NO debe venir media_id
            values["media_id"] = None
        else:
            # audio/video: requiere media_id
            if not media_id:
                raise ValueError("Para 'audio' o 'video' debes enviar 'media_id' (registrado en /media)")
            # y no necesita text
            values["text"] = None
        return values

class BlockCreate(BlockBase):
    lesson_id: int

class BlockUpdate(BaseModel):
    type: Literal["text","image", "audio", "video"] | None = None
    text: Optional[str] = None
    media_id: Optional[int] = None
    position: int | None = None

    @root_validator
    def validate_update(cls, values):
        t = values.get("type")
        text = values.get("text")
        media_id = values.get("media_id")
        # Si cambia a text, exige text. Si cambia a audio/video, exige media_id.
        if t == "text":
            if text is not None and not str(text).strip():
                raise ValueError("Si 'type' es 'text', 'text' no puede ser vacío")
            # si viene media_id, lo ignoramos
            values["media_id"] = None
        elif t in ("image","audio", "video"):
            if media_id is None:
                raise ValueError("Si 'type' es 'audio' o 'video', debes proveer 'media_id'")
            values["text"] = None
        # si no envían 'type', permitimos updates parciales coherentes
        return values

class BlockOut(BlockBase):
    id: int
    lesson_id: int
    type: Literal["text","image", "audio", "video"]
    position: int
    text: Optional[str] = None
    media: Optional[MediaOut] = None  # 👈 devolvemos el asset embebido

    class Config:
        orm_mode = True