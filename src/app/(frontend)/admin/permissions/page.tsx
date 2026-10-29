'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Check,
  RotateCcw,
  Save,
  Search,
  Users,
  Calendar,
  PenTool,
  Image as ImageIcon,
  Tag,
  Lock,
  Loader2,
  Sparkles,
  Info,
  Clock,
} from 'lucide-react';
import {
  type AppRole,
  type PermissionKey,
  type PermissionCategory,
  type RolePermissionsMatrix,
  type RoleSecurityPolicies,
  PERMISSION_DEFINITIONS,
  DEFAULT_PERMISSIONS_MATRIX,
  DEFAULT_SECURITY_POLICIES,
} from '@/types/permissions';

export default function PermissionsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();

  const [matrix, setMatrix] = useState<RolePermissionsMatrix>(
    DEFAULT_PERMISSIONS_MATRIX,
  );
  const [initialMatrix, setInitialMatrix] = useState<RolePermissionsMatrix>(
    DEFAULT_PERMISSIONS_MATRIX,
  );
  const [securityPolicies, setSecurityPolicies] = useState<RoleSecurityPolicies>(
    DEFAULT_SECURITY_POLICIES,
  );
  const [initialSecurityPolicies, setInitialSecurityPolicies] =
    useState<RoleSecurityPolicies>(DEFAULT_SECURITY_POLICIES);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Fetch current permissions matrix & security policies from API
  useEffect(() => {
    async function loadPermissions() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/permissions');
        if (res.ok) {
          const data = await res.json();
          if (data.matrix) {
            setMatrix(data.matrix);
            setInitialMatrix(data.matrix);
          }
          if (data.securityPolicies) {
            setSecurityPolicies(data.securityPolicies);
            setInitialSecurityPolicies(data.securityPolicies);
          }
        }
      } catch (err: any) {
        console.warn(
          'Failed to load dynamic permissions & policies, using defaults:',
          err,
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadPermissions();
  }, []);

  // Compute unsaved changes across permissions and security policies
  const hasUnsavedChanges = useMemo(() => {
    return (
      JSON.stringify(matrix) !== JSON.stringify(initialMatrix) ||
      JSON.stringify(securityPolicies) !== JSON.stringify(initialSecurityPolicies)
    );
  }, [matrix, initialMatrix, securityPolicies, initialSecurityPolicies]);

  // Compute role permission counts
  const roleCounts = useMemo(() => {
    const roles: AppRole[] = ['admin', 'artist', 'author'];
    const total = PERMISSION_DEFINITIONS.length;

    return roles.reduce(
      (acc, r) => {
        const activeCount = Object.values(matrix[r] || {}).filter(
          Boolean,
        ).length;
        acc[r] = { active: activeCount, total };
        return acc;
      },
      {} as Record<AppRole, { active: number; total: number }>,
    );
  }, [matrix]);

  // Filtered permission definitions
  const filteredDefinitions = useMemo(() => {
    return PERMISSION_DEFINITIONS.filter((def) => {
      const matchesCategory =
        selectedCategory === 'All' || def.category === selectedCategory;
      const matchesSearch =
        def.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        def.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        def.key.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  // Group definitions by category
  const groupedDefinitions = useMemo(() => {
    const groups: Record<PermissionCategory, typeof filteredDefinitions> = {
      Appointments: [],
      'Blog & Content': [],
      'Media Assets': [],
      Taxonomy: [],
      'Team & Users': [],
      'System Settings': [],
    };

    filteredDefinitions.forEach((def) => {
      if (groups[def.category]) {
        groups[def.category].push(def);
      }
    });

    return groups;
  }, [filteredDefinitions]);

  // Toggle a single permission for a role
  const handleToggle = (role: AppRole, key: PermissionKey) => {
    if (role === 'admin') return; // Admin is permanently locked to true

    setMatrix((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [key]: !prev[role][key],
      },
    }));
  };

  // Toggle all permissions in a category for a role
  const handleToggleCategory = (
    category: PermissionCategory,
    role: AppRole,
    targetValue: boolean,
  ) => {
    if (role === 'admin') return;

    const categoryKeys = PERMISSION_DEFINITIONS.filter(
      (d) => d.category === category,
    ).map((d) => d.key);
    setMatrix((prev) => {
      const updatedRole = { ...prev[role] };
      categoryKeys.forEach((key) => {
        updatedRole[key] = targetValue;
      });
      return {
        ...prev,
        [role]: updatedRole,
      };
    });
  };

  // Handle security policy change for a role
  const handlePolicyChange = (role: AppRole, minutes: number) => {
    setSecurityPolicies((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        autoLogoutMinutes: minutes,
      },
    }));
  };

  // Save changes to API
  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccessMessage(null);

    try {
      const res = await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matrix, securityPolicies }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update permissions & policies');
      }

      setInitialMatrix(data.matrix || matrix);
      if (data.securityPolicies) {
        setSecurityPolicies(data.securityPolicies);
        setInitialSecurityPolicies(data.securityPolicies);
      }

      setSaveSuccessMessage(
        'Permissions and session security policies saved and applied live across all roles!',
      );
      setTimeout(() => setSaveSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default matrix & security policies
  const handleResetDefaults = () => {
    if (
      window.confirm(
        'Reset all role permissions and session security policies back to recommended studio defaults?',
      )
    ) {
      setMatrix(DEFAULT_PERMISSIONS_MATRIX);
      setSecurityPolicies(DEFAULT_SECURITY_POLICIES);
    }
  };

  // Guard: User must be an Admin
  const userRole =
    (user?.role as string) || (user?.user_metadata?.role as string) || 'author';
  const isAdmin = userRole === 'admin';

  if (isAuthLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#ff7b01] animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold font-serif text-[#2e0249]">
            Admin Authorization Required
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            The Role & Permission Matrix is restricted to{' '}
            <strong className="text-[#ff7b01]">Super Administrators</strong>.
            Your current role (
            <span className="capitalize font-semibold text-gray-800">
              {userRole}
            </span>
            ) does not have privileges to modify system-wide capabilities.
          </p>
          <div className="flex gap-2 w-full pt-2">
            <Link
              href={userRole === 'artist' ? '/admin' : '/cms'}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#2e0249] hover:bg-[#3d0360] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2]/50 pb-20">
      {/* Top Banner / Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-200/80 sticky top-0 z-30 shadow-2xs backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#2e0249] mt-1">
              Role & Permission Matrix
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Dynamically configure granular access control and session security across Studio
              Appointments and Blog CMS.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 shadow-2xs transition-colors cursor-pointer"
              title="Reset matrix & policies to factory recommendations"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                hasUnsavedChanges
                  ? 'bg-[#ff7b01] hover:bg-[#e06c00] text-white shadow-[#ff7b01]/25 ring-2 ring-[#ff7b01]/30'
                  : 'bg-[#2e0249] hover:bg-[#3d0360] text-white opacity-90'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Matrix...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Matrix</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Feedback Alerts */}
        {saveSuccessMessage ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessMessage}</span>
            </div>
            <button
              onClick={() => setSaveSuccessMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2 shadow-xs">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        {/* Role Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Admin Card */}
          <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#2e0249] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#2e0249]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#2e0249] text-sm">
                    Super Admin
                  </h3>
                  <span className="text-[10px] text-gray-500 font-mono">
                    role: 'admin'
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#2e0249] border border-purple-200">
                Locked
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-3">
              Unrestricted access to studio client booking records, user
              administration, deleting records, and system settings.
            </p>
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">Granted Capabilities:</span>
              <span className="font-bold text-[#2e0249]">
                {roleCounts.admin.active} / {roleCounts.admin.total} (100%)
              </span>
            </div>
          </div>

          {/* Artist Card */}
          <div className="bg-white rounded-3xl p-5 border border-orange-100 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#ff7b01] flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#ff7b01]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#2e0249] text-sm">
                    Tattoo Artist
                  </h3>
                  <span className="text-[10px] text-gray-500 font-mono">
                    role: 'artist'
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-[#ff7b01] border border-orange-200">
                Staff
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-3">
              Studio appointments feed, client consultations, scheduling, plus
              creating and editing blog articles.
            </p>
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">Granted Capabilities:</span>
              <span className="font-bold text-[#ff7b01]">
                {roleCounts.artist.active} / {roleCounts.artist.total} Active
              </span>
            </div>
          </div>

          {/* Author Card */}
          <div className="bg-white rounded-3xl p-5 border border-blue-100 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <PenTool className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-[#2e0249] text-sm">
                    Editorial Author
                  </h3>
                  <span className="text-[10px] text-gray-500 font-mono">
                    role: 'author'
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                Content Only
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-3">
              Editorial CMS access to draft articles and upload media. Strictly
              blocked from client appointment feeds.
            </p>
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">Granted Capabilities:</span>
              <span className="font-bold text-blue-600">
                {roleCounts.author.active} / {roleCounts.author.total} Active
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Role Session & Security Inactivity Policies */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-[#2e0249] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#ff7b01]" />
                <span>Session & Inactivity Security Policies</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Centrally control automated sign-out when unattended sessions exceed the inactivity threshold.
                Enforced studio-wide per role by administrators.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 self-start sm:self-auto">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              Role Governed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {/* Super Admin Policy Box */}
            <div className="bg-[#faf7f2]/70 rounded-2xl p-4 sm:p-5 border border-purple-100/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-[#2e0249] flex items-center justify-center font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-[#2e0249]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#2e0249]">Super Admin</h4>
                    <span className="text-[10px] text-gray-400 font-mono">role: 'admin'</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-[#2e0249]">
                  {securityPolicies.admin.autoLogoutMinutes === 0
                    ? 'No Timeout'
                    : `${securityPolicies.admin.autoLogoutMinutes}m Timeout`}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  Inactivity Timeout
                </label>
                <select
                  value={securityPolicies.admin.autoLogoutMinutes}
                  onChange={(e) => handlePolicyChange('admin', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-[#2e0249] focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all cursor-pointer"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>1 Hour (Recommended)</option>
                  <option value={120}>2 Hours</option>
                  <option value={240}>4 Hours</option>
                  <option value={0}>Never (Disable Timeout)</option>
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  Protects unrestricted administrative studio access.
                </p>
              </div>
            </div>

            {/* Tattoo Artist Policy Box */}
            <div className="bg-[#faf7f2]/70 rounded-2xl p-4 sm:p-5 border border-orange-100/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#ff7b01] flex items-center justify-center font-bold text-xs">
                    <Calendar className="w-4 h-4 text-[#ff7b01]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#2e0249]">Tattoo Artist</h4>
                    <span className="text-[10px] text-gray-400 font-mono">role: 'artist'</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#ff7b01]">
                  {securityPolicies.artist.autoLogoutMinutes === 0
                    ? 'No Timeout'
                    : `${securityPolicies.artist.autoLogoutMinutes}m Timeout`}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  Inactivity Timeout
                </label>
                <select
                  value={securityPolicies.artist.autoLogoutMinutes}
                  onChange={(e) => handlePolicyChange('artist', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-[#2e0249] focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all cursor-pointer"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes (Recommended)</option>
                  <option value={60}>1 Hour</option>
                  <option value={120}>2 Hours</option>
                  <option value={240}>4 Hours</option>
                  <option value={0}>Never (Disable Timeout)</option>
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  Secures client bookings and consultation records on shared studio tablets.
                </p>
              </div>
            </div>

            {/* Editorial Author Policy Box */}
            <div className="bg-[#faf7f2]/70 rounded-2xl p-4 sm:p-5 border border-blue-100/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                    <PenTool className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#2e0249]">Editorial Author</h4>
                    <span className="text-[10px] text-gray-400 font-mono">role: 'author'</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {securityPolicies.author.autoLogoutMinutes === 0
                    ? 'No Timeout'
                    : `${securityPolicies.author.autoLogoutMinutes}m Timeout`}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  Inactivity Timeout
                </label>
                <select
                  value={securityPolicies.author.autoLogoutMinutes}
                  onChange={(e) => handlePolicyChange('author', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-[#2e0249] focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all cursor-pointer"
                >
                  <option value={15}>15 Minutes (Recommended)</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>1 Hour</option>
                  <option value={120}>2 Hours</option>
                  <option value={240}>4 Hours</option>
                  <option value={0}>Never (Disable Timeout)</option>
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  Prevents unauthorized editorial draft publishing or modification.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              'All',
              'Appointments',
              'Blog & Content',
              'Media Assets',
              'Taxonomy',
              'Team & Users',
              'System Settings',
            ].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#2e0249] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search capability or key..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ff7b01] focus:ring-1 focus:ring-[#ff7b01]/20 transition-all"
            />
          </div>
        </div>

        {/* Permission Matrix Table */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/60 text-gray-500 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-4 px-6 min-w-[280px]">Capability & Resource</th>
                  <th className="py-4 px-4 text-center w-36">
                    <div className="flex flex-col items-center">
                      <span className="text-[#2e0249] font-bold">Admin</span>
                      <span className="text-[10px] font-normal text-gray-400">Full Access</span>
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center w-36">
                    <div className="flex flex-col items-center">
                      <span className="text-[#ff7b01] font-bold">Artist</span>
                      <span className="text-[10px] font-normal text-gray-400">Studio Staff</span>
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center w-36">
                    <div className="flex flex-col items-center">
                      <span className="text-blue-600 font-bold">Author</span>
                      <span className="text-[10px] font-normal text-gray-400">Content Only</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.entries(groupedDefinitions).map(([category, items]) => {
                  if (items.length === 0) return null;

                  return (
                    <React.Fragment key={category}>
                      {/* Category Header Row */}
                      <tr className="bg-gray-50/90 border-t border-b border-gray-200/60">
                        <td colSpan={4} className="py-2.5 px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-[#2e0249] text-xs uppercase tracking-wider">
                              {category === 'Appointments' ? (
                                <Calendar className="w-4 h-4 text-[#ff7b01]" />
                              ) : null}
                              {category === 'Blog & Content' ? (
                                <PenTool className="w-4 h-4 text-purple-600" />
                              ) : null}
                              {category === 'Media Assets' ? (
                                <ImageIcon className="w-4 h-4 text-emerald-600" />
                              ) : null}
                              {category === 'Taxonomy' ? (
                                <Tag className="w-4 h-4 text-blue-600" />
                              ) : null}
                              {category === 'Team & Users' ? (
                                <Users className="w-4 h-4 text-indigo-600" />
                              ) : null}
                              {category === 'System Settings' ? (
                                <Lock className="w-4 h-4 text-amber-600" />
                              ) : null}
                              <span>{category}</span>
                              <span className="text-[10px] font-normal text-gray-500">
                                ({items.length} items)
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-[10px] font-medium text-gray-500">
                              <span className="hidden sm:inline">
                                Quick toggle for:
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const allActive = items.every(
                                    (i) => matrix.artist[i.key],
                                  );
                                  handleToggleCategory(
                                    category as PermissionCategory,
                                    'artist',
                                    !allActive,
                                  );
                                }}
                                className="hover:text-[#ff7b01] underline cursor-pointer"
                              >
                                Artist
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const allActive = items.every(
                                    (i) => matrix.author[i.key],
                                  );
                                  handleToggleCategory(
                                    category as PermissionCategory,
                                    'author',
                                    !allActive,
                                  );
                                }}
                                className="hover:text-blue-600 underline cursor-pointer"
                              >
                                Author
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Category Item Rows */}
                      {items.map((def) => {
                        const isArtistActive = matrix.artist[def.key] ?? false;
                        const isAuthorActive = matrix.author[def.key] ?? false;

                        return (
                          <tr
                            key={def.key}
                            className="hover:bg-gray-50/80 transition-colors"
                          >
                            {/* Capability description */}
                            <td className="py-3.5 px-6">
                              <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                                <span>{def.label}</span>
                                <span className="font-mono text-[10px] text-gray-400 font-normal">
                                  ({def.key})
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                                {def.description}
                              </p>
                            </td>

                            {/* Admin Column (Permanently locked to ON) */}
                            <td className="py-3.5 px-4 text-center">
                              <div
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200"
                                title="Admin always has full access"
                              >
                                <Check className="w-4 h-4 stroke-[2.5]" />
                              </div>
                            </td>

                            {/* Artist Column (Interactive Toggle) */}
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggle('artist', def.key)}
                                className={`w-11 h-6 inline-flex items-center rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff7b01]/30 p-1 ${
                                  isArtistActive
                                    ? 'bg-[#ff7b01]'
                                    : 'bg-gray-200'
                                }`}
                                role="switch"
                                aria-checked={isArtistActive}
                                title={`Toggle ${def.label} for Artist`}
                              >
                                <span
                                  className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                                    isArtistActive
                                      ? 'translate-x-5'
                                      : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </td>

                            {/* Author Column (Interactive Toggle) */}
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggle('author', def.key)}
                                className={`w-11 h-6 inline-flex items-center rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30 p-1 ${
                                  isAuthorActive ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                                role="switch"
                                aria-checked={isAuthorActive}
                                title={`Toggle ${def.label} for Author`}
                              >
                                <span
                                  className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                                    isAuthorActive
                                      ? 'translate-x-5'
                                      : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Informational Guidance Box */}
        <div className="bg-amber-50/60 rounded-3xl p-5 border border-amber-200/80 flex items-start gap-3.5 text-xs text-amber-900">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-950">
              How Dynamic Permissions & Security Policies Work
            </h4>
            <p className="text-amber-800 leading-relaxed">
              When you save changes, both the permission matrix and session security policies are committed to the{' '}
              <code className="font-mono bg-amber-100/70 px-1 py-0.5 rounded text-[11px]">
                blog_role_permissions
              </code>{' '}
              table in Supabase. Inactivity timeouts and role capabilities are enforced live across all studio
              devices. The <strong>Super Admin</strong> role is hard-locked to unrestricted permissions for system integrity.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
