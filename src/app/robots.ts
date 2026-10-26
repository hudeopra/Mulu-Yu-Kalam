import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'

export default async function robots(): Promise<MetadataRoute.Robots> {
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

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/posts', '/categories', '/feed.xml', '/rss.xml'],
        disallow: ['/admin', '/admin/*', '/cms', '/cms/*', '/login', '/login/*'],
      },
    ],
    sitemap: `${finalBaseUrl}/sitemap.xml`,
  }
}
