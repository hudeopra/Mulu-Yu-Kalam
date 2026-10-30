import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { s3Storage } from '@payloadcms/storage-s3';
import { seoPlugin } from '@payloadcms/plugin-seo';

import { Users } from './collections/Users';
import { Media } from './collections/Media';
import { Categories } from './collections/Categories';
import { FeatureTags } from './collections/FeatureTags';
import { Posts } from './collections/Posts';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Ensure Supabase connection uses port 6543 (PgBouncer Transaction Mode) in serverless production
let dbConnectionString = process.env.DATABASE_URI || '';
if (dbConnectionString.includes('.pooler.supabase.com:5432')) {
  dbConnectionString = dbConnectionString.replace(':5432', ':6543');
}
if (
  dbConnectionString.includes(':6543') &&
  !dbConnectionString.includes('pgbouncer=true')
) {
  dbConnectionString +=
    (dbConnectionString.includes('?') ? '&' : '?') + 'pgbouncer=true';
}

export default buildConfig({
  admin: {
    theme: 'light',
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '- Mulu Yu Kalam Studio',
      icons: [
        {
          rel: 'icon',
          type: 'image/png',
          url: '/assets/img/unalome-favicon.png',
        },
        {
          rel: 'shortcut icon',
          type: 'image/png',
          url: '/assets/img/unalome-favicon.png',
        },
        {
          rel: 'apple-touch-icon',
          url: '/assets/img/unalome-favicon.png',
        },
      ],
    },
    components: {
      Nav: '/components/admin/AdminSidebar#AdminSidebar',
      graphics: {
        Logo: '/components/admin/Logo#Logo',
        Icon: '/components/admin/Icon#Icon',
      },
    },
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  routes: {
    admin: '/cms',
  },
  collections: [Users, Media, Categories, FeatureTags, Posts],
  plugins: [
    seoPlugin({
      collections: ['posts'],
      uploadsCollection: 'media',
      tabbedUI: true,
      generateTitle: ({ doc }) =>
        doc?.title ? `${doc.title} | Mulu Yu Kalam Blog` : 'Mulu Yu Kalam Blog',
      generateDescription: ({ doc }) =>
        doc?.excerpt || 'A blog post published on Mulu Yu Kalam',
      generateURL: ({ doc }) => {
        const envUrl = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/+$/, '');
        const baseUrl =
          envUrl &&
          (!envUrl.includes('localhost') ||
            process.env.NODE_ENV !== 'production')
            ? envUrl
            : process.env.NODE_ENV === 'production'
              ? 'https://muluyukalam.com.np'
              : 'http://localhost:3000';
        return doc?.slug ? `${baseUrl}/posts/${doc.slug}` : `${baseUrl}/posts`;
      },
      generateImage: ({ doc }) =>
        typeof doc?.heroImage === 'object' && doc?.heroImage
          ? (doc.heroImage as any).id
          : doc?.heroImage,
    }),
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
  editor: lexicalEditor({
    features: ({ defaultFeatures }) =>
      defaultFeatures.filter((feature) => feature.key !== 'horizontalRule'),
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    push: false,
    tablesFilter: ['blog_*', 'payload_*', '_blog_*'],
    transactionOptions: false,
    pool: {
      connectionString: dbConnectionString,
      max: 10,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
      ssl: dbConnectionString.includes('localhost')
        ? false
        : { rejectUnauthorized: false },
    },
  }),
  sharp,
  graphQL: {
    disable: true,
  },
});
