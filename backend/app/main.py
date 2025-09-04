from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.routes import api_router
from app.db.session import SessionLocal
from app.db.init_db import init_db

class TimeoutMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Timeout"] = "dev"  # marcador simple en dev
        return response

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1) aquí ya debiste correr alembic upgrade head
    with SessionLocal() as db:
        init_db(db)  # crea admin si no existe
    yield
    # (shutdown) nada por ahora
app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(TimeoutMiddleware)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)