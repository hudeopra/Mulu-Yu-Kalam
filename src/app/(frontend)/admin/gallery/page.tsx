'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ImageIcon,
  Upload,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  Trash2,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  SiteGalleryItem,
  DEFAULT_HERO_ITEMS,
  DEFAULT_GALLERY_ITEMS,
} from '@/types/landing';

export default function GalleryAdminPage() {
  const [activeTab, setActiveTab] = useState<'gallery' | 'hero'>('gallery');
  const [heroItems, setHeroItems] =
    useState<SiteGalleryItem[]>(DEFAULT_HERO_ITEMS);
  const [galleryItems, setGalleryItems] = useState<SiteGalleryItem[]>(
    DEFAULT_GALLERY_ITEMS,
  );

  const [initialHero, setInitialHero] =
    useState<SiteGalleryItem[]>(DEFAULT_HERO_ITEMS);
  const [initialGallery, setInitialGallery] = useState<SiteGalleryItem[]>(
    DEFAULT_GALLERY_ITEMS,
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  // Load current gallery items from API
  useEffect(() => {
    async function loadGallery() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/admin/landing/gallery');
        if (res.ok) {
          const json = await res.json();
          if (json?.hero && json.hero.length > 0) {
            setHeroItems(json.hero);
            setInitialHero(json.hero);
          }
          if (json?.gallery && json.gallery.length > 0) {
            setGalleryItems(json.gallery);
            setInitialGallery(json.gallery);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch gallery items, using defaults:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadGallery();
  }, []);

  const isHeroDirty = JSON.stringify(heroItems) !== JSON.stringify(initialHero);
  const isGalleryDirty =
    JSON.stringify(galleryItems) !== JSON.stringify(initialGallery);
  const isDirty = isHeroDirty || isGalleryDirty;

  const currentList = activeTab === 'hero' ? heroItems : galleryItems;

  const handleAltChange = (
    section: 'hero' | 'gallery',
    slotNumber: number,
    newAlt: string,
  ) => {
    if (section === 'hero') {
      setHeroItems((prev) =>
        prev.map((item) =>
          item.slot_number === slotNumber ? { ...item, alt: newAlt } : item,
        ),
      );
    } else {
      setGalleryItems((prev) =>
        prev.map((item) =>
          item.slot_number === slotNumber ? { ...item, alt: newAlt } : item,
        ),
      );
    }
  };

  // Upload & Replace single slot image with gallery prefix and automatic cleanup of previous file
  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    item: SiteGalleryItem,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (WebP, PNG, JPEG)');
      return;
    }

    setUploadingSlot(item.slot_number);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('section', item.section);
    formData.append('slotNumber', item.slot_number.toString());
    if (item.storage_path) {
      formData.append('previousStoragePath', item.storage_path);
    }

    try {
      const res = await fetch('/api/admin/landing/upload-asset', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to upload image');
      }

      const { publicUrl, storagePath } = await res.json();

      if (item.section === 'hero') {
        setHeroItems((prev) =>
          prev.map((slot) =>
            slot.slot_number === item.slot_number
              ? {
                  ...slot,
                  image_url: publicUrl,
                  storage_path: storagePath,
                }
              : slot,
          ),
        );
      } else {
        setGalleryItems((prev) =>
          prev.map((slot) =>
            slot.slot_number === item.slot_number
              ? {
                  ...slot,
                  image_url: publicUrl,
                  storage_path: storagePath,
                }
              : slot,
          ),
        );
      }

      toast.success(
        `Slot #${item.slot_number} image replaced (previous image cleared)`,
      );
    } catch (err: any) {
      toast.error(err.message || 'Image replacement failed');
    } finally {
      setUploadingSlot(null);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/landing/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hero: heroItems,
          gallery: galleryItems,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to save gallery changes');
      }

      setInitialHero(heroItems);
      setInitialGallery(galleryItems);
      toast.success('Gallery & Showcase updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Error saving gallery');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setHeroItems(initialHero);
    setGalleryItems(initialGallery);
    toast.info('Discarded unsaved gallery changes');
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
              Gallery & Hero Showcase
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
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Anti-Overcrowding Notification Banner */}
        <div className="bg-[#fff9f2] border border-[#ffbd5b]/40 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-[#ff7b01] shrink-0 mt-0.5" />
          <div className="text-xs text-gray-700 leading-relaxed space-y-1">
            <p className="font-bold text-[#2e0249]">
              Fixed Slots & Automatic Storage Cleanup
            </p>
            <p>
              Each grid slot maintains the exact visual layout of the studio.
              Replacing an image automatically removes the old file from
              Supabase Storage under the{' '}
              <code className="font-mono font-bold text-[#ff7b01]">
                gallery/
              </code>{' '}
              prefix, ensuring no orphaned files accumulate.
            </p>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 border-b border-[#f0e8dc] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'gallery'
                ? 'bg-[#2e0249] text-white shadow-xs'
                : 'text-gray-600 hover:text-[#2e0249] hover:bg-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Main Gallery Grid (13 Slots)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'hero'
                ? 'bg-[#2e0249] text-white shadow-xs'
                : 'text-gray-600 hover:text-[#2e0249] hover:bg-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Hero Banner Showcase (6 Slots)</span>
          </button>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-3xl p-12 text-center text-gray-500 border border-[#f0e8dc]">
            <div className="inline-block w-8 h-8 border-3 border-[#ff7b01] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold">Loading Gallery Slots...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentList.map((item) => {
              const isUploadingThis = uploadingSlot === item.slot_number;
              return (
                <div
                  key={`${item.section}-${item.slot_number}`}
                  className="bg-white rounded-3xl p-5 border border-[#f0e8dc] shadow-xs space-y-4 hover:shadow-md transition-shadow"
                >
                  {/* Slot Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2e0249] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#ff7b01]" />
                      <span>Slot #{item.slot_number}</span>
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      {item.item_class}
                    </span>
                  </div>

                  {/* Thumbnail / Image Preview */}
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-gray-100 border border-[#f0e8dc] group">
                    <Image
                      src={item.image_url}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Hover Title Overlay preview */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-3 opacity-90 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-bold uppercase truncate">
                        {item.alt || 'No Title'}
                      </span>
                    </div>

                    {isUploadingThis && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xs font-bold gap-2">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Replacing image...</span>
                      </div>
                    )}
                  </div>

                  {/* Editable Hover Title / Alt */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#2e0249] uppercase tracking-wider mb-1">
                      Hover Title & Alt Text
                    </label>
                    <input
                      type="text"
                      value={item.alt}
                      onChange={(e) =>
                        handleAltChange(
                          item.section,
                          item.slot_number,
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 text-xs bg-[#faf7f2] rounded-xl border border-[#f0e8dc] focus:bg-white focus:ring-2 focus:ring-[#ff7b01] focus:outline-none"
                      placeholder="Title displayed on mouse hover"
                    />
                  </div>

                  {/* Upload Replacement Action */}
                  <div>
                    <label className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-[#ff7b01] bg-[#fff5eb] hover:bg-[#ffecd0] border border-[#ffbd5b]/40 rounded-xl cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Replace Slot Image</span>
                      <input
                        type="file"
                        accept="image/webp,image/png,image/jpeg"
                        onChange={(e) => handleFileSelect(e, item)}
                        disabled={isUploadingThis}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
