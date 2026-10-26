'use client'

import React, { useEffect, useState } from 'react'
import type { TOCItem } from '@/utilities/extractHeadings'
import { BookOpen } from 'lucide-react'

type TableOfContentsProps = {
  headings: TOCItem[]
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting)
        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id)
        }
      },
      {
        rootMargin: '-85px 0% -60% 0%', // Trigger when heading is near top of viewport under nav
        threshold: 0.1,
      },
    )

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) {
    return null
  }

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const topOffset = 95 // Accounts for sticky navbar
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - topOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })

      window.history.pushState(null, '', `#${id}`)
      setActiveId(id)
    }
  }

  return (
    <nav
      className="bg-white rounded-3xl border border-[#ede3d4] p-5 sm:p-6 shadow-xs font-sans"
      aria-label="Table of Contents"
    >
      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#ede3d4]/70">
        <BookOpen className="w-4 h-4 text-[#ff7b01]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#2e0249]">
          Table of Contents
        </h3>
      </div>

      <ul className="space-y-1.5 text-xs">
        {headings.map((heading) => {
          const isActive = activeId === heading.id
          return (
            <li
              key={heading.id}
              className={`transition-colors ${heading.level === 'h3' ? 'pl-3' : ''}`}
            >
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleScrollTo(e, heading.id)}
                className={`block py-1 px-2.5 rounded-lg border-l-2 transition-all leading-relaxed ${
                  isActive
                    ? 'border-[#ff7b01] bg-[#fff5ea] text-[#ff7b01] font-bold shadow-2xs'
                    : 'border-transparent text-[#665544] hover:text-[#2e0249] hover:bg-[#faf7f2]'
                }`}
              >
                {heading.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default TableOfContents

