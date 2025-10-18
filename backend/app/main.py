from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings
from app.core.s3 import ensure_bucket
from app.modules.users.endpoints import router as users_router
from app.modules.profiles.endpoints import router as profiles_router
from app.modules.courses.endpoints import router as courses_router
from app.modules.media.endpoints import router as media_router
from app.modules.exercises.endpoints import router as exercises_router
from app.modules.progress.endpoints import router as progress_router
from app.modules.community.endpoints import router as community_router
from app.modules.feedback.endpoints import router as feedback_router
from app.modules.admin.admin_metrics import router as admin_router

class TimeoutMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Timeout"] = "dev"
        return response

app = FastAPI(title=settings.PROJECT_NAME)

@app.on_event("startup")
async def startup():
    # Crea el bucket si no existe (idempotente)
    ensure_bucket()

ALLOWED = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED,      # 👈 NO "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(TimeoutMiddleware)

#app.include_router(api_router, prefix=settings.API_V1_PREFIX)
app.include_router(users_router, prefix=settings.API_V1_PREFIX)
app.include_router(profiles_router, prefix=settings.API_V1_PREFIX)
app.include_router(courses_router, prefix=settings.API_V1_PREFIX)
app.include_router(media_router, prefix=settings.API_V1_PREFIX)
app.include_router(exercises_router, prefix=settings.API_V1_PREFIX)
app.include_router(progress_router, prefix=settings.API_V1_PREFIX)
app.include_router(community_router, prefix=settings.API_V1_PREFIX)
app.include_router(feedback_router, prefix=settings.API_V1_PREFIX)
app.include_router(admin_router, prefix=settings.API_V1_PREFIX)