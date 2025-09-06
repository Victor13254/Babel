from pydantic import BaseModel, AnyUrl

class ProfileBase(BaseModel):
    display_name: str | None = None
    native_lang: str | None = None
    target_lang: str | None = None
    target_level: str | None = None
    avatar_url: AnyUrl | None = None
    preferences: dict | None = None

class ProfileUpdate(ProfileBase):
    pass

class ProfileOut(ProfileBase):
    user_id: int

    class Config:
        orm_mode = True
