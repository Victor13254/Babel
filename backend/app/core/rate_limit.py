from __future__ import annotations
import time
import redis
from fastapi import Request, HTTPException
from app.core.config import settings


r = redis.from_url(settings.REDIS_URL, decode_responses=True)
SKIP_PATHS = {"/health"}


async def rate_limit(request: Request):
    path = request.url.path

    if path in SKIP_PATHS:
        return

    window = settings.RATE_LIMIT_WINDOW_SECONDS
    limit = settings.RATE_LIMIT_MAX_REQUESTS

    ip = request.client.host if request.client else "unknown"
    window_id = int(time.time() // window)


    key = f"babel:rl:{ip}:{path}:{window_id}"
    try:
        pipe = r.pipeline()
        pipe.incr(key)
        pipe.expire(key, window)
        count, _ = pipe.execute()
    except redis.RedisError:
        return

    if int(count) > limit:
        raise HTTPException(
            status_code=429,
            detail="Too Many Requests"
        )