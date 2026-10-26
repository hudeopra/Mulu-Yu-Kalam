'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Sparkles, Calendar, ArrowRight } from 'lucide-react';

export const BlogNav: React.FC = () => {
  const pathname = usePathname();
  const isJournalHome = pathname === '/posts';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#ede3d4] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Studio Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/assets/img/Mulu-Yu-Kalam.svg"
            alt="Mulu Yu Kalam Tattoo Studio"
            width={160}
            height={42}
            priority
            className="w-36 sm:w-44 h-auto drop-shadow-xs transition-transform duration-200 group-hover:scale-102"
          />
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#faf7f2] p-1.5 rounded-2xl border border-[#ede3d4]">
          <Link
            href="/"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#665544] hover:text-[#2e0249] hover:bg-white/70 transition-all"
          >
            Studio Home
          </Link>

          <Link
            href="/posts"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isJournalHome
                ? 'bg-white text-[#2e0249] shadow-xs border border-[#ff7b01]/30'
                : 'text-[#665544] hover:text-[#2e0249] hover:bg-white/70'
            }`}
          >
            Studio Journal
          </Link>
        </nav>

        {/* Right: Book Appointment CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 bg-[#ff7b01] hover:bg-[#e06c00] text-white px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-[#ff7b01]/20 transition-all hover:shadow-md hover:shadow-[#ff7b01]/30 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
            <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default BlogNav;
