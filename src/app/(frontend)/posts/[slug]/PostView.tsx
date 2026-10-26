'use client'

import React, { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import { useLivePreview } from '@payloadcms/live-preview-react'
import type { Category, FeatureTag, Media, Post, User } from '@/payload-types'
import { BlogNav } from '@/components/blog/BlogNav'
import { Footer } from '@/components/landing/Footer'
import { extractHeadings, extractTextFromNode, slugifyHeading } from '@/utilities/extractHeadings'
import { TableOfContents } from '@/components/TableOfContents'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  ChevronRight,
  Eye,
  ArrowRight,
} from 'lucide-react'
import '@/components/blog/blog.css'

type PostViewProps = {
  initialPost: Post
  relatedPosts: Post[]
}

export function PostView({ initialPost, relatedPosts }: PostViewProps) {
  const serverURL =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.NEXT_PUBLIC_SERVER_URL ||
        'http://localhost:3000'

  // Live Preview hook updates state in real-time as editor types in Payload Admin
  const { data: post } = useLivePreview<Post>({
    initialData: initialPost,
    serverURL,
    depth: 2,
  })

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
        .map((a) =>
          typeof a === 'object' && a !== null ? (a as User).name || (a as User).email : '',
        )
        .filter(Boolean)
        .join(', ')
    : ''

  // Extract h2 and h3 headings from Lexical content for Table of Contents
  const headings = useMemo(() => extractHeadings(post.content), [post.content])

  // Custom JSX Converter to inject matching anchor IDs into rendered headings
  const jsxConverters = useMemo<JSXConvertersFunction>(() => {
    return ({ defaultConverters }) => {
      const slugMap = new Map<string, number>()

      return {
        ...defaultConverters,
        heading: ({ node, nodesToJSX }) => {
          const children = nodesToJSX({ nodes: node.children })
          const rawText = extractTextFromNode(node).trim()
          const baseSlug = slugifyHeading(rawText) || 'heading'
          const count = slugMap.get(baseSlug) || 0
          slugMap.set(baseSlug, count + 1)
          const id = count === 0 ? baseSlug : `${baseSlug}-${count}`

          const Tag = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tag)
            ? node.tag
            : 'h2') as keyof React.JSX.IntrinsicElements

          return (
            <Tag id={id} className="post-heading-anchor group/heading">
              <a
                href={`#${id}`}
                className="heading-anchor-link"
                aria-label={`Direct link to ${rawText}`}
              >
                #
              </a>
              {children}
            </Tag>
          )
        },
      }
    }
  }, [post.content])

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] font-sans antialiased text-[#2e0249]">
      <BlogNav />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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

        {/* Back Link & Live Draft Indicator */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#ede3d4] text-xs font-bold text-[#665544] hover:text-[#ff7b01] hover:border-[#ffbd5b] transition-all shadow-2xs hover:shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to all stories</span>
          </Link>

          {post._status === 'draft' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fff2e0] text-[#ff7b01] border border-[#ff7b01]/30 animate-pulse">
              <Eye className="w-3.5 h-3.5" />
              <span>Live Draft Preview</span>
            </span>
          )}
        </div>

        {/* Two-Column Grid: Main Content + Sticky Aside */}
        <div className={`flex flex-col lg:flex-row items-start ${headings.length >= 2 ? 'gap-8 lg:gap-12' : 'justify-center'}`}>
          {/* Main Article Content */}
          <article className="w-full flex-1 min-w-0 max-w-4xl mx-auto lg:mx-0">
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

            {/* Mobile / Tablet Inline Table of Contents */}
            {headings.length >= 2 && (
              <div className="block lg:hidden mb-10">
                <TableOfContents headings={headings} />
              </div>
            )}

            {/* RichText Article Body */}
            <div className="bg-white rounded-3xl border border-[#ede3d4] p-6 sm:p-10 md:p-12 shadow-xs mb-14">
              <div className="blog-rich-text">
                <RichText data={post.content} converters={jsxConverters} />
              </div>
            </div>

            {/* --- RELATED POSTS SECTION --- */}
            {relatedPosts.length > 0 && (
              <section className="mb-14">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#2e0249]">Related Stories</h2>
                    <p className="text-xs text-[#776655] mt-1">
                      Continue exploring topics in this series and editor picks
                    </p>
                  </div>
                  <Link
                    href="/posts"
                    className="text-xs font-bold text-[#ff7b01] hover:underline"
                  >
                    View all stories &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {relatedPosts.map((related) => {
                    const relHero =
                      typeof related.heroImage === 'object' && related.heroImage !== null
                        ? (related.heroImage as Media)
                        : null

                    const relFeature =
                      typeof related.featureTag === 'object' && related.featureTag !== null
                        ? (related.featureTag as FeatureTag)
                        : null

                    return (
                      <article
                        key={related.id}
                        className="group bg-white rounded-2xl border border-[#ede3d4] overflow-hidden flex flex-col shadow-2xs hover:shadow-md hover:border-[#ffbd5b] transition-all hover:-translate-y-1"
                      >
                        <Link
                          href={`/posts/${related.slug}`}
                          className="block relative aspect-16/10 overflow-hidden bg-[#faf7f2]"
                        >
                          {relHero?.url ? (
                            <Image
                              src={relHero.url}
                              alt={relHero.alt || related.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#ff7b01]/40">
                              <Sparkles className="w-8 h-8" />
                            </div>
                          )}

                          {relFeature && (
                            <span className="absolute top-2 left-2 bg-[#2e0249]/90 text-[#ffbd5b] px-2 py-0.5 rounded-full text-[10px] font-bold">
                              {relFeature.name}
                            </span>
                          )}
                        </Link>

                        <div className="p-4 flex flex-col flex-1">
                          <h3 className="text-sm font-bold text-[#2e0249] group-hover:text-[#ff7b01] transition-colors line-clamp-2 mb-2">
                            <Link href={`/posts/${related.slug}`}>{related.title}</Link>
                          </h3>

                          <div className="mt-auto pt-2 flex items-center justify-between text-[11px] text-[#9c8a77]">
                            {related.readTime && <span>{related.readTime} min read</span>}
                            <span className="font-semibold text-[#ff7b01] flex items-center gap-0.5">
                              Read <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            )}

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
          </article>

          {/* Desktop Sticky Table of Contents Aside (>= 1024px) */}
          {headings.length >= 2 && (
            <aside className="hidden lg:block w-72 shrink-0 sticky top-28 self-start">
              <TableOfContents headings={headings} />
            </aside>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default PostView
