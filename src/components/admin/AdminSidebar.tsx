'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  Shield,
  PenTool,
  Image as ImageIcon,
  Tag,
  Bookmark,
  Users,
  LayoutDashboard,
  ExternalLink,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  FileText,
  Settings,
  Layers,
} from 'lucide-react';
import { useOptionalAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import './admin-sidebar.css';

export function AdminSidebar(props?: any) {
  const pathname = usePathname();
  const auth = useOptionalAuth();
  const [cmsUser, setCmsUser] = useState<{
    email?: string;
    role?: string;
  } | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/assets/img/Mulu-Yu-Kalam.svg');

  // Payload CMS passes user directly in props or serverProps
  const propsUser = props?.user || props?.serverProps?.user;

  useEffect(() => {
    // If not authenticated via AuthContext and no user prop passed from Payload, query /api/users/me
    if (!auth?.user && !propsUser) {
      fetch('/api/users/me')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            setCmsUser({ email: data.user.email, role: data.user.role });
          }
        })
        .catch(() => {});
    }
    fetch('/api/admin/landing/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings?.logo_url) {
          setLogoUrl(data.settings.logo_url);
        }
      })
      .catch(() => {});
  }, [auth?.user, propsUser]);

  // Lock background scroll when mobile drawer is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileOpen(false);
    };

    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileOpen]);

  const rawUser = auth?.user || propsUser || cmsUser;
  const userEmail = rawUser?.email || 'staff@muluyukalam.com.np';
  const userRole =
    (rawUser?.role as string) ||
    (rawUser?.user_metadata?.role as string) ||
    'author';
  const userName =
    (rawUser?.user_metadata?.name as string) || (rawUser?.name as string) || '';
  const isAdmin = userRole === 'admin';
  const isAuthor = userRole === 'author';
  const displayRole = userRole.charAt(0).toUpperCase() + userRole.slice(1);

  // Active route checks
  const isAboutActive = pathname === '/admin/about';
  const isGalleryActive = pathname === '/admin/gallery';
  const isSettingsActive = pathname === '/admin/settings';
  const isAppointmentsActive = pathname === '/admin';
  const isPermissionsActive = pathname
    ? pathname.startsWith('/admin/permissions')
    : false;
  const isProfileActive = pathname === '/admin/profile';
  const isCmsDashboardActive = pathname === '/cms';
  const isPostsActive = pathname
    ? pathname.startsWith('/cms/collections/posts')
    : false;
  const isMediaActive = pathname
    ? pathname.startsWith('/cms/collections/media')
    : false;
  const isCategoriesActive = pathname
    ? pathname.startsWith('/cms/collections/categories')
    : false;
  const isTagsActive = pathname
    ? pathname.startsWith('/cms/collections/feature-tags')
    : false;
  const isTeamActive = pathname
    ? pathname.startsWith('/admin/team')
    : false;

  const handleSignOut = async () => {
    // 1. Terminate Supabase Auth session
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }

    // 2. Terminate Payload CMS session & clear payload-token cookie
    try {
      await fetch('/api/users/logout', { method: 'POST' });
    } catch {}

    // 3. Clear AuthContext if present
    try {
      if (auth?.signOut) {
        await auth.signOut();
      }
    } catch {}

    // 4. Force full page redirect to /login
    window.location.href = '/login';
  };

  const navContent = (
    <>
      {/* Studio Brand Header */}
      <div className="studio-sidebar__brand">
        <Link
          href="/admin"
          className="studio-sidebar__logo-link"
          onClick={() => setIsMobileOpen(false)}
        >
          <Image
            src={logoUrl}
            alt="Mulu Yu Kalam"
            width={145}
            height={38}
            priority
            className="studio-sidebar__logo-img"
          />
        </Link>
        {isMobileOpen ? (
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="studio-sidebar__close-btn"
            aria-label="Close navigation"
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        ) : null}
      </div>

      {/* Navigation Scrollable Body */}
      <div className="studio-sidebar__body">
        {/* GROUP 1: Studio Operations */}
        <div className="studio-sidebar__group">
          <p className="studio-sidebar__group-label">Studio Operations</p>
          <ul className="studio-sidebar__nav-list">
            {!isAuthor && (
              <li>
                <Link
                  href="/admin"
                  onClick={() => setIsMobileOpen(false)}
                  className={`studio-sidebar__link ${isAppointmentsActive ? 'is-active' : ''}`}
                >
                  <Calendar />
                  <span>Appointments Feed</span>
                </Link>
              </li>
            )}

            {isAdmin && (
              <>
                <li>
                  <Link
                    href="/admin/team"
                    onClick={() => setIsMobileOpen(false)}
                    className={`studio-sidebar__link ${isTeamActive ? 'is-active' : ''}`}
                  >
                    <Users />
                    <span>Team Management</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/permissions"
                    onClick={() => setIsMobileOpen(false)}
                    className={`studio-sidebar__link ${isPermissionsActive ? 'is-active' : ''}`}
                  >
                    <Shield />
                    <span>Permission Matrix</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* GROUP 2: Blog CMS Collections */}
        <div className="studio-sidebar__group">
          <p className="studio-sidebar__group-label">Blog & Content (CMS)</p>
          <ul className="studio-sidebar__nav-list">
            <li>
              <Link
                href="/cms"
                onClick={() => setIsMobileOpen(false)}
                className={`studio-sidebar__link ${isCmsDashboardActive ? 'is-active' : ''}`}
              >
                <LayoutDashboard />
                <span>CMS Dashboard</span>
              </Link>
            </li>

            <li>
              <Link
                href="/cms/collections/posts"
                onClick={() => setIsMobileOpen(false)}
                className={`studio-sidebar__link ${isPostsActive ? 'is-active' : ''}`}
              >
                <PenTool />
                <span>Articles & Posts</span>
              </Link>
            </li>

            <li>
              <Link
                href="/cms/collections/media"
                onClick={() => setIsMobileOpen(false)}
                className={`studio-sidebar__link ${isMediaActive ? 'is-active' : ''}`}
              >
                <ImageIcon />
                <span>Media Assets</span>
              </Link>
            </li>

            <li>
              <Link
                href="/cms/collections/categories"
                onClick={() => setIsMobileOpen(false)}
                className={`studio-sidebar__link ${isCategoriesActive ? 'is-active' : ''}`}
              >
                <Tag />
                <span>Categories</span>
              </Link>
            </li>

            <li>
              <Link
                href="/cms/collections/feature-tags"
                onClick={() => setIsMobileOpen(false)}
                className={`studio-sidebar__link ${isTagsActive ? 'is-active' : ''}`}
              >
                <Bookmark />
                <span>Feature Badges</span>
              </Link>
            </li>


          </ul>
        </div>

        {/* GROUP 3: Website & Landing Page */}
        <div className="studio-sidebar__group">
          <p className="studio-sidebar__group-label">Website & Landing Page</p>
          <ul className="studio-sidebar__nav-list">
            <li>
              <Link
                href="/admin/about"
                onClick={() => setIsMobileOpen(false)}
                className={`studio-sidebar__link ${isAboutActive ? 'is-active' : ''}`}
              >
                <FileText />
                <span>About Section</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/gallery"
                onClick={() => setIsMobileOpen(false)}
                className={`studio-sidebar__link ${isGalleryActive ? 'is-active' : ''}`}
              >
                <Layers />
                <span>Gallery & Showcase</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/settings"
                onClick={() => setIsMobileOpen(false)}
                className={`studio-sidebar__link ${isSettingsActive ? 'is-active' : ''}`}
              >
                <Settings />
                <span>Website Settings</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Sidebar Footer: User Card, View Studio, Sign Out */}
      <div className="studio-sidebar__footer">
        {/* Action Links */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="studio-sidebar__action-btn"
        >
          <span>View Public Studio</span>
          <ExternalLink />
        </Link>
        {/* User Info Card - Interactive link to /admin/profile */}
        <div className="studio-sidebar__actions">
          <Link
            href="/admin/profile"
            onClick={() => setIsMobileOpen(false)}
            className={`studio-sidebar__user ${isProfileActive ? 'is-active-profile' : ''}`}
            title="Manage Profile & Security"
          >
            <div className="studio-sidebar__avatar">
              {(userName || userEmail).charAt(0).toUpperCase()}
            </div>
            <div className="studio-sidebar__user-info">
              <p
                className="studio-sidebar__user-name"
                title={userName || userEmail}
              >
                {userName || userEmail}
              </p>
              <div className="studio-sidebar__user-badge-row">
                <span className="studio-sidebar__role-badge">
                  {displayRole}
                </span>
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="studio-sidebar__action-btn studio-sidebar__action-btn--logout"
          >
            <span>Sign Out</span>
            <LogOut />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <aside className="studio-sidebar-nav nav">
      {/* 1. Mobile Sticky Header Bar */}
      <div className="studio-sidebar-mobile-bar">
        <Link
          href="/admin"
          className="studio-sidebar-mobile-bar__logo"
          onClick={() => setIsMobileOpen(false)}
        >
          <Image
            src={logoUrl}
            alt="Mulu Yu Kalam"
            width={130}
            height={34}
            priority
            className="studio-sidebar__logo-img"
          />
        </Link>
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="studio-sidebar-mobile-bar__hamburger"
          aria-label="Open navigation menu"
        >
          <Menu style={{ width: 22, height: 22 }} />
        </button>
      </div>

      {/* 2. Mobile Slide-Over Drawer */}
      {isMobileOpen ? (
        <div className="studio-sidebar-drawer">
          <div
            className="studio-sidebar-drawer__backdrop"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="studio-sidebar-drawer__panel">{navContent}</div>
        </div>
      ) : null}

      {/* 3. Desktop Aside Sidebar */}
      <div className="studio-sidebar__desktop">{navContent}</div>
    </aside>
  );
}

export default AdminSidebar;
