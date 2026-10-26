import type { FieldHook } from 'payload'

/**
 * Converts any string into a clean, URL-safe slug.
 * e.g., "Hello World! What's New in 2026?" -> "hello-world-whats-new-in-2026"
 */
const format = (val: string): string =>
  val
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // remove special characters
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-') // collapse consecutive hyphens

/**
 * A reusable field hook for automatically generating slugs from a fallback field (like 'title' or 'name').
 * Runs during `beforeValidate` so the `required: true` validation succeeds even if the user leaves the slug empty!
 */
export const formatSlug =
  (fallback: string): FieldHook =>
  ({ operation, value, originalDoc, data }) => {
    // 1. If the user explicitly typed a slug, format it to be URL-safe
    if (typeof value === 'string' && value.trim().length > 0) {
      return format(value)
    }

    // 2. If it's a new document OR the slug is empty, auto-generate it from the fallback field
    if (operation === 'create' || !data?.slug) {
      const fallbackData = data?.[fallback] || originalDoc?.[fallback]

      if (fallbackData && typeof fallbackData === 'string') {
        return format(fallbackData)
      }
    }

    return value
  }

