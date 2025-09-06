from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.core.auth import require_admin
from app.modules.courses.schemas import *
from app.modules.courses.crud import crud_course, crud_module, crud_lesson, crud_block
from app.core.rbac import requires

router = APIRouter(prefix="/courses", tags=["courses"])

# Público
@router.get("/", response_model=list[CourseOut], dependencies=[Depends(requires("courses:read"))])
def list_public_courses(lang: str | None = None, db: Session = Depends(get_db)):
    return crud_course.list_public(db, lang)

# Admin: CRUD curso
@router.post("/", response_model=CourseOut, dependencies=[Depends(requires("courses:create"))])
def create_course(payload: CourseCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    return crud_course.create(db, payload)

@router.put("/{course_id}", response_model=CourseOut, dependencies=[Depends(requires("courses:update"))])
def update_course(course_id: int, payload: CourseUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    if not crud_course.get(db, course_id): raise HTTPException(404, "Course not found")
    return crud_course.update(db, course_id, payload)

@router.delete("/{course_id}", status_code=204, dependencies=[Depends(requires("courses:delete"))])
def delete_course(course_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    if not crud_course.get(db, course_id): raise HTTPException(404, "Course not found")
    crud_course.delete(db, course_id)

# Módulos
@router.get("/{course_id}/modules", response_model=list[ModuleOut], dependencies=[Depends(requires("courses:read"))])
def list_modules(course_id: int, db: Session = Depends(get_db)):
    return crud_module.list_by_course(db, course_id)

@router.post("/modules", response_model=ModuleOut, dependencies=[Depends(requires("courses:create"))])
def create_module(payload: ModuleCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    return crud_module.create(db, payload)

@router.put("/modules/{module_id}", response_model=ModuleOut, dependencies=[Depends(requires("courses:update"))])
def update_module(module_id: int, payload: ModuleUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    return crud_module.update(db, module_id, payload)

@router.delete("/modules/{module_id}", status_code=204, dependencies=[Depends(requires("courses:delete"))])
def delete_module(module_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    crud_module.delete(db, module_id)

# Lecciones
@router.get("/modules/{module_id}/lessons", response_model=list[LessonOut], dependencies=[Depends(requires("courses:read"))])
def list_lessons(module_id: int, db: Session = Depends(get_db)):
    return crud_lesson.list_by_module(db, module_id)

@router.post("/lessons", response_model=LessonOut, dependencies=[Depends(requires("courses:create"))])
def create_lesson(payload: LessonCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    return crud_lesson.create(db, payload)

@router.put("/lessons/{lesson_id}", response_model=LessonOut, dependencies=[Depends(requires("courses:update"))])
def update_lesson(lesson_id: int, payload: LessonUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    return crud_lesson.update(db, lesson_id, payload)

@router.delete("/lessons/{lesson_id}", status_code=204, dependencies=[Depends(requires("courses:delete"))])
def delete_lesson(lesson_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    crud_lesson.delete(db, lesson_id)

# Bloques
@router.get("/lessons/{lesson_id}/blocks", response_model=list[BlockOut], dependencies=[Depends(requires("courses:read"))])
def list_blocks(lesson_id: int, db: Session = Depends(get_db)):
    return crud_block.list_by_lesson(db, lesson_id)

@router.post("/blocks", response_model=BlockOut, dependencies=[Depends(requires("courses:create"))])
def create_block(payload: BlockCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    return crud_block.create(db, payload)

@router.put("/blocks/{block_id}", response_model=BlockOut, dependencies=[Depends(requires("courses:update"))])
def update_block(block_id: int, payload: BlockUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    return crud_block.update(db, block_id, payload)

@router.delete("/blocks/{block_id}", status_code=204, dependencies=[Depends(requires("courses:delete"))])
def delete_block(block_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    crud_block.delete(db, block_id)
