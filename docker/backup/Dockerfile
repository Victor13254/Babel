FROM alpine:3.20
RUN apk add --no-cache postgresql-client bash curl
# instalar mc (MinIO client)
RUN curl -L https://dl.min.io/client/mc/release/linux-amd64/mc -o /usr/local/bin/mc && chmod +x /usr/local/bin/mc
COPY backup.sh /backup.sh
RUN chmod +x /backup.sh
CMD ["/bin/sh", "-c", "while true; do /backup.sh; sleep 86400; done"]