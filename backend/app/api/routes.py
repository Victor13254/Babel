from fastapi import APIRouter
from app.api.health import router as health_router
from app.modules.users.endpoints import router as users_router
from app.modules.profiles.endpoints import router as profiles_router
from app.modules.courses.endpoints import router as courses_router
from app.modules.progress.endpoints import router as progress_router
from app.modules.feedback.endpoints import router as feedback_router
from app.modules.media.endpoints import router as media_router
from app.modules.community.endpoints import router as community_router
from app.modules.exercises.endpoints import router as exercises_router
from app.modules.admin.admin_metrics import router as admin_router


api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(users_router)
api_router.include_router(profiles_router)
api_router.include_router(courses_router)
api_router.include_router(progress_router)
api_router.include_router(feedback_router)
api_router.include_router(media_router)
api_router.include_router(community_router)
api_router.include_router(exercises_router)
api_router.include_router(admin_router)