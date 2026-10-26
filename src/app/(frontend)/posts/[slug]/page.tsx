import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Category, Media, User, FeatureTag } from '@/payload-types'
import { BlogNav } from '@/components/blog/BlogNav'
import { Footer } from '@/components/landing/Footer'
import { ArrowLeft, Calendar, Clock, Sparkles, ChevronRight } from 'lucide-react'
import '@/components/blog/blog.css'

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    where: {
      slug: {
        equals: slug,
      },
    },
    depth: 1,
  })

  const post = result.docs?.[0]

  if (!post) {
    return {
      title: 'Post Not Found | Mulu Yu Kalam Journal',
    }
  }

  return {
    title: `${post.title} | Mulu Yu Kalam Studio Journal`,
    description: post.excerpt || `Read "${post.title}" on Mulu Yu Kalam Studio Journal.`,
  }
}

export default async function PostPage({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    where: {
      slug: {
        equals: slug,
      },
    },
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

  const featureTag =
    typeof post.featureTag === 'object' && post.featureTag !== null
      ? (post.featureTag as FeatureTag)
      : null

  const authors = Array.isArray(post.authors)
    ? post.authors
        .map((a) => (typeof a === 'object' && a !== null ? (a as User).name || (a as User).email : ''))
        .filter(Boolean)
        .join(', ')
    : ''

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] font-sans antialiased text-[#2e0249]">
      <BlogNav />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-[#887766] mb-8 overflow-x-auto whitespace-nowrap pb-1">
          <Link href="/" className="hover:text-[#ff7b01] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#ccc2b6] shrink-0" />
          <Link href="/posts" className="hover:text-[#ff7b01] transition-colors">
            Studio Journal
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#ccc2b6] shrink-0" />
          <span className="text-[#2e0249] truncate max-w-[200px] sm:max-w-xs">
            {post.title}
          </span>
        </nav>

        {/* Back Link */}
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#ede3d4] text-xs font-bold text-[#665544] hover:text-[#ff7b01] hover:border-[#ffbd5b] transition-all mb-8 shadow-2xs hover:shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to all stories</span>
        </Link>

        {/* Article Header */}
        <header className="mb-10">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {featureTag && (
              <span className="inline-flex items-center gap-1.5 bg-[#2e0249] text-[#ffbd5b] px-3.5 py-1 rounded-full text-xs font-bold border border-[#ffbd5b]/30 shadow-xs">
                {featureTag.icon && <span>{featureTag.icon}</span>}
                <span>{featureTag.name}</span>
              </span>
            )}

            {Array.isArray(post.categories) &&
              post.categories.map((c) => {
                const cat = typeof c === 'object' && c !== null ? (c as Category) : null
                if (!cat) return null
                return (
                  <span
                    key={cat.id}
                    className="text-xs font-bold tracking-wide uppercase px-3 py-1 rounded-full bg-[#fff5ea] text-[#ff7b01] border border-[#ff7b01]/25"
                  >
                    {cat.title}
                  </span>
                )
              })}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#2e0249] tracking-tight leading-tight mb-6">
            {post.title}
          </h1>

          {/* Byline Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#776655] pb-6 border-b border-[#ede3d4]">
            {authors && (
              <span className="font-semibold text-[#2e0249]">
                Written by {authors}
              </span>
            )}

            {post.publishedAt && (
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-[#ff7b01]" />
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            )}

            {post.readTime && (
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-[#ff7b01]" />
                {post.readTime} min read
              </span>
            )}
          </div>
        </header>

        {/* Featured Hero Image */}
        {heroImage?.url && (
          <div className="relative aspect-16/9 rounded-3xl overflow-hidden border border-[#ede3d4] shadow-md mb-10 bg-white">
            <Image
              src={heroImage.url}
              alt={heroImage.alt || post.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        )}

        {/* Excerpt Lead Quote */}
        {post.excerpt && (
          <blockquote className="my-8 pl-6 border-l-4 border-[#ff7b01] text-lg sm:text-xl font-medium italic text-[#4a3b30] bg-white/60 p-5 rounded-r-2xl border-t border-r border-b border-[#ede3d4]/50">
            &ldquo;{post.excerpt}&rdquo;
          </blockquote>
        )}

        {/* RichText Article Body */}
        <article className="bg-white rounded-3xl border border-[#ede3d4] p-6 sm:p-10 md:p-12 shadow-xs mb-14">
          <div className="blog-rich-text">
            <RichText data={post.content} />
          </div>
        </article>

        {/* Bottom Booking / Consultation Banner */}
        <div className="rounded-3xl bg-[#2e0249] p-8 sm:p-10 text-white mb-16 relative overflow-hidden shadow-lg shadow-[#2e0249]/10">
          <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-radial from-[#ff7b01]/30 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ffbd5b] tracking-wider uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Mulu Yu Kalam Tattoo Studio
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Inspired by this artwork?
            </h3>
            <p className="text-sm text-[#ffdca9]/80 leading-relaxed mb-6">
              Our resident artists in Harisiddhi, Lalitpur specialize in bespoke custom tattoos,
              fine-line craftsmanship, and traditional Newari iconography.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 bg-[#ff7b01] hover:bg-[#e06c00] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all hover:-translate-y-0.5"
              >
                <span>Book a Consultation</span>
              </Link>
              <Link
                href="/posts"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-xs font-semibold border border-white/20 transition-colors"
              >
                <span>Browse More Stories</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

