from sqlalchemy.orm import Session
from app.modules.media.models import MediaAsset
from app.modules.media.schemas import MediaCreate
import logging

log = logging.getLogger(__name__)

class MediaCRUD:
    def create(self, db: Session, obj: MediaCreate) -> MediaAsset:
        # Pydantic v1/v2 compat
        data = obj.model_dump() if hasattr(obj, "model_dump") else obj.dict()
        m = MediaAsset(**data)
        db.add(m)
        try:
            db.commit()
        except Exception as e:
            db.rollback()
            log.exception("Error al crear MediaAsset en DB")
            raise
        db.refresh(m)
        return m

    def get(self, db: Session, id: int) -> MediaAsset | None:
        return db.get(MediaAsset, id)

    def list(self, db: Session) -> list[MediaAsset]:
        return db.query(MediaAsset).all()

crud_media = MediaCRUD()
