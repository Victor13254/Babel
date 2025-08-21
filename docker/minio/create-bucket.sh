#!/usr/bin/env bash
set -euo pipefail
mc alias set local $S3_ENDPOINT $S3_ACCESS_KEY $S3_SECRET_KEY --api s3v4
mc mb -p local/$S3_BUCKET || true