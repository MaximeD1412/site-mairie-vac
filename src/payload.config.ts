import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Navigation } from './collections/Navigation'
import { News } from './collections/News'
import { Events } from './collections/Events'
import { Documents } from './collections/Documents'
import { Associations } from './collections/Associations'
import { ElectedOfficials } from './collections/ElectedOfficials'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const s3Enabled = process.env.S3_ENABLED === 'true'

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Site communal'
    }
  },
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts')
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./data/payload.db'
    }
  }),
  collections: [
    Users,
    Media,
    Pages,
    Navigation,
    News,
    Events,
    Documents,
    Associations,
    ElectedOfficials
  ],
  plugins: [
    ...(s3Enabled
      ? [
          s3Storage({
            collections: {
              media: true
            },
            bucket: process.env.S3_BUCKET || '',
            config: {
              region: process.env.S3_REGION || 'fr',
              endpoint: process.env.S3_ENDPOINT,
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ''
              },
              forcePathStyle: true
            }
          })
        ]
      : [])
  ]
})
