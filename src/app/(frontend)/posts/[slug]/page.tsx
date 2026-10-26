import type { Metadata } from 'next'
import { cache } from 'react'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import type { Category, Media, Post, User } from '@/payload-types'
import { PostView } from './PostView'

// Enable Incremental Static Regeneration (ISR): Cache pages for 60 seconds
export const revalidate = 60

type Args = {
  params: Promise<{
    slug?: string
  }>
}

/**
 * Pre-generate static HTML for all published posts at build time.
 * Subsequent visits load instantly (< 20ms) from Next.js cache.
 */
export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const posts = await payload.find({
      collection: 'posts',
      where: {
        _status: {
          equals: 'published',
        },
      },
      limit: 1000,
      select: {
        slug: true,
      },
    })

    return posts.docs.map((doc) => ({
      slug: doc.slug,
    }))
  } catch {
    return []
  }
}

/**
 * Deduplicate database query between generateMetadata() and PostPage().
 * React cache() guarantees this only hits PostgreSQL ONCE per request.
 */
const queryPostBySlug = cache(async (slug: string, isDraft: boolean, user?: any) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        ...(isDraft
          ? []
          : [
              {
                _status: {
                  equals: 'published' as const,
                },
              },
            ]),
      ],
    },
    draft: isDraft,
    user,
    depth: 2,
    limit: 1,
  })

  return result.docs?.[0] || null
})

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  const post = await queryPostBySlug(slug, Boolean(user), user)
  if (!post) {
    return {
      title: 'Story Not Found | Mulu Yu Kalam Journal',
    }
  }

  const title = post.meta?.title || `${post.title} | Mulu Yu Kalam Journal`
  const description =
    post.meta?.description || post.excerpt || 'Read this story on Mulu Yu Kalam Studio Journal'

  const metaImage =
    typeof post.meta?.image === 'object' && post.meta.image !== null
      ? (post.meta.image as Media).url
      : typeof post.heroImage === 'object' && post.heroImage !== null
      ? (post.heroImage as Media).url
      : undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt,
      url: `/posts/${post.slug}`,
      images: metaImage ? [{ url: metaImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: metaImage ? [metaImage] : [],
    },
    alternates: {
      canonical: `/posts/${post.slug}`,
    },
  }
}

