FROM alpine:3.21
RUN apk add --no-cache postgresql18-client python3 py3-pip && \
    pip3 install --break-system-packages --no-cache-dir awscli
COPY backup.sh /backup.sh
RUN chmod +x /backup.sh
RUN mkdir -p /var/spool/cron/crontabs && \
    echo "0 */6 * * * /backup.sh >> /var/log/backup.log 2>&1" > /var/spool/cron/crontabs/root
CMD ["crond", "-f", "-d", "8"]
