import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  dbName: 'blog_categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user && (user.role === 'admin' || user.role === 'artist')),
    update: ({ req: { user } }) => Boolean(user && (user.role === 'admin' || user.role === 'artist')),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({ source: 'title' }),
  ],
}
