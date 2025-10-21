# app/modules/progress/routes_extra.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Float
from datetime import date
from app.core.deps import get_db
from app.core.auth import get_current_user
from app.core.rbac import requires

from app.modules.courses.models import Course, Module, Lesson
from app.modules.progress.models import UserProgress
from app.modules.progress.crud import crud_progress, crud_xp, crud_streak

router = APIRouter(prefix="/progress", tags=["progress-extra"])

@router.post("/advance", dependencies=[Depends(requires("progress:upsert:self"))])
def advance_progress(lesson_id: int, score: int = 100, xp: int = 50,
                     db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Marca lección completada, toca racha y suma XP; todo junto."""
    # valida lección
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lección no encontrada")

    # progreso (upsert)
    crud_streak.touch(db, user.id)  # racha del día
    p = crud_progress.upsert(db, user.id, obj=type("X", (), {"lesson_id": lesson_id, "completed": True, "best_score": score})())

    # XP
    crud_xp.add(db, user.id, obj=type("X", (), {"source": "lesson_completed", "delta": xp})())

    return {"ok": True, "lesson_id": lesson_id, "best_score": p.best_score}

@router.get("/my-courses", dependencies=[Depends(requires("progress:read:self"))])
def my_courses_progress(db: Session = Depends(get_db), user=Depends(get_current_user)):
    """
    Progreso por curso del usuario: total lecciones, completadas, %.
    """
    # total lecciones por curso
    total_per_course = (
        db.query(Course.id.label("course_id"), func.count(Lesson.id).label("total"))
        .join(Module, Module.course_id == Course.id)
        .join(Lesson, Lesson.module_id == Module.id)
        .group_by(Course.id)
        .subquery()
    )

    # completadas por usuario
    done_per_course = (
        db.query(Course.id.label("course_id"), func.count(UserProgress.lesson_id).label("done"))
        .join(Module, Module.course_id == Course.id)
        .join(Lesson, Lesson.module_id == Module.id)
        .join(UserProgress, (UserProgress.lesson_id == Lesson.id) & (UserProgress.user_id == user.id) & (UserProgress.completed == True), isouter=True)
        .group_by(Course.id)
        .subquery()
    )

    rows = (
        db.query(
            Course.id, Course.title, Course.lang, Course.level,
            func.coalesce(total_per_course.c.total, 0).label("total"),
            func.coalesce(done_per_course.c.done, 0).label("done"),
            (cast(func.coalesce(done_per_course.c.done, 0), Float) /
             func.nullif(cast(func.coalesce(total_per_course.c.total, 0), Float), 0)).label("rate"),
        )
        .join(total_per_course, total_per_course.c.course_id == Course.id, isouter=True)
        .join(done_per_course, done_per_course.c.course_id == Course.id, isouter=True)
        .all()
    )

    return [
        {
            "id": r.id,
            "title": r.title,
            "lang": r.lang,
            "level": r.level,
            "total": int(r.total or 0),
            "done": int(r.done or 0),
            "progress_rate": float(r.rate or 0.0),
        } for r in rows
    ]
