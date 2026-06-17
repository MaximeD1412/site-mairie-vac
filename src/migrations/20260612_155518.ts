import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'working_copies' AND column_name = 'related_id' AND data_type = 'text') THEN
      ALTER TABLE "working_copies" ALTER COLUMN "related_id" TYPE numeric USING "related_id"::numeric;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'news' AND column_name = 'content') THEN
      ALTER TABLE "news" RENAME COLUMN "content" TO "layout";
    END IF;
  END $$;
  ALTER TABLE "event_categories" ALTER COLUMN "color" SET DEFAULT '#1D4ED8';
  ALTER TABLE "_news_v" ADD COLUMN IF NOT EXISTS "version_layout" jsonb;
  ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "layout" jsonb;
  ALTER TABLE "_events_v" ADD COLUMN IF NOT EXISTS "version_layout" jsonb;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "working_copies_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "logo_id" integer;
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_working_copies_fk') THEN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_working_copies_fk" FOREIGN KEY ("working_copies_id") REFERENCES "public"."working_copies"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_settings_logo_id_media_id_fk') THEN
      ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_working_copies_id_idx" ON "payload_locked_documents_rels" USING btree ("working_copies_id");
  CREATE INDEX IF NOT EXISTS "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  ALTER TABLE "_news_v" DROP COLUMN IF EXISTS "version_content";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "description";
  ALTER TABLE "_events_v" DROP COLUMN IF EXISTS "version_description";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "working_copies" ALTER COLUMN "related_id" TYPE text USING "related_id"::text;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_working_copies_fk";
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_logo_id_media_id_fk";
  DROP INDEX "payload_locked_documents_rels_working_copies_id_idx";
  DROP INDEX "site_settings_logo_idx";
  ALTER TABLE "event_categories" ALTER COLUMN "color" SET DEFAULT '#3B82F6';
  ALTER TABLE "news" ADD COLUMN "content" jsonb;
  ALTER TABLE "_news_v" ADD COLUMN "version_content" jsonb;
  ALTER TABLE "events" ADD COLUMN "description" jsonb;
  ALTER TABLE "_events_v" ADD COLUMN "version_description" jsonb;
  ALTER TABLE "news" DROP COLUMN "layout";
  ALTER TABLE "_news_v" DROP COLUMN "version_layout";
  ALTER TABLE "events" DROP COLUMN "layout";
  ALTER TABLE "_events_v" DROP COLUMN "version_layout";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "working_copies_id";
  ALTER TABLE "site_settings" DROP COLUMN "logo_id";`)
}
