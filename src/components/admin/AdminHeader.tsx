'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Calendar, PenTool, ExternalLink, LogOut } from 'lucide-react'
import { useOptionalAuth } from '@/context/AuthContext'
import './admin-header.css'

export const AdminHeader: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()
  const auth = useOptionalAuth()

  // Track authenticated user across both frontend and Payload CMS
  const [cmsUserEmail, setCmsUserEmail] = useState<string | null>(null)

  useEffect(() => {
    // If not running under frontend AuthProvider, fetch session from Payload /api/users/me
    if (!auth?.user) {
      fetch('/api/users/me')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user?.email) {
            setCmsUserEmail(data.user.email)
          }
        })
        .catch(() => {})
    }
  }, [auth?.user])

  const userEmail = auth?.user?.email || cmsUserEmail || 'studio@muluyukalam.com.np'

  // Dynamic route highlight
  const isAppointments = pathname ? pathname.startsWith('/admin') : false
  const isCms = pathname ? pathname.startsWith('/cms') : true

  const handleSignOut = async () => {
    try {
      if (auth?.signOut) {
        await auth.signOut()
      }
    } catch {}
    try {
      await fetch('/api/users/logout', { method: 'POST' })
    } catch {}
    router.replace('/login')
  }

  return (
    <header className="studio-admin-header">
      <div className="studio-admin-header__container">
        {/* Left: Studio Logo & Unified Navigation Switcher */}
        <div className="studio-admin-header__left">
          <Link href="/admin" className="studio-admin-header__logo-link">
            <Image
              src="/assets/img/Mulu-Yu-Kalam.svg"
              alt="Mulu Yu Kalam"
              width={160}
              height={42}
              priority
              className="studio-admin-header__logo-img"
            />
          </Link>

          {/* Unified Navigation Switcher */}
          <nav className="studio-admin-header__nav">
            <Link
              href="/admin"
              className={`studio-admin-header__tab ${
                isAppointments ? 'studio-admin-header__tab--active' : ''
              }`}
            >
              <Calendar className="studio-admin-header__tab-icon" />
              <span>Appointments</span>
            </Link>

            <Link
              href="/cms"
              className={`studio-admin-header__tab ${
                isCms ? 'studio-admin-header__tab--active' : ''
              }`}
            >
              <PenTool className="studio-admin-header__tab-icon" />
              <span>Blog & Content</span>
            </Link>
          </nav>
        </div>

        {/* Right: Public Link, User & Logout */}
        <div className="studio-admin-header__right">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="studio-admin-header__public-link"
          >
            <span>View Public Studio</span>
            <ExternalLink style={{ width: 14, height: 14 }} />
          </Link>

          <div className="studio-admin-header__divider" />

          <div className="studio-admin-header__user-block">
            <p className="studio-admin-header__user-email">{userEmail}</p>
            <p className="studio-admin-header__user-role">Authenticated Staff</p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="studio-admin-header__logout-btn"
          >
            <LogOut style={{ width: 14, height: 14 }} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
