FROM python:3.11-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
PYTHONUNBUFFERED=1


COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt


COPY app ./app


# Uvicorn para dev; en prod usaría gunicorn + uvicorn workers
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]