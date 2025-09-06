from sqlalchemy import String, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base import Base

class MediaAsset(Base):
    __tablename__ = "media_assets"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    url: Mapped[str] = mapped_column(Text, nullable=False)     # URL pública o presign
    kind: Mapped[str] = mapped_column(String(10))     # audio|video|image
    meta: Mapped[dict] = mapped_column(JSONB, default=dict)
