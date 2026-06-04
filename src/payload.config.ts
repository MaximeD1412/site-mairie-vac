import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Navigation } from './collections/Navigation'
import { News } from './collections/News'
import { EventCategories } from './collections/EventCategories'
import { Events } from './collections/Events'
import { Documents } from './collections/Documents'
import { Associations } from './collections/Associations'
import { ElectedOfficials } from './collections/ElectedOfficials'
import { SiteSettings } from './globals/SiteSettings'
import { MairieInfo } from './globals/MairieInfo'
import { HomepageSettings } from './globals/HomepageSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const s3Enabled = process.env.S3_ENABLED === 'true'

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- La Ville-aux-Clercs'
    },
    components: {
      graphics: {
        Logo: '@/components/admin/Logo',
        Icon: '@/components/admin/Icon',
      },
      views: {
        dashboard: {
          Component: '@/components/admin/Dashboard',
        },
      },
    },
  },
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET!,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts')
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL
    },
    push: false
  }),
  collections: [
    Users,
    Media,
    Pages,
    Navigation,
    News,
    EventCategories,
    Events,
    Documents,
    Associations,
    ElectedOfficials
  ],
  globals: [SiteSettings, MairieInfo, HomepageSettings],
  plugins: [
    ...(s3Enabled
      ? [
          s3Storage({
            collections: {
              media: true
            },
            bucket: process.env.S3_BUCKET || '',
            config: {
              region: process.env.S3_REGION || 'gra',
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
