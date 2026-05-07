import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_image_id\` integer,
  	\`hero_title\` text DEFAULT 'La Ville-aux-Clercs',
  	\`hero_subtitle\` text DEFAULT 'Bienvenue sur le site officiel de la mairie',
  	\`panneau_pocket_url\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_hero_image_idx\` ON \`site_settings\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE TABLE \`mairie_info_opening_hours\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`days\` text,
  	\`hours\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`mairie_info\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`mairie_info_opening_hours_order_idx\` ON \`mairie_info_opening_hours\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`mairie_info_opening_hours_parent_id_idx\` ON \`mairie_info_opening_hours\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`mairie_info\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`address\` text DEFAULT '1 Rue de la Mairie, 41160 La Ville-aux-Clercs',
  	\`phone\` text DEFAULT '02.54.80.62.55',
  	\`email\` text,
  	\`facebook_url\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`homepage_settings_quick_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`icon\` text NOT NULL,
  	\`href\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_settings_quick_links_order_idx\` ON \`homepage_settings_quick_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_settings_quick_links_parent_id_idx\` ON \`homepage_settings_quick_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`mairie_info_opening_hours\`;`)
  await db.run(sql`DROP TABLE \`mairie_info\`;`)
  await db.run(sql`DROP TABLE \`homepage_settings_quick_links\`;`)
  await db.run(sql`DROP TABLE \`homepage_settings\`;`)
}
