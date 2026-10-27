'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AtSign,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface ProfileFormData {
  name: string;
  username: string;
  publicEmail: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    username: '',
    publicEmail: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [initialData, setInitialData] = useState<ProfileFormData>({
    name: '',
    username: '',
    publicEmail: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [userRole, setUserRole] = useState<string>('author');
  const [userCreatedAt, setUserCreatedAt] = useState<string>('');
  const [autoLogoutMinutes, setAutoLogoutMinutes] = useState<number>(30);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Read stored auto logout preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('studio_auto_logout_minutes');
      if (stored !== null) {
        setAutoLogoutMinutes(Number(stored));
      }
    }
  }, []);

  const handleAutoLogoutChange = (minutes: number) => {
    setAutoLogoutMinutes(minutes);
    try {
      localStorage.setItem('studio_auto_logout_minutes', String(minutes));
      localStorage.setItem('studio_last_active', String(Date.now()));
    } catch {}
    setSuccessMessage(
      minutes === 0
        ? 'Automatic session logout has been disabled.'
        : `Auto-logout timer updated to ${minutes} minutes of inactivity.`,
    );
  };

  // Load current user profile from unified API
  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            const loaded: ProfileFormData = {
              name: data.user.name || '',
              username: data.user.username || '',
              publicEmail: data.user.publicEmail || '',
              email: data.user.email || '',
              password: '',
              confirmPassword: '',
            };
            setFormData(loaded);
            setInitialData(loaded);
            if (data.user.role) setUserRole(data.user.role);
            if (data.user.createdAt) setUserCreatedAt(data.user.createdAt);
          }
        } else if (user) {
          // Fallback to AuthContext state
          const loaded: ProfileFormData = {
            name: (user.user_metadata?.name as string) || '',
            username: (user.user_metadata?.username as string) || '',
            publicEmail: '',
            email: user.email || '',
            password: '',
            confirmPassword: '',
          };
          setFormData(loaded);
          setInitialData(loaded);
          if (user.role) setUserRole(user.role as string);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load profile';
        console.error('[ProfilePage] Load error:', err);
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleReset = () => {
    setFormData(initialData);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    // Validation
    if (formData.password) {
      if (formData.password.length < 6) {
        setErrorMessage('New password must be at least 6 characters long.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrorMessage('New password and confirm password do not match.');
        return;
      }
    }

    setIsSaving(true);
    try {
      // 1. Update in Payload CMS (blog_users) via Local API
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          publicEmail: formData.publicEmail,
          email: formData.email,
          ...(formData.password ? { password: formData.password } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      // 2. Synchronize with Supabase Auth
      if (isSupabaseConfigured) {
        try {
          const updatePayload: Record<string, any> = {
            data: {
              name: formData.name,
              username: formData.username,
            },
          };
          if (
            formData.email &&
            formData.email.toLowerCase() !== initialData.email.toLowerCase()
          ) {
            updatePayload.email = formData.email;
          }
          if (formData.password) {
            updatePayload.password = formData.password;
          }
          await supabase.auth.updateUser(updatePayload);
        } catch (sbErr) {
          console.warn(
            '[ProfilePage] Supabase auth updateUser warning:',
            sbErr,
          );
        }
      }

      // 3. Refresh AuthContext state across all components
      await refreshUser();

      // Reset password inputs & mark saved
      const updatedInitial: ProfileFormData = {
        ...formData,
        password: '',
        confirmPassword: '',
      };
      setFormData(updatedInitial);
      setInitialData(updatedInitial);
      setSuccessMessage(
        'Profile and credentials updated successfully across Supabase & CMS.',
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Could not save profile changes.';
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const displayRole = userRole.charAt(0).toUpperCase() + userRole.slice(1);
  const formattedDate = userCreatedAt
    ? new Date(userCreatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Active Staff Member';

  const hasChanges =
    formData.name !== initialData.name ||
    formData.username !== initialData.username ||
    formData.publicEmail !== initialData.publicEmail ||
    formData.email !== initialData.email ||
    Boolean(formData.password);

  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans text-gray-900 pb-20 selection:bg-[#ff7b01] selection:text-white">
      {/* Top Banner */}
      <div className="bg-white border-b border-[#f0e8dc] sticky top-0 z-20 shadow-2xs backdrop-blur-md bg-white/95">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#ffecd0] text-[#ff7b01] border border-[#ffbd5b]/40">
              <UserIcon className="w-3.5 h-3.5 text-[#ff7b01]" />
              Staff Account Settings
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3 h-3" />
              Supabase & CMS Synced
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="text-xs font-semibold text-[#554433] hover:text-[#ff7b01] px-3 py-1.5 rounded-xl transition-colors"
            >
              &larr; Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#2e0249] via-[#3b075e] to-[#2e0249] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-[#2e0249]/10">
          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#ffbd5b]">
              PERSONAL CREDENTIALS & SECURITY
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Staff Profile & Security
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              Manage your display name, public author byline, login credentials,
              and account security. Updates are synchronized instantly between
              Supabase Auth and Payload CMS.
            </p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[url('/assets/img/bg-img.svg')] bg-contain bg-no-repeat bg-right opacity-15 pointer-events-none" />
        </div>

        {/* Notifications */}
        {successMessage ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        ) : null}

        {isLoading ? (
          <div className="bg-white rounded-3xl p-12 text-center text-[#9c8a77] border border-[#f0e8dc] shadow-xs">
            <div className="inline-block w-8 h-8 border-3 border-[#ff7b01] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold">
              Loading profile information...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Identity Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f0e8dc] shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-[#2e0249] text-white flex items-center justify-center font-extrabold text-2xl shrink-0 ring-4 ring-[#ff7b01]/25 shadow-md">
                {(formData.name || formData.email || 'S')
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h2 className="text-xl font-bold text-[#2e0249]">
                    {formData.name || 'Staff Member'}
                  </h2>
                  <span className="inline-block self-center sm:self-auto text-[11px] font-bold text-[#ff7b01] bg-[#fff5eb] border border-[#ffbd5b]/50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {displayRole}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-mono">
                  {formData.email}
                </p>
                <p className="text-[11px] text-[#9c8a77] pt-1">
                  Member since: {formattedDate}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2 bg-[#faf7f2] border border-[#ede3d4] px-3.5 py-2 rounded-2xl text-[11px] text-[#554433] font-semibold">
                <Clock className="w-3.5 h-3.5 text-[#ff7b01]" />
                <span>
                  {autoLogoutMinutes === 0
                    ? 'Auto-Logout Disabled'
                    : `${autoLogoutMinutes}-Min Auto Logout`}
                </span>
              </div>
            </div>

            {/* Section 1: Public Author & Byline Details */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f0e8dc] shadow-xs space-y-6">
              <div className="border-b border-[#f0e8dc] pb-4">
                <h3 className="text-base font-bold text-[#2e0249] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#ff7b01]" />
                  <span>Public Author & Editorial Profile</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  These details appear on blog articles, story bylines, and
                  author bio tags.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#554433] uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="e.g. Prajwol Maharjan"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ede3d4] bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Displayed publicly on articles you publish.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#554433] uppercase tracking-wider mb-2">
                    Author Username
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                      placeholder="e.g. prajwol"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ede3d4] bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Unique identifier used for author profile URLs.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#554433] uppercase tracking-wider mb-2">
                    Public Contact Email (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.publicEmail}
                      onChange={(e) =>
                        handleChange('publicEmail', e.target.value)
                      }
                      placeholder="e.g. artist@muluyukalam.com.np"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ede3d4] bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Public contact address for client queries. If empty, the
                    studio default is used.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Account Login Credentials */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f0e8dc] shadow-xs space-y-6">
              <div className="border-b border-[#f0e8dc] pb-4">
                <h3 className="text-base font-bold text-[#2e0249] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#ff7b01]" />
                  <span>Account Login Credentials</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Manage your login email and password used to access Studio
                  Admin and Payload CMS.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#554433] uppercase tracking-wider mb-2">
                    Login Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ede3d4] bg-white text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Used to sign in across both Studio Appointments feed and
                    Payload CMS.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#554433] uppercase tracking-wider mb-2">
                    New Password (Optional)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Leave blank to keep current password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#ede3d4] bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Must be at least 6 characters long if changed.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#554433] uppercase tracking-wider mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleChange('confirmPassword', e.target.value)
                      }
                      placeholder="Re-type new password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ede3d4] bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Re-enter your new password to verify.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Session & Security Policies */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f0e8dc] shadow-xs space-y-5">
              <div className="border-b border-[#f0e8dc] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-[#2e0249] flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#ff7b01]" />
                    <span>Session Security & Inactivity Timeout</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Control how long before unattended sessions automatically sign out for security.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {autoLogoutMinutes === 0
                    ? 'Auto-Logout Disabled'
                    : `${autoLogoutMinutes} Min Inactivity Active`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
                <div>
                  <label className="block text-xs font-bold text-[#554433] uppercase tracking-wider mb-2">
                    Auto-Logout Inactivity Timer
                  </label>
                  <select
                    value={autoLogoutMinutes}
                    onChange={(e) => handleAutoLogoutChange(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ede3d4] bg-white text-xs sm:text-sm text-gray-800 font-semibold focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all cursor-pointer"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes (Recommended)</option>
                    <option value={60}>1 Hour</option>
                    <option value={120}>2 Hours</option>
                    <option value={240}>4 Hours</option>
                    <option value={0}>Never (Disable Auto-Logout)</option>
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Applies automatically across both Studio Appointments and Payload CMS.
                  </p>
                </div>

                <div className="bg-[#faf7f2] rounded-2xl p-4 border border-[#ede3d4] text-xs text-[#554433] space-y-1">
                  <p className="font-bold text-[#2e0249]">How this protects your studio:</p>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    If left unattended, your session terminates safely to prevent unauthorized edits.
                    A warning countdown will appear 2 minutes before signing out.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={!hasChanges || isSaving}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#ede3d4] bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Discard Changes</span>
              </button>

              <button
                type="submit"
                disabled={!hasChanges || isSaving}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#ff7b01] hover:bg-[#e06c00] text-white text-xs font-bold shadow-md shadow-[#ff7b01]/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
