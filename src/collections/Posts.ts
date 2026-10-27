import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { calculateReadTime } from '../utilities/calculateReadTime'

export const Posts: CollectionConfig = {
  slug: 'posts',
  dbName: 'blog_posts',
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
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => {
      if (!user) return false
      // Admins and editors can update any post
      if (user.role === 'admin' || user.role === 'artist') return true
      // Authors can update posts where they are assigned as author
      return {
        authors: {
          contains: user.id,
        },
      }
    },
    delete: ({ req: { user } }) => {
      // Only Admins & Editors can delete posts. No other role can delete posts.
      return user?.role === 'admin'
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
      defaultValue: ({ user }) => (user?.id ? [user.id] : []),
      admin: {
        position: 'sidebar',
        description: 'Post author(s). Automatically assigned to you on creation.',
        // Only show author selection dropdown if:
        // 1. The user is an admin or editor
        // OR 2. Another user is editing an existing post whose author is someone else
        condition: (data, siblingData, { user }) => {
          if (user?.role === 'admin' || user?.role === 'artist') return true

          if (Array.isArray(data?.authors) && data.authors.length > 0) {
            const firstAuthor = data.authors[0]
            const firstAuthorId =
              typeof firstAuthor === 'object' && firstAuthor !== null ? firstAuthor.id : firstAuthor
            if (firstAuthorId && firstAuthorId !== user?.id) {
              return true
            }
          }

          return false
        },
      },
      hooks: {
        beforeChange: [
          ({ req, operation, value }) => {
            // Ensure logged-in user is set as author if not manually passed
            if (operation === 'create' && (!value || (Array.isArray(value) && value.length === 0))) {
              if (req.user?.id) {
                return [req.user.id]
              }
            }
            return value
          },
        ],
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
