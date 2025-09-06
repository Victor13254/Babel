from sqlalchemy.orm import Session
from app.modules.community.models import Thread, Post
from app.modules.community.schemas import ThreadCreate, PostCreate

class ThreadCRUD:
    def create(self, db: Session, user_id: int, obj: ThreadCreate) -> Thread:
        t = Thread(author_id=user_id, **obj.dict())
        db.add(t); db.commit(); db.refresh(t); return t

    def list(self, db: Session, course_id: int | None, lesson_id: int | None):
        q = db.query(Thread)
        if course_id: q = q.filter(Thread.course_id == course_id)
        if lesson_id: q = q.filter(Thread.lesson_id == lesson_id)
        return q.order_by(Thread.pinned.desc(), Thread.id.desc()).all()

    def pin(self, db: Session, thread_id: int, pinned: bool) -> Thread:
        t = db.get(Thread, thread_id); t.pinned = pinned
        db.add(t); db.commit(); db.refresh(t); return t

class PostCRUD:
    def create(self, db: Session, user_id: int, obj: PostCreate) -> Post:
        p = Post(author_id=user_id, **obj.dict())
        db.add(p); db.commit(); db.refresh(p); return p

    def list_by_thread(self, db: Session, thread_id: int) -> list[Post]:
        return db.query(Post).filter(Post.thread_id == thread_id).order_by(Post.id.asc()).all()

crud_thread = ThreadCRUD()
crud_post = PostCRUD()
