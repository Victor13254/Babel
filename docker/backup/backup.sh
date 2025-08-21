#!/usr/bin/env bash
set -euo pipefail
DATE=$(date +"%Y%m%d-%H%M%S")
FILE="/tmp/pgdump-$DATE.sql.gz"
pg_dump -h db -U $POSTGRES_USER -d $POSTGRES_DB | gzip > "$FILE"
mc alias set local $S3_ENDPOINT $S3_ACCESS_KEY $S3_SECRET_KEY --api s3v4
mc cp "$FILE" local/$S3_BUCKET/
rm -f "$FILE"