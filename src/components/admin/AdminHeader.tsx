'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Calendar, PenTool, ExternalLink, LogOut } from 'lucide-react'
import { useOptionalAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

export const AdminHeader: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()
  const auth = useOptionalAuth()
  const user = auth?.user

  // Dynamic route highlight
  const isAppointments = pathname ? pathname.startsWith('/admin') : true
  const isCms = pathname ? pathname.startsWith('/cms') : false

  const handleSignOut = async () => {
    if (auth?.signOut) {
      await auth.signOut()
    }
    router.replace('/login')
  }

  return (
    <header className="bg-white border-b border-black/5 sticky top-0 z-50 shadow-xs font-sans w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Studio Logo & Unified Navigation Switcher */}
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-3 group">
            <Image
              src="/assets/img/Mulu-Yu-Kalam.svg"
              alt="Mulu Yu Kalam"
              width={160}
              height={42}
              priority
              className="w-40 h-auto drop-shadow-xs"
            />
          </Link>

          {/* Unified Navigation Switcher */}
          <nav className="hidden md:flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl">
            <Link
              href="/admin"
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isAppointments
                  ? 'bg-white text-[#2e0249] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              }`}
            >
              <Calendar
                className={`w-3.5 h-3.5 ${
                  isAppointments ? 'text-[#ff7b01]' : 'text-gray-400'
                }`}
              />
              <span>Appointments</span>
            </Link>

            <Link
              href="/cms"
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isCms
                  ? 'bg-white text-[#2e0249] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              }`}
            >
              <PenTool
                className={`w-3.5 h-3.5 ${
                  isCms ? 'text-[#ff7b01]' : 'text-gray-400'
                }`}
              />
              <span>Blog & Content</span>
            </Link>
          </nav>
        </div>

        {/* Right: Public Link, User & Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#ff7b01] px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <span>View Public Studio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="h-6 w-px bg-gray-200 hidden sm:block" />

          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-[#2e0249] truncate max-w-[180px]">
              {user?.email || 'studio@muluyukalam.com.np'}
            </p>
            <p className="text-[10px] text-gray-400">Authenticated Staff</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center gap-2 border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-700 hover:text-red-700 rounded-xl px-3 py-2 text-xs font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader

