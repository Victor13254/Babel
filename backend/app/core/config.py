from pydantic import BaseSettings, AnyHttpUrl
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "Babel"
    ENV: str = "dev"


    API_V1_PREFIX: str = "/api"
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] | List[str] = ["http://localhost:5173"]


    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_ALGORITHM: str = "HS256"
    BCRYPT_ROUNDS: int = 12


    RATE_LIMIT_WINDOW_SECONDS: int = 60
    RATE_LIMIT_MAX_REQUESTS: int = 100


    DATABASE_URL: str
    POSTGRES_HOST: str


    REDIS_URL: str


    S3_ENDPOINT: str
    S3_ACCESS_KEY: str
    S3_SECRET_KEY: str
    S3_BUCKET: str
    S3_REGION: str = "us-east-1"
    S3_USE_SSL: bool = False


    class Config:
        env_file = ".env"


settings = Settings()