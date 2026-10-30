'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  Users,
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AtSign,
  Shield,
  ShieldAlert,
  Save,
  RotateCcw,
  Trash2,
  KeyRound,
  X,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import {
  PasswordStrengthBar,
  GeneratePasswordButton,
} from '@/components/admin/PasswordStrengthIndicator';

interface TeamMember {
  id: number;
  email: string;
  name: string;
  username: string;
  publicEmail: string;
  role: 'admin' | 'artist' | 'author';
  createdAt?: string;
}

export default function TeamManagementPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form state for selected member
  const [formData, setFormData] = useState<{
    name: string;
    username: string;
    publicEmail: string;
    role: 'admin' | 'artist' | 'author';
    email: string;
  }>({
    name: '',
    username: '',
    publicEmail: '',
    role: 'author',
    email: '',
  });

  // Password Change Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Add Member Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMemberData, setNewMemberData] = useState({
    name: '',
    username: '',
    publicEmail: '',
    email: '',
    role: 'author' as 'admin' | 'artist' | 'author',
    password: '',
    confirmPassword: '',
  });
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showAddConfirmPassword, setShowAddConfirmPassword] = useState(false);
  const [isCreatingMember, setIsCreatingMember] = useState(false);

  // Danger Zone Email confirmation state
  const [dangerEmail, setDangerEmail] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/team');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch team members');
      }
      setMembers(data.members || []);
      if (data.members?.length > 0 && !selectedMember) {
        setSelectedMember(data.members[0]);
        setFormData({
          name: data.members[0].name || '',
          username: data.members[0].username || '',
          publicEmail: data.members[0].publicEmail || '',
          role: data.members[0].role || 'author',
          email: data.members[0].email || '',
        });
        setDangerEmail(data.members[0].email || '');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error fetching team';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleSelectMember = (member: TeamMember) => {
    setSelectedMember(member);
    setFormData({
      name: member.name || '',
      username: member.username || '',
      publicEmail: member.publicEmail || '',
      role: member.role || 'author',
      email: member.email || '',
    });
    setDangerEmail(member.email || '');
  };

  // 1. General Profile & Role Update
  const handleUpdateGeneralInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedMember.id,
          name: formData.name,
          username: formData.username,
          publicEmail: formData.publicEmail,
          role: formData.role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update member');
      }

      toast.success(
        `${formData.name || selectedMember.email} profile updated successfully.`,
      );
      const updatedList = members.map((m) =>
        m.id === selectedMember.id ? { ...m, ...data.member } : m,
      );
      setMembers(updatedList);
      setSelectedMember({ ...selectedMember, ...data.member });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Update failed';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Danger Zone: Email Update
  const handleUpdatePrimaryEmail = async () => {
    if (!selectedMember) return;
    if (!dangerEmail || !dangerEmail.includes('@')) {
      toast.error('Please provide a valid email address.');
      return;
    }

    if (
      dangerEmail.toLowerCase().trim() ===
      selectedMember.email.toLowerCase().trim()
    ) {
      toast.info('Email address is unchanged.');
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to change the primary login email for ${selectedMember.name || selectedMember.email} to "${dangerEmail}"? The member will need to sign in with this new email.`,
      )
    ) {
      return;
    }

    setIsUpdatingEmail(true);
    try {
      const res = await fetch('/api/admin/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedMember.id,
          email: dangerEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update email');
      }

      toast.success(`Primary email changed to ${data.member.email}.`);
      const updatedList = members.map((m) =>
        m.id === selectedMember.id ? { ...m, email: data.member.email } : m,
      );
      setMembers(updatedList);
      setSelectedMember({ ...selectedMember, email: data.member.email });
      setFormData((prev) => ({ ...prev, email: data.member.email }));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update email';
      toast.error(message);
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  // 3. Password Change Modal Action
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetch('/api/admin/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedMember.id,
          password: passwordData.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      toast.success(
        `Password for ${selectedMember.name || selectedMember.email} updated successfully.`,
      );
      setIsPasswordModalOpen(false);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Password update failed';
      toast.error(message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // 4. Create New Member Action
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberData.email || !newMemberData.email.includes('@')) {
      toast.error('Please provide a valid email address.');
      return;
    }

    if (!newMemberData.password || newMemberData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (newMemberData.password !== newMemberData.confirmPassword) {
      toast.error('Password and confirmation do not match.');
      return;
    }

    setIsCreatingMember(true);
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMemberData.name,
          username: newMemberData.username,
          publicEmail: newMemberData.publicEmail,
          email: newMemberData.email,
          role: newMemberData.role,
          password: newMemberData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create team member');
      }

      toast.success(
        `Team member ${data.member.name || data.member.email} created successfully.`,
      );
      setMembers((prev) => [...prev, data.member]);
      setSelectedMember(data.member);
      handleSelectMember(data.member);
      setIsAddModalOpen(false);
      setNewMemberData({
        name: '',
        username: '',
        publicEmail: '',
        email: '',
        role: 'author',
        password: '',
        confirmPassword: '',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Creation failed';
      toast.error(message);
    } finally {
      setIsCreatingMember(false);
    }
  };

  // 5. Delete Member Action
  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    if (
      user?.email &&
      selectedMember.email.toLowerCase() === user.email.toLowerCase()
    ) {
      toast.error('You cannot delete your own administrative account.');
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to permanently remove ${selectedMember.name || selectedMember.email} from the studio team? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/team?id=${selectedMember.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete member');
      }

      toast.success(`Team member removed.`);
      const remaining = members.filter((m) => m.id !== selectedMember.id);
      setMembers(remaining);
      setSelectedMember(remaining[0] || null);
      if (remaining[0]) handleSelectMember(remaining[0]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans text-gray-900 pb-20 selection:bg-[#ff7b01] selection:text-white">
      {/* Top Banner Bar */}
      <div className="bg-white border-b border-[#f0e8dc] sticky top-0 z-20 shadow-2xs backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-xs font-semibold text-[#554433] hover:text-[#ff7b01] px-3 py-1.5 rounded-xl transition-colors bg-[#faf7f2] border border-[#ede3d4]"
            >
              &larr; Appointments Feed
            </Link>
            <Link
              href="/cms"
              className="text-xs font-semibold text-[#554433] hover:text-[#ff7b01] px-3 py-1.5 rounded-xl transition-colors bg-[#faf7f2] border border-[#ede3d4]"
            >
              &larr; Blog CMS Dashboard
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ff7b01] hover:bg-[#e06c00] text-white text-xs font-bold shadow-md shadow-[#ff7b01]/25 transition-all cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Team Member</span>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#2e0249] via-[#3b075e] to-[#2e0249] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-[#2e0249]/10">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-200">
                Staff & Roles Administration
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Team Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              Manage studio tattoo artists, authors, and system administrators.
              Configure designation roles, author bylines, password credentials,
              and primary sign-in access.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-3xl p-12 text-center text-[#9c8a77] border border-[#f0e8dc] shadow-xs">
            <div className="inline-block w-8 h-8 border-3 border-[#ff7b01] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold">
              Loading studio team members...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Team Directory */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#554433] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#ff7b01]" />
                  <span>Team Directory ({members.length})</span>
                </h2>
              </div>

              <div className="space-y-2.5">
                {members.map((member) => {
                  const isSelected = selectedMember?.id === member.id;
                  const isSelf =
                    user?.email &&
                    member.email.toLowerCase() === user.email.toLowerCase();

                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => handleSelectMember(member)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                        isSelected
                          ? 'bg-white border-[#ff7b01] shadow-md ring-2 ring-[#ff7b01]/20'
                          : 'bg-white/80 hover:bg-white border-[#ede3d4] shadow-xs'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-full bg-[#2e0249] text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {(member.name || member.email).charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs sm:text-sm text-[#2e0249] truncate">
                            {member.name || 'Staff Member'}
                          </p>
                          {isSelf ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-[#2e0249]">
                              You
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[11px] text-gray-500 font-mono truncate">
                          {member.email}
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase shrink-0 border ${
                          member.role === 'admin'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : member.role === 'artist'
                              ? 'bg-orange-50 text-[#ff7b01] border-[#ffbd5b]/50'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {member.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Selected Member Management Form */}
            {selectedMember ? (
              <div className="lg:col-span-8 space-y-6">
                {/* 1. General Info & Role Form */}
                <form
                  onSubmit={handleUpdateGeneralInfo}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f0e8dc] shadow-xs space-y-6"
                >
                  <div className="border-b border-[#f0e8dc] pb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#2e0249] flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-[#ff7b01]" />
                        <span>
                          Edit Member:{' '}
                          {selectedMember.name || selectedMember.email}
                        </span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Update editorial bylines, designations, and internal
                        handles.
                      </p>
                    </div>

                    {/* Change Password Modal Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fff5eb] hover:bg-[#ffe8d1] border border-[#ffbd5b]/50 text-xs font-bold text-[#ff7b01] transition-colors cursor-pointer shrink-0"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Change Password</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#554433] uppercase tracking-wider mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g. Maya Shrestha"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ede3d4] bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#554433] uppercase tracking-wider mb-2">
                        Internal Username
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        placeholder="e.g. maya_ink"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ede3d4] bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#554433] uppercase tracking-wider mb-2">
                        Public Contact Email
                      </label>
                      <input
                        type="email"
                        value={formData.publicEmail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            publicEmail: e.target.value,
                          })
                        }
                        placeholder="Optional public bio email"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ede3d4] bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#554433] uppercase tracking-wider mb-2">
                        System Role Designation
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            role: e.target.value as
                              | 'admin'
                              | 'artist'
                              | 'author',
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ede3d4] bg-white text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all cursor-pointer"
                      >
                        <option value="author">
                          Author (CMS Articles Only)
                        </option>
                        <option value="artist">
                          Artist (Appointments + CMS)
                        </option>
                        <option value="admin">
                          Admin (Full System Access)
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2e0249] hover:bg-[#3d0360] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-40 cursor-pointer"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Member Details</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* 2. DANGER ZONE: Email Changing & Account Removal (Bottom of Team Management) */}
                <div className="bg-gradient-to-b from-white to-red-50/30 rounded-3xl p-6 sm:p-8 border-2 border-red-200 shadow-sm space-y-6">
                  <div className="border-b border-red-100 pb-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-red-950 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span>Danger Zone: Primary Sign-in Access</span>
                      </h4>
                      <p className="text-xs text-red-800/80 mt-1">
                        Changing the primary email modifies the member&apos;s
                        authentication credential across all studio services.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-800 uppercase tracking-wider">
                      Danger Zone
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-red-950 uppercase tracking-wider mb-2">
                        Primary Authentication Email
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            value={dangerEmail}
                            onChange={(e) => setDangerEmail(e.target.value)}
                            placeholder="staff@muluyukalam.com.np"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-red-200 bg-white text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all font-mono"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleUpdatePrimaryEmail}
                          disabled={
                            isUpdatingEmail ||
                            dangerEmail.toLowerCase().trim() ===
                              selectedMember.email.toLowerCase().trim()
                          }
                          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                        >
                          {isUpdatingEmail
                            ? 'Updating Email...'
                            : 'Update Sign-in Email'}
                        </button>
                      </div>
                      <p className="text-[11px] text-red-700/70 mt-1.5">
                        Current active address:{' '}
                        <strong className="font-mono">
                          {selectedMember.email}
                        </strong>
                      </p>
                    </div>

                    {/* Member Deletion Option */}
                    <div className="pt-4 border-t border-red-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-red-950">
                          Remove Team Member
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Revokes all studio booking and blog author privileges.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleDeleteMember}
                        disabled={
                          user?.email
                            ? selectedMember.email.toLowerCase() ===
                              user.email.toLowerCase()
                            : false
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title={
                          user?.email &&
                          selectedMember.email.toLowerCase() ===
                            user.email.toLowerCase()
                            ? 'Cannot delete your own account'
                            : 'Permanently remove staff'
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        <span>Delete Member</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>

      {/* POPUP MODAL 1: Password Change for Selected Member */}
      {isPasswordModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 text-[#ff7b01] flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#2e0249]">
                    Change Member Password
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    For: {selectedMember.name || selectedMember.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordData({ newPassword: '', confirmPassword: '' });
                }}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4">
              {/* New Password with Strength Indicator & Generate Button */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#554433] uppercase tracking-wider">
                    New Password
                  </label>
                  <GeneratePasswordButton
                    onGenerate={(generated) => {
                      setPasswordData({
                        newPassword: generated,
                        confirmPassword: generated,
                      });
                      setShowNewPassword(true);
                      setShowConfirmPassword(true);
                    }}
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Enter new password (min. 6 chars)"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#ede3d4] bg-white text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
                    aria-label={
                      showNewPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                <PasswordStrengthBar
                  password={passwordData.newPassword}
                  className="pt-1"
                />
              </div>

              {/* Confirm Password with Independent Toggle */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#554433] uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Re-type new password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#ede3d4] bg-white text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
                    aria-label={
                      showConfirmPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#ff7b01] hover:bg-[#e06c00] text-white text-xs font-bold shadow-md shadow-[#ff7b01]/25 transition-all disabled:opacity-40 cursor-pointer"
                >
                  {isUpdatingPassword ? 'Updating...' : 'Set Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL 2: Invite / Add New Team Member */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-[#2e0249] flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#2e0249]">
                    Invite New Team Member
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Creates unified access across Appointments Feed and Blog
                    CMS.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#554433] uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMemberData.name}
                    onChange={(e) =>
                      setNewMemberData({
                        ...newMemberData,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g. Maya Shrestha"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ede3d4] bg-white text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#554433] uppercase tracking-wider mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newMemberData.username}
                    onChange={(e) =>
                      setNewMemberData({
                        ...newMemberData,
                        username: e.target.value,
                      })
                    }
                    placeholder="e.g. maya_ink"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ede3d4] bg-white text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#554433] uppercase tracking-wider mb-1.5">
                    Sign-in Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newMemberData.email}
                    onChange={(e) =>
                      setNewMemberData({
                        ...newMemberData,
                        email: e.target.value,
                      })
                    }
                    placeholder="staff@muluyukalam.com.np"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ede3d4] bg-white text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#554433] uppercase tracking-wider mb-1.5">
                    Role Designation <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newMemberData.role}
                    onChange={(e) =>
                      setNewMemberData({
                        ...newMemberData,
                        role: e.target.value as 'admin' | 'artist' | 'author',
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ede3d4] bg-white text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all cursor-pointer"
                  >
                    <option value="author">
                      Author (Blog CMS articles & bylines only)
                    </option>
                    <option value="artist">
                      Artist (Studio Appointments + Blog CMS)
                    </option>
                    <option value="admin">
                      Administrator (Full System & User Control)
                    </option>
                  </select>
                </div>

                {/* Password with generator & strength indicator */}
                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#554433] uppercase tracking-wider">
                      Initial Password <span className="text-red-500">*</span>
                    </label>
                    <GeneratePasswordButton
                      onGenerate={(generated) => {
                        setNewMemberData({
                          ...newMemberData,
                          password: generated,
                          confirmPassword: generated,
                        });
                        setShowAddPassword(true);
                        setShowAddConfirmPassword(true);
                      }}
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showAddPassword ? 'text' : 'password'}
                      value={newMemberData.password}
                      onChange={(e) =>
                        setNewMemberData({
                          ...newMemberData,
                          password: e.target.value,
                        })
                      }
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#ede3d4] bg-white text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddPassword(!showAddPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
                      aria-label={
                        showAddPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showAddPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <PasswordStrengthBar password={newMemberData.password} />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-[#554433] uppercase tracking-wider">
                    Confirm Initial Password{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showAddConfirmPassword ? 'text' : 'password'}
                      value={newMemberData.confirmPassword}
                      onChange={(e) =>
                        setNewMemberData({
                          ...newMemberData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Re-type initial password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#ede3d4] bg-white text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#ff7b01] focus:ring-2 focus:ring-[#ff7b01]/20 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowAddConfirmPassword(!showAddConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
                      aria-label={
                        showAddConfirmPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      {showAddConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingMember}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#ff7b01] hover:bg-[#e06c00] text-white text-xs font-bold shadow-md shadow-[#ff7b01]/25 transition-all disabled:opacity-40 cursor-pointer"
                >
                  {isCreatingMember ? 'Creating...' : 'Create Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
