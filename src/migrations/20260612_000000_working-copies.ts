import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_working_copies_collection" AS ENUM('events', 'news');

    CREATE TABLE "working_copies" (
      "id" serial PRIMARY KEY NOT NULL,
      "author_id" integer NOT NULL
        REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
      "collection" "enum_working_copies_collection" NOT NULL,
      "related_id" varchar,
      "data" jsonb NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE INDEX "working_copies_author_idx"
      ON "working_copies" USING btree ("author_id");
    CREATE INDEX "working_copies_updated_at_idx"
      ON "working_copies" USING btree ("updated_at");
    CREATE INDEX "working_copies_created_at_idx"
      ON "working_copies" USING btree ("created_at");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "working_copies";
    DROP TYPE IF EXISTS "public"."enum_working_copies_collection";
  `)
}
