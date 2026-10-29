'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Sparkles, ArrowRight, Navigation, MousePointer2Off } from 'lucide-react';

export const BlogNav: React.FC = () => {
  const pathname = usePathname();
  const [isCursorEnabled, setIsCursorEnabled] = useState<boolean>(true);
  const [logoUrl, setLogoUrl] = useState<string>('/assets/img/Mulu-Yu-Kalam.svg');

  useEffect(() => {
    // Read persisted preference
    const saved = localStorage.getItem('mulu_cursor_enabled');
    if (saved !== null) {
      setIsCursorEnabled(saved !== 'false');
    }

    fetch('/api/admin/landing/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings?.logo_url) setLogoUrl(data.settings.logo_url);
      })
      .catch(() => {});

    const handleExternalToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.enabled === 'boolean') {
        setIsCursorEnabled(customEvent.detail.enabled);
      }
    };

    window.addEventListener('mulu-cursor-toggle', handleExternalToggle);
    return () => {
      window.removeEventListener('mulu-cursor-toggle', handleExternalToggle);
    };
  }, []);

  const toggleCursor = () => {
    const nextState = !isCursorEnabled;
    setIsCursorEnabled(nextState);

    try {
      localStorage.setItem('mulu_cursor_enabled', String(nextState));
    } catch {
      // localStorage may fail in private mode
    }

    if (!nextState) {
      document.body.classList.remove('custom-cursor-page');
      document.body.classList.add('custom-cursor-disabled');
      document.documentElement.classList.add('custom-cursor-disabled');
    } else {
      document.body.classList.remove('custom-cursor-disabled');
      document.documentElement.classList.remove('custom-cursor-disabled');
      document.body.classList.add('custom-cursor-page');
    }

    window.dispatchEvent(
      new CustomEvent('mulu-cursor-toggle', { detail: { enabled: nextState } })
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#ede3d4] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Studio Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src={logoUrl}
            alt="Mulu Yu Kalam Tattoo Studio"
            width={160}
            height={42}
            priority
            className="w-36 sm:w-44 h-auto drop-shadow-xs transition-transform duration-200 group-hover:scale-102"
          />
        </Link>

        {/* Right: Book Appointment CTA & Cursor Flow Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 bg-[#ff7b01] hover:bg-[#e06c00] text-white px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-[#ff7b01]/20 transition-all hover:shadow-md hover:shadow-[#ff7b01]/30 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
            <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
          </Link>

          {/* Cursor Pointer & Flow Toggle Button */}
          <button
            type="button"
            onClick={toggleCursor}
            className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${
              isCursorEnabled
                ? 'border-[#ff7b01]/30 bg-[#ff7b01]/10 text-[#ff7b01] hover:bg-[#ff7b01]/20 shadow-2xs'
                : 'border-[#ede3d4] bg-[#faf7f2] text-[#9c8a77] hover:bg-[#ede3d4]/60 hover:text-[#2e0249]'
            }`}
            title={
              isCursorEnabled
                ? 'Custom tattoo pointer & flow enabled (Click to disable)'
                : 'Custom tattoo pointer & flow disabled (Click to enable)'
            }
            aria-label={
              isCursorEnabled
                ? 'Disable custom pointer and cursor flow'
                : 'Enable custom pointer and cursor flow'
            }
          >
            {isCursorEnabled ? (
              <Navigation className="w-4 h-4" />
            ) : (
              <MousePointer2Off className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default BlogNav;
