import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from app.core.config import settings

def s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT,
        aws_access_key_id=settings.S3_ACCESS_KEY,
        aws_secret_access_key=settings.S3_SECRET_KEY,
        region_name=settings.S3_REGION,
        config=Config(signature_version="s3v4"),
        use_ssl=settings.S3_USE_SSL,
    )

def ensure_bucket():
    s3 = s3_client()
    try:
        s3.head_bucket(Bucket=settings.S3_BUCKET)
    except ClientError:
        # crear bucket (en us-east-1 no admite LocationConstraint)
        s3.create_bucket(Bucket=settings.S3_BUCKET)

def put_object(fileobj, key: str, content_type: str):
    s3 = s3_client()
    s3.upload_fileobj(
        Fileobj=fileobj,
        Bucket=settings.S3_BUCKET,
        Key=key,
        ExtraArgs={"ContentType": content_type},
    )

def public_url_for(key: str) -> str | None:
    """Si tienes base pública, construye URL estática; si no, None."""
    if settings.S3_PUBLIC_BASE_URL:
        base = settings.S3_PUBLIC_BASE_URL.rstrip("/")
        return f"{base}/{key}"
    # También puedes devolver formato tipo MinIO: http://host:9000/bucket/key
    # return f"{settings.S3_ENDPOINT.rstrip('/')}/{settings.S3_BUCKET}/{key}"
    return None

def presigned_url_for(key: str) -> str:
    s3 = s3_client()
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.S3_BUCKET, "Key": key},
        ExpiresIn=settings.S3_PRESIGN_EXPIRES,
    )
