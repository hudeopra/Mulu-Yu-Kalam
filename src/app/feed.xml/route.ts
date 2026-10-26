import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Category, Media, User } from '@/payload-types'

// Cache feed for 1 hour with stale-while-revalidate
export const revalidate = 3600

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function cleanCdata(val: unknown): string {
  if (val === null || val === undefined) return ''
  return String(val).replace(/]]>/g, ']]]]><![CDATA[>')
}

export async function GET(request: Request) {
  const payload = await getPayload({ config: configPromise })

  // Dynamically resolve baseUrl from request or environment
  const url = new URL(request.url)
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || url.host
  const proto = request.headers.get('x-forwarded-proto') || url.protocol.replace(':', '') || 'https'

  let baseUrl = `${proto}://${host}`
  if (!host || host.includes('localhost')) {
    if (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')) {
      baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    } else if (process.env.NEXT_PUBLIC_SERVER_URL && !process.env.NEXT_PUBLIC_SERVER_URL.includes('localhost')) {
      baseUrl = process.env.NEXT_PUBLIC_SERVER_URL
    } else if (process.env.NODE_ENV === 'production') {
      baseUrl = 'https://muluyukalam.com.np'
    }
  }
  baseUrl = baseUrl.replace(/\/+$/, '')

  const defaultCreatorName = process.env.DEFAULT_CREATOR_NAME || 'Mulu Yu Kalam'
  const defaultFeedEmail =
    process.env.FEED_AUTHOR_EMAIL && !process.env.FEED_AUTHOR_EMAIL.includes('localhost')
      ? process.env.FEED_AUTHOR_EMAIL
      : `noreply@${host && !host.includes('localhost') ? host : 'muluyukalam.com.np'}`

  // Fetch published posts with overrideAccess: true to populate author details
  const postsResult = await payload.find({
    collection: 'posts',
    depth: 2,
    overrideAccess: true,
    where: {
      _status: {
        equals: 'published',
      },
    },
    sort: '-publishedAt',
    limit: 50,
  })

  const itemsXml = postsResult.docs
    .map((post) => {
      const postUrl = `${baseUrl}/posts/${post.slug}`
      const pubDate = new Date(post.publishedAt || post.createdAt).toUTCString()

      // Resolve author public creator name: priority username -> name -> default from .env
      let creatorName = defaultCreatorName
      let authorEmail = defaultFeedEmail

      if (post.authors && post.authors.length > 0) {
        const firstAuthor = post.authors[0]
        if (typeof firstAuthor === 'object' && firstAuthor !== null) {
          const u = firstAuthor as User
          creatorName = u.username
            ? (u.username.startsWith('@') ? u.username : `@${u.username}`)
            : (u.name || defaultCreatorName)

          authorEmail = u.publicEmail || defaultFeedEmail
        }
      }

      const heroImage =
        typeof post.heroImage === 'object' && post.heroImage !== null
          ? (post.heroImage as Media)
          : null

      const categoryTags = (post.categories || [])
        .map((cat) => {
          const title = typeof cat === 'object' && cat !== null ? (cat as Category).title : String(cat)
          return `<category><![CDATA[${cleanCdata(title)}]]></category>`
        })
        .join('\n      ')

      let enclosure = ''
      if (heroImage?.url) {
        const fullImageUrl = heroImage.url.startsWith('http')
          ? heroImage.url
          : `${baseUrl}${heroImage.url.startsWith('/') ? '' : '/'}${heroImage.url}`

        enclosure = `<enclosure url="${escapeXml(fullImageUrl)}" length="${heroImage.filesize || 0}" type="${escapeXml(heroImage.mimeType || 'image/jpeg')}" />`
      }

      return `    <item>
      <title><![CDATA[${cleanCdata(post.title)}]]></title>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
      <pubDate>${pubDate}</pubDate>
      <author><![CDATA[${cleanCdata(`${authorEmail} (${creatorName})`)}]]></author>
      <dc:creator><![CDATA[${cleanCdata(creatorName)}]]></dc:creator>
      <description><![CDATA[${cleanCdata(post.excerpt || post.meta?.description || post.title)}]]></description>
      ${categoryTags}
      ${enclosure}
    </item>`
    })
    .join('\n')

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title><![CDATA[Mulu Yu Kalam | Studio Journal & Ink Culture]]></title>
    <link>${escapeXml(`${baseUrl}/posts`)}</link>
    <description><![CDATA[Latest stories, custom tattoo craftsmanship, Newari cultural motifs, aftercare wisdom, and studio insights from Harisiddhi, Lalitpur.]]></description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(`${baseUrl}/feed.xml`)}" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}

