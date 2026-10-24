import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { s3Storage } from '@payloadcms/storage-s3'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Posts } from './collections/Posts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    theme: 'light',
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '- Mulu Yu Kalam Studio',
    },
    components: {
      header: ['/components/admin/AdminHeader#AdminHeader'],
      beforeDashboard: ['/components/admin/DashboardBanner#DashboardBanner'],
      graphics: {
        Logo: '/components/admin/Logo#Logo',
        Icon: '/components/admin/Icon#Icon',
      },
    },
  },
  routes: {
    admin: '/cms',
  },
  collections: [Users, Media, Categories, Posts],
  plugins: [
    s3Storage({
      collections: {
        media: process.env.R2_PUBLIC_URL
          ? {
              generateFileURL: ({ filename }) =>
                `${process.env.R2_PUBLIC_URL!.replace(/\/$/, '')}/${filename}`,
            }
          : true,
      },
      bucket: process.env.R2_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        region: 'auto',
        endpoint: process.env.R2_ENDPOINT,
        forcePathStyle: false,
      },
      enabled: Boolean(process.env.R2_BUCKET),
    }),
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  graphQL: {
    disable: true,
  },
})
