import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { calculateReadTime } from '../utilities/calculateReadTime'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'featureTag', 'publishedAt'],
    livePreview: {
      url: ({ data }) => `/posts/${data?.slug || ''}`,
    },
  },
  versions: {
    drafts: true,
    maxPerDoc: 10,
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return {
        _status: {
          equals: 'published',
        },
      }
    },
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
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Publication date (visible when published)',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        condition: (data) => data?._status === 'published',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData?._status === 'published' && !value) {
              return new Date().toISOString()
            }
            return value
          },
        ],
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
    {
      name: 'featureTag',
      type: 'relationship',
      relationTo: 'feature-tags',
      hasMany: false,
      admin: {
        position: 'sidebar',
        description: 'Pin this post to the top of the feed with a featured badge',
      },
    },
    {
      name: 'relatedPosts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      filterOptions: ({ id }) => {
        if (id) {
          return {
            id: {
              not_equals: id,
            },
          }
        }
        return true
      },
      admin: {
        position: 'sidebar',
        description: 'Optional manual related posts (up to 3). If empty, auto-matches by category.',
      },
    },
    {
      name: 'readTime',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Estimated reading time in minutes (auto-calculated on save)',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData?.content) {
              return calculateReadTime(siblingData.content)
            }
            return value || 1
          },
        ],
      },
    },
    slugField({ source: 'title' }),
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        position: 'sidebar',
        description: 'Brief summary displayed on blog cards and used as fallback meta description',
      },
    },
  ],
}
