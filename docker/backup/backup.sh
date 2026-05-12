#!/bin/sh
set -e

TIMESTAMP=$(date -u +%Y-%m-%dT%H%M%SZ)
DAY_OF_WEEK=$(date -u +%u)
DAY_OF_MONTH=$(date -u +%d)
BACKUP_FILE="/tmp/backup_${TIMESTAMP}.sql.gz"

echo "[$(date -u)] Starting pg_dump..."
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"
echo "[$(date -u)] pg_dump complete."

export AWS_ACCESS_KEY_ID="$BACKUP_S3_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$BACKUP_S3_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="$BACKUP_S3_REGION"
ENDPOINT="--endpoint-url ${BACKUP_S3_ENDPOINT}"
S3_BASE="s3://${BACKUP_S3_BUCKET}"

# Daily
aws s3 cp "$BACKUP_FILE" "${S3_BASE}/daily/${TIMESTAMP}.sql.gz" $ENDPOINT

# Weekly (dimanche)
if [ "$DAY_OF_WEEK" = "7" ]; then
  WEEK=$(date -u +%G-W%V)
  aws s3 cp "$BACKUP_FILE" "${S3_BASE}/weekly/${WEEK}.sql.gz" $ENDPOINT
fi

# Monthly (1er du mois)
if [ "$DAY_OF_MONTH" = "01" ]; then
  MONTH=$(date -u +%Y-%m)
  aws s3 cp "$BACKUP_FILE" "${S3_BASE}/monthly/${MONTH}.sql.gz" $ENDPOINT
fi

# Latest
aws s3 cp "$BACKUP_FILE" "${S3_BASE}/latest.sql.gz" $ENDPOINT

rm "$BACKUP_FILE"

# Rotation daily : garder 28 (7 jours × 4 backups/jour)
aws s3 ls "${S3_BASE}/daily/" $ENDPOINT | sort | head -n -28 | awk '{print $4}' | \
  while read -r f; do aws s3 rm "${S3_BASE}/daily/${f}" $ENDPOINT; done

# Rotation weekly : garder 4
aws s3 ls "${S3_BASE}/weekly/" $ENDPOINT | sort | head -n -4 | awk '{print $4}' | \
  while read -r f; do aws s3 rm "${S3_BASE}/weekly/${f}" $ENDPOINT; done

# Rotation monthly : garder 2
aws s3 ls "${S3_BASE}/monthly/" $ENDPOINT | sort | head -n -2 | awk '{print $4}' | \
  while read -r f; do aws s3 rm "${S3_BASE}/monthly/${f}" $ENDPOINT; done

echo "[$(date -u)] Backup and rotation complete."
