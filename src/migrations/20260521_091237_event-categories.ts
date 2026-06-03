import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "event_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"color" varchar DEFAULT '#3B82F6' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "event_categories_id" integer;
  ALTER TABLE "events" ADD COLUMN "category_id" integer;
  ALTER TABLE "_events_v" ADD COLUMN "version_category_id" integer;
  ALTER TABLE "events" DROP COLUMN "category";
  ALTER TABLE "_events_v" DROP COLUMN "version_category";
  DROP TYPE "public"."enum_events_category";
  DROP TYPE "public"."enum__events_v_version_category";
  ALTER TABLE "event_categories" ADD CONSTRAINT "event_categories_slug_unique" UNIQUE("slug");
  ALTER TABLE "events" ADD CONSTRAINT "events_category_id_event_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."event_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_category_id_event_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."event_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_event_categories_id_event_categories_id_fk" FOREIGN KEY ("event_categories_id") REFERENCES "public"."event_categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "event_categories_slug_idx" ON "event_categories" USING btree ("slug");
  CREATE INDEX "event_categories_updated_at_idx" ON "event_categories" USING btree ("updated_at");
  CREATE INDEX "event_categories_created_at_idx" ON "event_categories" USING btree ("created_at");
  CREATE INDEX "events_category_idx" ON "events" USING btree ("category_id");
  CREATE INDEX "_events_v_version_category_idx" ON "_events_v" USING btree ("version_category_id");
  CREATE INDEX "payload_locked_documents_rels_event_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("event_categories_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_events_category" AS ENUM('municipal', 'association', 'culture', 'sport', 'ecole', 'bibliotheque', 'autre');
  CREATE TYPE "public"."enum__events_v_version_category" AS ENUM('municipal', 'association', 'culture', 'sport', 'ecole', 'bibliotheque', 'autre');
  DROP INDEX "event_categories_slug_idx";
  DROP INDEX "event_categories_updated_at_idx";
  DROP INDEX "event_categories_created_at_idx";
  DROP INDEX "events_category_idx";
  DROP INDEX "_events_v_version_category_idx";
  DROP INDEX "payload_locked_documents_rels_event_categories_id_idx";
  ALTER TABLE "events" DROP CONSTRAINT "events_category_id_event_categories_id_fk";
  ALTER TABLE "_events_v" DROP CONSTRAINT "_events_v_version_category_id_event_categories_id_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_event_categories_id_event_categories_id_fk";
  ALTER TABLE "events" ADD COLUMN "category" "enum_events_category";
  ALTER TABLE "_events_v" ADD COLUMN "version_category" "enum__events_v_version_category";
  ALTER TABLE "events" DROP COLUMN "category_id";
  ALTER TABLE "_events_v" DROP COLUMN "version_category_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "event_categories_id";
  DROP TABLE "event_categories" CASCADE;
  `)
}