export default async function PostPage({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  const post = await queryPostBySlug(slug, Boolean(user), user)

  if (!post) {
    notFound()
  }

  const heroImage =
    typeof post.heroImage === 'object' && post.heroImage !== null
      ? (post.heroImage as Media)
      : null

  // --- SMART RELATED POSTS RESOLUTION ---
  // 1. Manual related posts curated by author in CMS
  const manualRelated: Post[] = (post.relatedPosts || []).filter(
    (p): p is Post => typeof p === 'object' && p !== null && p._status === 'published',
  )

  const collectedIds = new Set<number>([post.id, ...manualRelated.map((p) => p.id)])
  let finalRelatedPosts: Post[] = [...manualRelated]

  // 2. Auto-match by Category (boosted by featureTag) if fewer than 3
  if (finalRelatedPosts.length < 3) {
    const categoryIds = (post.categories || [])
      .map((cat) => (typeof cat === 'object' && cat !== null ? cat.id : (cat as number)))
      .filter(Boolean)

    if (categoryIds.length > 0) {
      const categoryResult = await payload.find({
        collection: 'posts',
        depth: 2,
        limit: 8,
        where: {
          and: [
            {
              id: {
                not_in: Array.from(collectedIds),
              },
            },
            {
              _status: {
                equals: 'published',
              },
            },
            {
              categories: {
                in: categoryIds,
              },
            },
          ],
        },
      })

      // Boost featured stories
      const sortedCatPosts = [...categoryResult.docs].sort((a: Post, b: Post) => {
        const tagA =
          typeof a.featureTag === 'object' && a.featureTag !== null ? (a.featureTag as any) : null
        const tagB =
          typeof b.featureTag === 'object' && b.featureTag !== null ? (b.featureTag as any) : null

        if (tagA && !tagB) return -1
        if (!tagA && tagB) return 1
        if (tagA && tagB) {
          const priorityA = tagA.priority ?? 0
          const priorityB = tagB.priority ?? 0
          if (priorityB !== priorityA) return priorityB - priorityA
        }

        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
        return dateB - dateA
      })

      for (const p of sortedCatPosts) {
        if (finalRelatedPosts.length >= 3) break
        finalRelatedPosts.push(p)
        collectedIds.add(p.id)
      }
    }
  }

  // 3. Fallback: Fill remaining slots with newest published posts
  if (finalRelatedPosts.length < 3) {
    const fallbackResult = await payload.find({
      collection: 'posts',
      depth: 2,
      limit: 3 - finalRelatedPosts.length,
      where: {
        and: [
          {
            id: {
              not_in: Array.from(collectedIds),
            },
          },
          {
            _status: {
              equals: 'published',
            },
          },
        ],
      },
      sort: '-publishedAt',
    })

    finalRelatedPosts = [...finalRelatedPosts, ...fallbackResult.docs]
  }

  // --- CHRONOLOGICAL PREVIOUS & NEXT ARTICLES ---
  const currentPublishedAt = post.publishedAt || post.createdAt

  const [prevResult, nextResult] = await Promise.all([
    // Previous (older article)
    payload.find({
      collection: 'posts',
      where: {
        and: [
          {
            _status: {
              equals: 'published',
            },
          },
          {
            id: {
              not_equals: post.id,
            },
          },
          {
            publishedAt: {
              less_than_equal: currentPublishedAt,
            },
          },
        ],
      },
      sort: '-publishedAt',
      limit: 1,
      depth: 0,
      select: {
        slug: true,
        title: true,
        publishedAt: true,
      },
    }),
    // Next (newer article)
    payload.find({
      collection: 'posts',
      where: {
        and: [
          {
            _status: {
              equals: 'published',
            },
          },
          {
            id: {
              not_equals: post.id,
            },
          },
          {
            publishedAt: {
              greater_than_equal: currentPublishedAt,
            },
          },
        ],
      },
      sort: 'publishedAt',
      limit: 1,
      depth: 0,
      select: {
        slug: true,
        title: true,
        publishedAt: true,
      },
    }),
  ])

  const prevPost = (prevResult.docs[0] as Pick<Post, 'slug' | 'title' | 'publishedAt'>) || null
  const nextPost = (nextResult.docs[0] as Pick<Post, 'slug' | 'title' | 'publishedAt'>) || null

  // --- GOOGLE ARTICLE & BREADCRUMB SCHEMA.ORG STRUCTURED DATA ---
  const firstCategory =
    post.categories && post.categories.length > 0 && typeof post.categories[0] === 'object' && post.categories[0] !== null
      ? (post.categories[0] as Category)
      : null

  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: '/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Studio Journal',
        item: '/posts',
      },
      ...(firstCategory
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: firstCategory.title,
              item: `/posts?category=${firstCategory.slug}`,
            },
            {
              '@type': 'ListItem',
              position: 4,
              name: post.title,
              item: `/posts/${post.slug}`,
            },
          ]
        : [
            {
              '@type': 'ListItem',
              position: 3,
              name: post.title,
              item: `/posts/${post.slug}`,
            },
          ]),
    ],
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta?.description || post.excerpt || '',
    image: heroImage?.url ? [heroImage.url] : [],
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author:
      post.authors && post.authors.length > 0
        ? post.authors.map((author) => ({
            '@type': 'Person',
            name:
              typeof author === 'object' && author !== null
                ? (author as User).name || (author as User).email
                : 'Studio Artist',
          }))
        : [{ '@type': 'Person', name: 'Mulu Yu Kalam Artist' }],
    publisher: {
      '@type': 'Organization',
      name: 'Mulu Yu Kalam Tattoo Studio',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `/posts/${post.slug}`,
    },
  }

  return (
    <>
      {/* Schema.org Rich Snippet for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Google Breadcrumbs Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <PostView
        initialPost={post}
        relatedPosts={finalRelatedPosts}
        prevPost={prevPost}
        nextPost={nextPost}
      />
    </>
  )
}
