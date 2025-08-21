import time
import redis
from fastapi import Request, HTTPException
from app.core.config import settings


r = redis.from_url(settings.REDIS_URL, decode_responses=True)


async def rate_limit(request: Request):
    window = settings.RATE_LIMIT_WINDOW_SECONDS
    limit = settings.RATE_LIMIT_MAX_REQUESTS
    ip = request.client.host if request.client else "unknown"
    key = f"rl:{ip}:{request.url.path}:{int(time.time()//window)}"
    count = r.incr(key)
    if count == 1:
        r.expire(key, window)
    if count > limit:
        raise HTTPException(status_code=429, detail="Too Many Requests")