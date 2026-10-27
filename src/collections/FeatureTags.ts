import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'

export const FeatureTags: CollectionConfig = {
  slug: 'feature-tags',
  dbName: 'blog_feature_tags',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'icon', 'priority', 'badgeColor', 'slug'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user && (user.role === 'admin' || user.role === 'artist')),
    update: ({ req: { user } }) => Boolean(user && (user.role === 'admin' || user.role === 'artist')),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Tag title (e.g. "Editor\'s Choice", "Trending", "Most Popular")',
      },
    },
    {
      name: 'icon',
      type: 'text',
      admin: {
        description: 'Optional emoji or icon symbol (e.g. ⭐, 🔥, 🏆, 💡, 📈)',
      },
    },
    {
      name: 'priority',
      type: 'number',
      defaultValue: 0,
      admin: {
        description:
          'Higher priority score shows first at the top of the feed (e.g. 100 before 50). If equal or 0, ties are sorted alphabetically.',
      },
    },
    {
      name: 'badgeColor',
      type: 'select',
      defaultValue: 'gold',
      options: [
        { label: 'Gold / Amber (⭐ Editor Choice / Featured)', value: 'gold' },
        { label: 'Flame / Red (🔥 Trending / Hot)', value: 'flame' },
        { label: 'Blue / Indigo (💡 Informative / Guide)', value: 'blue' },
        { label: 'Purple / Violet (🏆 Most Popular)', value: 'purple' },
        { label: 'Green / Emerald (🌱 Fresh / Update)', value: 'green' },
      ],
      admin: {
        description: 'Visual accent color theme for this badge on the frontend',
      },
    },
    slugField({ source: 'name' }),
  ],
}

