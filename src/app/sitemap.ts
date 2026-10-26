import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config: configPromise })

  let baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SERVER_URL

  try {
    const headersList = await headers()
    const host = headersList.get('x-forwarded-host') || headersList.get('host')
    const proto = headersList.get('x-forwarded-proto') || 'https'
    if (host && !host.includes('localhost')) {
      baseUrl = `${proto}://${host}`
    }
  } catch {
    // Fallback in static / build time context
  }

  const finalBaseUrl = (
    baseUrl && (!baseUrl.includes('localhost') || process.env.NODE_ENV !== 'production')
      ? baseUrl
      : 'https://muluyukalam.com.np'
  ).replace(/\/+$/, '')

  // Fetch all published posts
  const postsResult = await payload.find({
    collection: 'posts',
    where: {
      _status: {
        equals: 'published',
      },
    },
    limit: 1000,
    depth: 0,
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  // Fetch all categories
  const categoriesResult = await payload.find({
    collection: 'categories',
    limit: 100,
    depth: 0,
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  const postEntries: MetadataRoute.Sitemap = postsResult.docs
    .filter((post) => Boolean(post.slug))
    .map((post) => ({
      url: `${finalBaseUrl}/posts/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

  const categoryEntries: MetadataRoute.Sitemap = categoriesResult.docs
    .filter((cat) => Boolean(cat.slug))
    .map((cat) => ({
      url: `${finalBaseUrl}/categories/${cat.slug}`,
      lastModified: new Date(cat.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.6,
    }))

  return [
    {
      url: finalBaseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${finalBaseUrl}/posts`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...postEntries,
    ...categoryEntries,
  ]
}
