from pydantic import BaseModel, AnyUrl
from typing import Literal

class MediaCreate(BaseModel):
    url: AnyUrl
    kind: Literal["audio", "video", "image"]
    meta: dict | None = None

class MediaOut(MediaCreate):
    id: int
    class Config: orm_mode = True
