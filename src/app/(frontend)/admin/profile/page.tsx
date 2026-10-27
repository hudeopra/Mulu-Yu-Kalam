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
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
  };

  const handleReset = () => {
    setFormData(initialData);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. Password confirmation check
    if (formData.password && formData.password !== formData.confirmPassword) {
      setErrorMessage('New password and confirmation do not match.');
      setIsSaving(false);
      return;
    }

    // 2. Password length check
    if (formData.password && formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      setIsSaving(false);
      return;
    }

    try {
      // 3. Update Payload CMS User Profile via internal API
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          publicEmail: formData.publicEmail,
          email: formData.email,
          password: formData.password || undefined,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to update CMS profile');
      }

      // 4. Update Supabase Auth if password was changed & Supabase is live
      if (formData.password && isSupabaseConfigured) {
        const { error: sbError } = await supabase.auth.updateUser({
          password: formData.password,
          data: {
            name: formData.name,
            username: formData.username,
          },
        });

        if (sbError) {
          console.warn('[ProfilePage] Supabase auth sync warning:', sbError);
        }
      }

      // 5. Refresh context state
      await refreshUser();

      // Update initial baseline
      const updatedInitial: ProfileFormData = {
        name: formData.name,
        username: formData.username,
        publicEmail: formData.publicEmail,
        email: formData.email,
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
                <ShieldCheck className="w-3.5 h-3.5 text-[#ff7b01]" />
                <span>Protected Role Session</span>
              </div>
            </div>

            {/* Section 1: Public Author & Byline Details */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f0e8dc] shadow-xs space-y-6">
              <div className="border-b border-[#f0e8dc] pb-4">
                <h3 className="text-base font-bold text-[#2e0249] flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-[#ff7b01]" />
                  <span>Author Bylines & Profile</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  These details identify you across the studio system and on published blog articles.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#554433] uppercase tracking-wider mb-2">
                    Display Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="e.g. Maya Shrestha"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ede3d4] bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Your full public name displayed as article author.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#554433] uppercase tracking-wider mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                      placeholder="e.g. maya_ink"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ede3d4] bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Unique handle for internal studio mentions.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#554433] uppercase tracking-wider mb-2">
                    Primary Sign-In Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="staff@mulu-yu-kalam.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ede3d4] bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Used for authenticating into both Studio Appointments and CMS.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#554433] uppercase tracking-wider mb-2">
                    Public Contact Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.publicEmail}
                      onChange={(e) =>
                        handleChange('publicEmail', e.target.value)
                      }
                      placeholder="Optional public email"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ede3d4] bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Optional contact address displayed to clients on author bio cards.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Password Management */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f0e8dc] shadow-xs space-y-6">
              <div className="border-b border-[#f0e8dc] pb-4">
                <h3 className="text-base font-bold text-[#2e0249] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#ff7b01]" />
                  <span>Security & Credentials</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Update your authentication credentials. Leave blank if you don't wish to change your password.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#554433] uppercase tracking-wider mb-2">
                    New Password
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

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={!hasChanges || isSaving}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#ede3d4] bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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
