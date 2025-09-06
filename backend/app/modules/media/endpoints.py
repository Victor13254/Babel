from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import uuid, mimetypes
from pathlib import Path

from app.core.deps import get_db
from app.core.auth import require_admin
from app.core.rbac import requires
from app.core.s3 import ensure_bucket, put_object, public_url_for, presigned_url_for
from app.modules.media.schemas import MediaCreate, MediaOut
from app.modules.media.crud import crud_media
router = APIRouter(prefix="/media", tags=["media"])

@router.get("/", response_model=list[MediaOut], dependencies=[Depends(requires("media:read"))])
def list_media(db: Session = Depends(get_db)):
    return crud_media.list(db)

@router.post("/", response_model=MediaOut, dependencies=[Depends(requires("media:create"))])
def register_media(payload: MediaCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    return crud_media.create(db, payload)


@router.post("/upload", response_model=MediaOut, dependencies=[Depends(requires("media:create"))])
def upload_media(
        file: UploadFile = File(...),
        db: Session = Depends(get_db),
        _=Depends(require_admin),
):
    ensure_bucket()

    ct = (file.content_type or "").lower()
    kind = None
    if ct.startswith("image/"): kind = "image"
    elif ct.startswith("audio/"): kind = "audio"
    elif ct.startswith("video/"): kind = "video"
    else:
        guess = mimetypes.guess_type(file.filename or "")[0] or ""
        if guess.startswith("image/"): kind = "image"; ct = guess
        elif guess.startswith("audio/"): kind = "audio"; ct = guess
        elif guess.startswith("video/"): kind = "video"; ct = guess

    if not kind:
        raise HTTPException(400, f"Tipo de archivo no soportado: {ct or 'desconocido'}")

    ext = Path(file.filename or "").suffix.lower() or mimetypes.guess_extension(ct) or ""
    key = f"uploads/{kind}/{uuid.uuid4().hex}{ext}"

    put_object(file.file, key, ct)

    url = public_url_for(key) or presigned_url_for(key)

    payload = MediaCreate(
        url=url,
        kind=kind,
        meta={"object_key": key, "content_type": ct, "filename": file.filename},
    )
    return crud_media.create(db, payload)