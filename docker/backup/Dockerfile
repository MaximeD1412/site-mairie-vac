FROM postgres:18-alpine
RUN apk add --no-cache aws-cli dcron
COPY backup.sh /backup.sh
RUN chmod +x /backup.sh
# Toutes les 6h
RUN echo "0 */6 * * * /backup.sh >> /var/log/backup.log 2>&1" | crontab -
CMD ["crond", "-f", "-d", "8"]
