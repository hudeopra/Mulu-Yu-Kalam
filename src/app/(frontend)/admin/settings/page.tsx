'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Settings,
  Upload,
  Save,
  RotateCcw,
  Mail,
  Phone,
  MapPin,
  Globe,
  Share2,
  CheckCircle2,
  Shield,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { SiteSettings, DEFAULT_SITE_SETTINGS } from '@/types/landing';

export default function SettingsAdminPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [initialSettings, setInitialSettings] = useState<SiteSettings>(
    DEFAULT_SITE_SETTINGS,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);

  // Load settings from API
  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/admin/landing/settings');
        if (res.ok) {
          const json = await res.json();
          if (json?.settings) {
            setSettings(json.settings);
            setInitialSettings(json.settings);
          }
        }
      } catch (err) {
        console.warn('Failed to load settings from API, using defaults:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const isDirty = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  const handleAssetUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logo_url' | 'favicon_url' | 'banner_image_url',
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTarget(field);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('section', 'settings');
    formData.append('slotNumber', '1');
    formData.append('settingField', field);

    try {
      const res = await fetch('/api/admin/landing/upload-asset', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to upload asset');
      }

      const { publicUrl } = await res.json();
      setSettings((prev) => ({ ...prev, [field]: publicUrl }));
      toast.success(
        `${field === 'logo_url' ? 'Main logo' : field === 'favicon_url' ? 'Favicon' : 'Banner image'} updated!`,
      );
    } catch (err: any) {
      toast.error(err.message || 'Asset upload failed');
    } finally {
      setUploadingTarget(null);
      e.target.value = '';
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/landing/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to save settings');
      }

      setInitialSettings(settings);
      toast.success('Website settings updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(initialSettings);
    toast.info('Discarded unsaved settings changes');
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] pb-16">
      {/* Sticky Header */}
      <div className="bg-white border-b border-[#f0e8dc] sticky top-0 z-20 py-4 px-4 sm:px-8 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              {isDirty && (
                <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Unsaved changes
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-[#2e0249] tracking-tight mt-1">
              Website Settings
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {isDirty && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Discard</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#ff7b01] hover:bg-[#e06d00] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {isLoading ? (
          <div className="bg-white rounded-3xl p-12 text-center text-gray-500 border border-[#f0e8dc]">
            <div className="inline-block w-8 h-8 border-3 border-[#ff7b01] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold">Loading Website Settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-8">
            {/* Card 1: Brand Images & Media Assets */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f0e8dc] shadow-xs space-y-6">
              <div className="border-b border-[#f0e8dc] pb-4">
                <h2 className="text-base font-bold text-[#2e0249] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#ff7b01]" />
                  <span>Branding & Visual Media</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Upload your brand identity assets. The main logo automatically
                  synchronizes across the landing page, navigation header,
                  footer, admin sidebar, login screen, and booking confirmation
                  emails.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Main Logo */}
                <div className="p-5 rounded-2xl border border-[#f0e8dc] bg-[#faf7f2] space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#2e0249] uppercase tracking-wider block">
                      1. Main Logo
                    </span>
                    <p className="text-[11px] text-gray-500">
                      Primary studio logo (SVG / transparent PNG recommended).
                    </p>
                    <div className="p-4 rounded-xl  flex items-center justify-center min-h-[90px]">
                      <Image
                        src={settings.logo_url}
                        alt="Current Studio Logo"
                        width={180}
                        height={45}
                        className="max-h-[50px] w-auto object-contain"
                      />
                    </div>
                  </div>

                  <label className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-[#ff7b01] bg-white hover:bg-[#ffecd0] border border-[#ffbd5b]/40 rounded-xl cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {uploadingTarget === 'logo_url'
                        ? 'Uploading...'
                        : 'Replace Logo'}
                    </span>
                    <input
                      type="file"
                      accept="image/svg+xml,image/png,image/webp"
                      onChange={(e) => handleAssetUpload(e, 'logo_url')}
                      disabled={uploadingTarget === 'logo_url'}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* 2. Favicon */}
                <div className="p-5 rounded-2xl border border-[#f0e8dc] bg-[#faf7f2] space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#2e0249] uppercase tracking-wider block">
                      2. Browser Favicon
                    </span>
                    <p className="text-[11px] text-gray-500">
                      Icon displayed in browser tabs and bookmarks (PNG / ICO).
                    </p>
                    <div className="p-4 rounded-xl bg-white border border-[#f0e8dc] flex items-center justify-center min-h-[90px]">
                      <div className="w-12 h-12 relative">
                        <Image
                          src={settings.favicon_url}
                          alt="Current Favicon"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  <label className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-[#ff7b01] bg-white hover:bg-[#ffecd0] border border-[#ffbd5b]/40 rounded-xl cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {uploadingTarget === 'favicon_url'
                        ? 'Uploading...'
                        : 'Replace Favicon'}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/x-icon,image/svg+xml"
                      onChange={(e) => handleAssetUpload(e, 'favicon_url')}
                      disabled={uploadingTarget === 'favicon_url'}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* 3. Hero Banner Background */}
                <div className="p-5 rounded-2xl border border-[#f0e8dc] bg-[#faf7f2] space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#2e0249] uppercase tracking-wider block">
                      3. Hero Banner Background
                    </span>
                    <p className="text-[11px] text-gray-500">
                      High-resolution background image for the top hero banner.
                    </p>
                    <div className="relative h-[90px] rounded-xl overflow-hidden bg-gray-900 border border-[#f0e8dc]">
                      <Image
                        src={settings.banner_image_url}
                        alt="Current Banner Background"
                        fill
                        className="object-cover opacity-80"
                      />
                    </div>
                  </div>

                  <label className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-[#ff7b01] bg-white hover:bg-[#ffecd0] border border-[#ffbd5b]/40 rounded-xl cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {uploadingTarget === 'banner_image_url'
                        ? 'Uploading...'
                        : 'Replace Banner'}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/webp,image/png"
                      onChange={(e) => handleAssetUpload(e, 'banner_image_url')}
                      disabled={uploadingTarget === 'banner_image_url'}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Card 2: Contact Information & Copyright */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f0e8dc] shadow-xs space-y-6">
              <div className="border-b border-[#f0e8dc] pb-4">
                <h2 className="text-base font-bold text-[#2e0249] flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#ff7b01]" />
                  <span>Contact Information & Studio Inquiries</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  These details feed into the Contact section cards, footer, and
                  inquiry dialogs across the website.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#2e0249] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#ff7b01]" />
                    <span>Studio Public Email</span>
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) =>
                      setSettings({ ...settings, email: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-[#f0e8dc] focus:ring-2 focus:ring-[#ff7b01] focus:outline-none"
                    placeholder="contact@muluyukalam.com.np"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2e0249] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#ff7b01]" />
                    <span>Studio Phone / WhatsApp</span>
                  </label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) =>
                      setSettings({ ...settings, phone: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-[#f0e8dc] focus:ring-2 focus:ring-[#ff7b01] focus:outline-none"
                    placeholder="+977 9861-341995"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#2e0249] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#ff7b01]" />
                    <span>Physical Studio Address</span>
                  </label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) =>
                      setSettings({ ...settings, address: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-[#f0e8dc] focus:ring-2 focus:ring-[#ff7b01] focus:outline-none"
                    placeholder="Harisiddhi, LMC-29, Lalitpur"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#2e0249] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#ff7b01]" />
                    <span>Google Maps Location URL</span>
                  </label>
                  <input
                    type="url"
                    value={settings.maps_url}
                    onChange={(e) =>
                      setSettings({ ...settings, maps_url: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-[#f0e8dc] focus:ring-2 focus:ring-[#ff7b01] focus:outline-none"
                    placeholder="https://maps.app.goo.gl/..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#2e0249] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#ff7b01]" />
                    <span>Footer Copyright Notice</span>
                  </label>
                  <input
                    type="text"
                    value={settings.copyright_text}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        copyright_text: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-[#f0e8dc] focus:ring-2 focus:ring-[#ff7b01] focus:outline-none"
                    placeholder="Copyright © {year} Mulu Yu Kalam. All rights reserved."
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Tip: Use{' '}
                    <code className="font-mono text-[#ff7b01]">{'{year}'}</code>{' '}
                    to automatically output the current year.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Social Media Links */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f0e8dc] shadow-xs space-y-6">
              <div className="border-b border-[#f0e8dc] pb-4">
                <h2 className="text-base font-bold text-[#2e0249] flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#ff7b01]" />
                  <span>Social Media Profiles</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Links that populate the floating social bar in the About
                  section and contact cards.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    WhatsApp Chat URL
                  </label>
                  <input
                    type="url"
                    value={settings.whatsapp_url}
                    onChange={(e) =>
                      setSettings({ ...settings, whatsapp_url: e.target.value })
                    }
                    className="w-full px-4 py-2 text-xs bg-white rounded-xl border border-[#f0e8dc] focus:ring-2 focus:ring-[#ff7b01] focus:outline-none"
                    placeholder="https://wa.me/9779861341995/"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Instagram Profile URL
                  </label>
                  <input
                    type="url"
                    value={settings.instagram_url}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        instagram_url: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 text-xs bg-white rounded-xl border border-[#f0e8dc] focus:ring-2 focus:ring-[#ff7b01] focus:outline-none"
                    placeholder="https://www.instagram.com/mulu_yu_kalam/"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Facebook Page URL
                  </label>
                  <input
                    type="url"
                    value={settings.facebook_url}
                    onChange={(e) =>
                      setSettings({ ...settings, facebook_url: e.target.value })
                    }
                    className="w-full px-4 py-2 text-xs bg-white rounded-xl border border-[#f0e8dc] focus:ring-2 focus:ring-[#ff7b01] focus:outline-none"
                    placeholder="https://www.facebook.com/MuluYuKalam"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    TikTok Profile URL
                  </label>
                  <input
                    type="url"
                    value={settings.tiktok_url}
                    onChange={(e) =>
                      setSettings({ ...settings, tiktok_url: e.target.value })
                    }
                    className="w-full px-4 py-2 text-xs bg-white rounded-xl border border-[#f0e8dc] focus:ring-2 focus:ring-[#ff7b01] focus:outline-none"
                    placeholder="https://www.tiktok.com/@mulu_yu_kalam"
                  />
                </div>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
