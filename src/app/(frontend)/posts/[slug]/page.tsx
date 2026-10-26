import type { Metadata } from 'next'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import type { Media, Post, User } from '@/payload-types'
import { PostView } from './PostView'

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  const result = await payload.find({
    collection: 'posts',
    where: {
      slug: {
        equals: slug,
      },
    },
    draft: Boolean(user),
    user,
    depth: 1,
    limit: 1,
  })

  const post = result.docs?.[0]
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

  const result = await payload.find({
    collection: 'posts',
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        ...(user
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
    draft: Boolean(user), // Authenticated staff can preview unpublished drafts
    user,
    depth: 2,
  })

  const post = result.docs?.[0]

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

  // --- GOOGLE ARTICLE SCHEMA.ORG STRUCTURED DATA ---
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostView initialPost={post} relatedPosts={finalRelatedPosts} />
    </>
  )
}
