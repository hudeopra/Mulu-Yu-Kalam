import type { Field } from 'payload'
import { formatSlug } from '../utilities/formatSlug'

export type SlugFieldOptions = {
  source?: string
  position?: 'sidebar'
  name?: string
  label?: string
}

export const slugField = ({
  source = 'title',
  position,
  name = 'slug',
  label = 'Slug',
}: SlugFieldOptions = {}): Field => ({
  name,
  type: 'text',
  label,
  required: true,
  unique: true,
  index: true,
  admin: {
    position,
    readOnly: true,
    description: `Auto-generated in real-time from ${source}`,
    components: {
      Field: {
        path: '/components/admin/SlugField#SlugField',
        clientProps: {
          source,
        },
      },
    },
    custom: {
      source,
    },
  },
  hooks: {
    beforeValidate: [formatSlug(source)],
  },
})

