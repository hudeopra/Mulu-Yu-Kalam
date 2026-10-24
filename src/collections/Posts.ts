import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'publishedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    // --- MAIN CONTENT AREA ---
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Featured header image for the post',
              },
            },
            {
              name: 'content',
              type: 'richText',
              required: true,
            },
          ],
        },
      ],
    },

    // --- SIDEBAR AREA (Publishing & Relations) ---
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Publishing status of the article',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Publication date (visible when published)',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        condition: (data) => data?.status === 'published',
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Select one or more authors',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Assign topics/categories',
      },
    },

    // --- SIDEBAR AREA (Meta / SEO Collapsible Section) ---
    {
      type: 'collapsible',
      label: 'Meta / SEO',
      admin: {
        position: 'sidebar',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
          index: true,
          admin: {
            description: 'URL slug (e.g. "my-first-post")',
          },
        },
        {
          name: 'excerpt',
          type: 'textarea',
          admin: {
            description: 'Brief summary displayed on blog cards and search engine results',
          },
        },
      ],
    },
  ],
}

