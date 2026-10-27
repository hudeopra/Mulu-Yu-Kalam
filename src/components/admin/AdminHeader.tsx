'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Calendar, PenTool, ExternalLink, LogOut, Shield } from 'lucide-react'
import { useOptionalAuth } from '@/context/AuthContext'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import './admin-header.css'

export const AdminHeader: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()
  const auth = useOptionalAuth()

  // Track authenticated user across both frontend and Payload CMS
  const [cmsUserEmail, setCmsUserEmail] = useState<string | null>(null)
  const [cmsUserRole, setCmsUserRole] = useState<string | null>(null)

  useEffect(() => {
    // If not running under frontend AuthProvider, fetch session from Payload /api/users/me
    if (!auth?.user) {
      fetch('/api/users/me')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user?.email) {
            setCmsUserEmail(data.user.email)
            if (data.user.role) {
              setCmsUserRole(data.user.role)
            }
          }
        })
        .catch(() => {})
    }
  }, [auth?.user])

  const userEmail = auth?.user?.email || cmsUserEmail || 'studio@muluyukalam.com.np'
  const userRole = (auth?.user?.role as string) || (auth?.user?.user_metadata?.role as string) || cmsUserRole || 'author'
  const isAuthor = userRole === 'author'
  const displayRole = userRole.charAt(0).toUpperCase() + userRole.slice(1)

  // Dynamic route highlight
  const isPermissions = pathname ? pathname.startsWith('/admin/permissions') : false
  const isAppointments = pathname ? (pathname === '/admin' || (pathname.startsWith('/admin') && !isPermissions)) : false
  const isCms = pathname ? pathname.startsWith('/cms') : false

  const handleSignOut = async () => {
    // 1. Terminate Supabase Auth session
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut()
      } catch {}
    }

    // 2. Terminate Payload CMS session & clear payload-token cookie
    try {
      await fetch('/api/users/logout', { method: 'POST' })
    } catch {}

    // 3. Clear AuthContext state if running under frontend provider
    try {
      if (auth?.signOut) {
        await auth.signOut()
      }
    } catch {}

    // 4. Force full page reload to /login to flush all in-memory client state
    window.location.href = '/login'
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
            {!isAuthor ? (
              <Link
                href="/admin"
                className={`studio-admin-header__tab ${
                  isAppointments ? 'studio-admin-header__tab--active' : ''
                }`}
              >
                <Calendar className="studio-admin-header__tab-icon" />
                <span>Appointments</span>
              </Link>
            ) : null}

            <Link
              href="/cms"
              className={`studio-admin-header__tab ${
                isCms ? 'studio-admin-header__tab--active' : ''
              }`}
            >
              <PenTool className="studio-admin-header__tab-icon" />
              <span>Blog & Content</span>
            </Link>

            {userRole === 'admin' ? (
              <Link
                href="/admin/permissions"
                className={`studio-admin-header__tab ${
                  isPermissions ? 'studio-admin-header__tab--active' : ''
                }`}
              >
                <Shield className="studio-admin-header__tab-icon" />
                <span>Permissions</span>
              </Link>
            ) : null}
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
            <p className="studio-admin-header__user-role">{displayRole}</p>
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
