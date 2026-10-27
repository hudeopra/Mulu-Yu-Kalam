import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  dbName: 'blog_media',
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user && (user.role === 'admin' || user.role === 'artist')),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}

