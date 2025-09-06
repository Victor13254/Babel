from sqlalchemy.orm import Session
from app.modules.courses.models import Course, Module, Lesson, LessonBlock
from app.modules.courses.schemas import *

class CourseCRUD:
    def create(self, db: Session, obj: CourseCreate) -> Course:
        c = Course(**obj.dict())
        db.add(c); db.commit(); db.refresh(c); return c

    def list_public(self, db: Session, lang: str | None = None):
        q = db.query(Course).filter(Course.is_published == True)
        if lang: q = q.filter(Course.lang == lang)
        return q.all()

    def get(self, db: Session, id: int) -> Course | None:
        return db.get(Course, id)

    def update(self, db: Session, id: int, obj: CourseUpdate) -> Course:
        c = db.get(Course, id);
        for k,v in obj.dict(exclude_unset=True).items(): setattr(c,k,v)
        db.add(c); db.commit(); db.refresh(c); return c

    def delete(self, db: Session, id: int):
        c = db.get(Course, id); db.delete(c); db.commit()

class ModuleCRUD:
    def create(self, db: Session, obj: ModuleCreate) -> Module:
        m = Module(**obj.dict()); db.add(m); db.commit(); db.refresh(m); return m
    def list_by_course(self, db: Session, course_id: int):
        return db.query(Module).filter_by(course_id=course_id).order_by(Module.position).all()
    def update(self, db: Session, id: int, obj: ModuleUpdate) -> Module:
        m = db.get(Module, id)
        for k,v in obj.dict(exclude_unset=True).items(): setattr(m,k,v)
        db.add(m); db.commit(); db.refresh(m); return m
    def delete(self, db: Session, id: int):
        m = db.get(Module, id); db.delete(m); db.commit()

class LessonCRUD:
    def create(self, db: Session, obj: LessonCreate) -> Lesson:
        l = Lesson(**obj.dict()); db.add(l); db.commit(); db.refresh(l); return l
    def list_by_module(self, db: Session, module_id: int):
        return db.query(Lesson).filter_by(module_id=module_id).order_by(Lesson.position).all()
    def update(self, db: Session, id: int, obj: LessonUpdate) -> Lesson:
        l = db.get(Lesson, id)
        for k,v in obj.dict(exclude_unset=True).items(): setattr(l,k,v)
        db.add(l); db.commit(); db.refresh(l); return l
    def delete(self, db: Session, id: int):
        l = db.get(Lesson, id); db.delete(l); db.commit()

class BlockCRUD:
    def create(self, db: Session, obj: BlockCreate) -> LessonBlock:
        b = LessonBlock(
            lesson_id=obj.lesson_id,
            type=obj.type,
            position=obj.position,
            text=obj.text,
            media_id=obj.media_id
        )
        db.add(b); db.commit(); db.refresh(b); return b

    def list_by_lesson(self, db: Session, lesson_id: int):
        blocks = db.query(LessonBlock).filter_by(lesson_id=lesson_id).order_by(LessonBlock.position).all()
        # NORMALIZACIÓN LIGERA DE LEGACY CONTENT (opcional)
        for b in blocks:
            if b.type in ("image", "audio", "video") and not b.media_id and b.content:
                url = b.content.get("url") or b.content.get("src")
                if url:
                    pass
        return blocks

    def update(self, db: Session, id: int, obj: BlockUpdate) -> LessonBlock:
        b = db.get(LessonBlock, id)
        data = obj.dict(exclude_unset=True)
        if "type" in data:
            b.type = data["type"]
            if b.type == "text":
                if "text" in data: b.text = data["text"]
                b.media_id = None
            elif b.type in ("image", "audio","video"):
                if "media_id" in data: b.media_id = data["media_id"]
                b.text = None
        else:
            if "text" in data: b.text = data["text"]
            if "media_id" in data: b.media_id = data["media_id"]
        if "position" in data: b.position = data["position"]

        db.add(b); db.commit(); db.refresh(b); return b


crud_course = CourseCRUD()
crud_module = ModuleCRUD()
crud_lesson = LessonCRUD()
crud_block  = BlockCRUD()
