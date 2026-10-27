import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import type { Category, Media, FeatureTag, User } from '@/payload-types';
import { BlogNav } from '@/components/blog/BlogNav';
import { Footer } from '@/components/landing/Footer';
import {
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  Sparkles,
  PenTool,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Studio Journal & Tattoo Insights | Mulu Yu Kalam',
  description:
    'Read articles and stories on custom tattoo craftsmanship, Newari cultural motifs, fine line ink art, and professional aftercare from Mulu Yu Kalam Studio in Harisiddhi, Lalitpur.',
};

// Enable Incremental Static Regeneration (ISR): Cache feed for 60 seconds
export const revalidate = 60;

export default async function PostsPage() {
  const payload = await getPayload({ config: configPromise });

  // Query all published posts via Payload Local API
  const postsResult = await payload.find({
    collection: 'posts',
    depth: 2,
    sort: '-publishedAt',
    where: {
      _status: {
        equals: 'published',
      },
    },
  });

  const posts = postsResult.docs;

  return (
    <div className="custom-cursor-page min-h-screen flex flex-col bg-[#faf7f2] font-sans antialiased text-[#2e0249]">
      <BlogNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Hero Section */}
        <div className="relative rounded-3xl bg-[#2e0249] p-8 sm:p-12 md:p-16 text-white mb-12 sm:mb-16 overflow-hidden shadow-xl shadow-[#2e0249]/10">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-radial  to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#ff7b01]/20 text-[#ffbd5b] border border-[#ff7b01]/30 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Mulu Yu Kalam Studio Journal
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
              Stories, Craft & Ink Culture
            </h1>
            <p className="text-base sm:text-lg text-[#ffdca9]/80 font-normal leading-relaxed">
              Insights into custom tattoo craftsmanship, traditional Newari
              cultural motifs, aftercare wisdom, and studio stories from
              Harisiddhi, Lalitpur.
            </p>
          </div>
        </div>

        {/* Posts Content */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#ede3d4] p-12 sm:p-16 text-center max-w-xl mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#faf7f2] border border-[#ede3d4] flex items-center justify-center mx-auto mb-5 text-[#ff7b01]">
              <BookOpen className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-[#2e0249] mb-2">
              Stories in the Making
            </h2>
            <p className="text-sm text-[#776655] mb-6 leading-relaxed">
              We are currently drafting new stories about tattoo art, symbolism,
              and studio culture. Check back shortly or visit the CMS portal to
              publish new articles.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/cms"
                className="inline-flex items-center gap-2 bg-[#ff7b01] hover:bg-[#e06c00] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <PenTool className="w-4 h-4" />
                <span>Open Studio CMS</span>
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-[#faf7f2] hover:bg-[#f0e8dc] text-[#2e0249] px-5 py-2.5 rounded-xl text-xs font-semibold border border-[#ede3d4] transition-colors"
              >
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => {
              const heroImage =
                typeof post.heroImage === 'object' && post.heroImage !== null
                  ? (post.heroImage as Media)
                  : null;

              const featureTag =
                typeof post.featureTag === 'object' && post.featureTag !== null
                  ? (post.featureTag as FeatureTag)
                  : null;

              const authors = Array.isArray(post.authors)
                ? post.authors
                    .map((a) =>
                      typeof a === 'object' && a !== null
                        ? (a as User).name || (a as User).email
                        : '',
                    )
                    .filter(Boolean)
                    .join(', ')
                : '';

              return (
                <article
                  key={post.id}
                  className="group bg-white rounded-3xl border border-[#ede3d4] overflow-hidden flex flex-col shadow-xs hover:shadow-xl hover:shadow-[#ff7b01]/10 hover:border-[#ffbd5b] transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Hero Image */}
                  <Link
                    href={`/posts/${post.slug}`}
                    className="block relative aspect-16/10 overflow-hidden bg-[#faf7f2]"
                  >
                    {heroImage?.url ? (
                      <Image
                        src={heroImage.url}
                        alt={heroImage.alt || post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#faf7f2] text-[#ff7b01]/40">
                        <PenTool className="w-12 h-12" />
                      </div>
                    )}

                    {/* Top Badges Overlay */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                      {featureTag ? (
                        <span className="inline-flex items-center gap-1 bg-[#2e0249]/90 backdrop-blur-md text-[#ffbd5b] px-3 py-1 rounded-full text-[11px] font-bold border border-[#ffbd5b]/30 shadow-xs">
                          {featureTag.icon && <span>{featureTag.icon}</span>}
                          <span>{featureTag.name}</span>
                        </span>
                      ) : (
                        <span />
                      )}

                      {post.readTime && (
                        <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[11px] font-semibold">
                          <Clock className="w-3 h-3 text-[#ffbd5b]" />
                          <span>{post.readTime} min</span>
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col flex-1">
                    {/* Categories Pill */}
                    {Array.isArray(post.categories) &&
                      post.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {post.categories.map((c) => {
                            const cat =
                              typeof c === 'object' && c !== null
                                ? (c as Category)
                                : null;
                            if (!cat) return null;
                            return (
                              <span
                                key={cat.id}
                                className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-md bg-[#fff5ea] text-[#ff7b01] border border-[#ff7b01]/20"
                              >
                                {cat.title}
                              </span>
                            );
                          })}
                        </div>
                      )}

                    {/* Title */}
                    <h2 className="text-xl font-bold text-[#2e0249] group-hover:text-[#ff7b01] transition-colors leading-snug mb-2.5 line-clamp-2">
                      <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                    </h2>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-xs sm:text-sm text-[#776655] line-clamp-2 leading-relaxed mb-4">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Footer Meta */}
                    <div className="mt-auto pt-4 border-t border-[#ede3d4]/70 flex items-center justify-between text-xs text-[#9c8a77]">
                      <div className="flex items-center gap-2">
                        {post.publishedAt && (
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar className="w-3 h-3 text-[#ff7b01]" />
                            {new Date(post.publishedAt).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              },
                            )}
                          </span>
                        )}
                        {authors && <span>&bull; By {authors}</span>}
                      </div>

                      <Link
                        href={`/posts/${post.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#ff7b01] group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>Read</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
