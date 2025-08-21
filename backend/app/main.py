from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings
from app.core.rate_limit import rate_limit
from app.api.routes import api_router


class TimeoutMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Para dev: simple timeout server-side (mejor Nginx/Gunicorn en prod)
        response = await call_next(request)
        response.headers["X-Timeout"] = "dev"
        return response


app = FastAPI(title=settings.PROJECT_NAME)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#@app.middleware("http")
#async def _rate_limit(request: Request, call_next):
#    await rate_limit(request)
#    return await call_next(request)


app.include_router(api_router, prefix=settings.API_V1_PREFIX)