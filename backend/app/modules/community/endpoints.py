from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.core.auth import get_current_user, require_admin
from app.modules.community.schemas import *
from app.modules.community.crud import crud_thread, crud_post
from app.core.rbac import requires

router = APIRouter(prefix="/community", tags=["community"])

@router.get("/threads", response_model=list[ThreadOut], dependencies=[Depends(requires("threads:read"))])
def list_threads(course_id: int | None = None, lesson_id: int | None = None, db: Session = Depends(get_db)):
    return crud_thread.list(db, course_id, lesson_id)

@router.post("/threads", response_model=ThreadOut, dependencies=[Depends(requires("threads:create"))])
def create_thread(payload: ThreadCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud_thread.create(db, current_user.id, payload)

@router.post("/threads/{thread_id}/pin", response_model=ThreadOut, dependencies=[Depends(requires("threads:pin"))])
def pin_thread(thread_id: int, pinned: bool, db: Session = Depends(get_db), _=Depends(require_admin)):
    return crud_thread.pin(db, thread_id, pinned)

@router.get("/threads/{thread_id}/posts", response_model=list[PostOut], dependencies=[Depends(requires("posts:read"))])
def list_posts(thread_id: int, db: Session = Depends(get_db)):
    return crud_post.list_by_thread(db, thread_id)

@router.post("/posts", response_model=PostOut, dependencies=[Depends(requires("posts:create"))])
def create_post(payload: PostCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud_post.create(db, current_user.id, payload)
