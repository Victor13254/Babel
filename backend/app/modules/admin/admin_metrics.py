from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, Integer
from datetime import date

# Usa el get_db correcto de tu proyecto (en tus otros routers usas core.deps)
from app.core.deps import get_db

# Modelos
from app.modules.users.models import User
from app.modules.courses.models import Course, Module, Lesson
from app.modules.progress.models import UserProgress

router = APIRouter(prefix="/admin/metrics", tags=["Admin Metrics"])


@router.get("/summary")
def get_admin_summary(db: Session = Depends(get_db)):
    """
    Devuelve resumen general de usuarios, cursos y actividad.
    """
    try:
        total_students = db.query(func.count(User.id)).filter(User.role == "user").scalar() or 0
        total_teachers = db.query(func.count(User.id)).filter(User.role == "teacher").scalar() or 0
        total_courses = db.query(func.count(Course.id)).scalar() or 0
        total_lessons = db.query(func.count(Lesson.id)).scalar() or 0
        lessons_completed = (
                db.query(func.count(UserProgress.lesson_id))
                .filter(UserProgress.completed.is_(True))
                .scalar()
                or 0
        )

        today = date.today()
        active_today = (
                db.query(func.count(func.distinct(UserProgress.user_id)))
                .filter(func.date(UserProgress.last_attempt_at) == today)
                .scalar()
                or 0
        )

        # attempts_today: si tienes tabla attempts, calcula; si no, aproxima
        attempts_today = active_today * 2

        return {
            "students": total_students,
            "teachers": total_teachers,
            "courses": total_courses,
            "lessons_completed": lessons_completed,
            "active_today": active_today,
            "attempts_today": attempts_today,
            "total_lessons": total_lessons,  # por si lo usas luego
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/courses")
def get_course_metrics(db: Session = Depends(get_db)):
    """
    Métricas por curso: inscritos (usuarios únicos con progreso en alguna lección del curso),
    activos hoy (usuarios con actividad hoy), y tasa promedio de completado (sobre lecciones con progreso).
    """
    try:
        today = date.today()

        # Subconsulta: activos hoy por lección
        active_by_lesson = (
            db.query(
                UserProgress.lesson_id.label("lesson_id"),
                func.count(func.distinct(UserProgress.user_id)).label("active_today"),
            )
            .filter(func.date(UserProgress.last_attempt_at) == today)
            .group_by(UserProgress.lesson_id)
            .subquery()
        )

        # Course -> Module -> Lesson -> UserProgress
        results = (
            db.query(
                Course.id.label("course_id"),
                Course.title,
                Course.lang,
                Course.level,
                func.count(func.distinct(UserProgress.user_id)).label("enrolled"),
                func.coalesce(func.avg(func.cast(UserProgress.completed, Integer)), 0).label("completion_rate"),
                func.coalesce(func.sum(active_by_lesson.c.active_today), 0).label("active_today"),
            )
            .outerjoin(Module, Module.course_id == Course.id)
            .outerjoin(Lesson, Lesson.module_id == Module.id)
            .outerjoin(UserProgress, UserProgress.lesson_id == Lesson.id)
            .outerjoin(active_by_lesson, active_by_lesson.c.lesson_id == Lesson.id)
            .group_by(Course.id)
            .order_by(func.count(func.distinct(UserProgress.user_id)).desc())
            .limit(20)
            .all()
        )

        courses = [
            {
                "course_id": r.course_id,
                "title": r.title,
                "lang": r.lang,
                "level": r.level,
                "enrolled": int(r.enrolled or 0),
                "active_today": int(r.active_today or 0),
                "completion_rate": float(r.completion_rate or 0),  # 0..1
            }
            for r in results
        ]

        # Si no hay datos aún, devuelve un mock útil para el frontend
        if not courses:
            courses = [
                {"course_id": 1, "title": "Inglés A1", "lang": "en", "level": "A1", "enrolled": 0, "active_today": 0, "completion_rate": 0.0},
                {"course_id": 2, "title": "Francés A2", "lang": "fr", "level": "A2", "enrolled": 0, "active_today": 0, "completion_rate": 0.0},
            ]

        return courses

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
