import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. Add layout jsonb columns
  await db.execute(sql`
    ALTER TABLE "news"       ADD COLUMN "layout" jsonb;
    ALTER TABLE "_news_v"    ADD COLUMN "version_layout" jsonb;
    ALTER TABLE "events"     ADD COLUMN "layout" jsonb;
    ALTER TABLE "_events_v"  ADD COLUMN "version_layout" jsonb;
  `)

  // 2. Wrap news.content HTML → [{ id, type: 'richText', html }]
  const newsRows = await db.execute<{ id: number; content: string | null }>(
    sql`SELECT id, content FROM news`
  )
  for (const row of (newsRows as any).rows ?? []) {
    const layout = row.content?.trim()
      ? [{ id: crypto.randomUUID(), type: 'richText', html: row.content }]
      : []
    await db.execute(sql`UPDATE news SET layout = ${JSON.stringify(layout)}::jsonb WHERE id = ${row.id}`)
  }

  // 3. Same for _news_v
  const newsVRows = await db.execute<{ id: number; version_content: string | null }>(
    sql`SELECT id, version_content FROM _news_v`
  )
  for (const row of (newsVRows as any).rows ?? []) {
    const layout = row.version_content?.trim()
      ? [{ id: crypto.randomUUID(), type: 'richText', html: row.version_content }]
      : []
    await db.execute(sql`UPDATE _news_v SET version_layout = ${JSON.stringify(layout)}::jsonb WHERE id = ${row.id}`)
  }

  // 4. Wrap events.description HTML → [{ id, type: 'richText', html }]
  const eventsRows = await db.execute<{ id: number; description: string | null }>(
    sql`SELECT id, description FROM events`
  )
  for (const row of (eventsRows as any).rows ?? []) {
    const layout = row.description?.trim()
      ? [{ id: crypto.randomUUID(), type: 'richText', html: row.description }]
      : []
    await db.execute(sql`UPDATE events SET layout = ${JSON.stringify(layout)}::jsonb WHERE id = ${row.id}`)
  }

  // 5. Same for _events_v
  const eventsVRows = await db.execute<{ id: number; version_description: string | null }>(
    sql`SELECT id, version_description FROM _events_v`
  )
  for (const row of (eventsVRows as any).rows ?? []) {
    const layout = row.version_description?.trim()
      ? [{ id: crypto.randomUUID(), type: 'richText', html: row.version_description }]
      : []
    await db.execute(sql`UPDATE _events_v SET version_layout = ${JSON.stringify(layout)}::jsonb WHERE id = ${row.id}`)
  }

  // 6. Drop old columns
  await db.execute(sql`
    ALTER TABLE "news"       DROP COLUMN "content";
    ALTER TABLE "_news_v"    DROP COLUMN "version_content";
    ALTER TABLE "events"     DROP COLUMN "description";
    ALTER TABLE "_events_v"  DROP COLUMN "version_description";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "news"       ADD COLUMN "content" text;
    ALTER TABLE "_news_v"    ADD COLUMN "version_content" text;
    ALTER TABLE "events"     ADD COLUMN "description" text;
    ALTER TABLE "_events_v"  ADD COLUMN "version_description" text;
  `)

  // Extract HTML from first richText block (best-effort)
  const newsRows = await db.execute<{ id: number; layout: unknown }>(
    sql`SELECT id, layout FROM news`
  )
  for (const row of (newsRows as any).rows ?? []) {
    const blocks = Array.isArray(row.layout) ? row.layout : []
    const firstRich = blocks.find((b: any) => b.type === 'richText')
    const html = firstRich?.html ?? null
    await db.execute(sql`UPDATE news SET content = ${html} WHERE id = ${row.id}`)
  }

  const newsVRows = await db.execute<{ id: number; version_layout: unknown }>(
    sql`SELECT id, version_layout FROM _news_v`
  )
  for (const row of (newsVRows as any).rows ?? []) {
    const blocks = Array.isArray(row.version_layout) ? row.version_layout : []
    const firstRich = blocks.find((b: any) => b.type === 'richText')
    const html = firstRich?.html ?? null
    await db.execute(sql`UPDATE _news_v SET version_content = ${html} WHERE id = ${row.id}`)
  }

  const eventsRows = await db.execute<{ id: number; layout: unknown }>(
    sql`SELECT id, layout FROM events`
  )
  for (const row of (eventsRows as any).rows ?? []) {
    const blocks = Array.isArray(row.layout) ? row.layout : []
    const firstRich = blocks.find((b: any) => b.type === 'richText')
    const html = firstRich?.html ?? null
    await db.execute(sql`UPDATE events SET description = ${html} WHERE id = ${row.id}`)
  }

  const eventsVRows = await db.execute<{ id: number; version_layout: unknown }>(
    sql`SELECT id, version_layout FROM _events_v`
  )
  for (const row of (eventsVRows as any).rows ?? []) {
    const blocks = Array.isArray(row.version_layout) ? row.version_layout : []
    const firstRich = blocks.find((b: any) => b.type === 'richText')
    const html = firstRich?.html ?? null
    await db.execute(sql`UPDATE _events_v SET version_description = ${html} WHERE id = ${row.id}`)
  }

  await db.execute(sql`
    ALTER TABLE "news"       DROP COLUMN "layout";
    ALTER TABLE "_news_v"    DROP COLUMN "version_layout";
    ALTER TABLE "events"     DROP COLUMN "layout";
    ALTER TABLE "_events_v"  DROP COLUMN "version_layout";
  `)
}
