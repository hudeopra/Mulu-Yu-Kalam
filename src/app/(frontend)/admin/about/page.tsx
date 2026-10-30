'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Save,
  RotateCcw,
  Sparkles,
  BarChart3,
  BookmarkCheck,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  SiteAbout,
  AboutCounter,
  AboutNote,
  CounterColor,
  COUNTER_COLOR_MAP,
  DEFAULT_SITE_ABOUT,
} from '@/types/landing';
import { RichParagraphEditor } from '@/components/admin/RichParagraphEditor';

export default function AboutAdminPage() {
  const [data, setData] = useState<SiteAbout>(DEFAULT_SITE_ABOUT);
  const [initialData, setInitialData] = useState<SiteAbout>(DEFAULT_SITE_ABOUT);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Fetch current about data from API
  useEffect(() => {
    async function loadAbout() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/admin/landing/about');
        if (res.ok) {
          const json = await res.json();
          if (json?.about) {
            setData(json.about);
            setInitialData(json.about);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to fetch from backend, using defaults:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAbout();
  }, []);

  const isDirty = JSON.stringify(data) !== JSON.stringify(initialData);

  const handleCounterChange = (
    index: number,
    field: keyof AboutCounter,
    val: any,
  ) => {
    const updated = [...data.counters];
    updated[index] = { ...updated[index], [field]: val };
    setData({ ...data, counters: updated });
  };

  const handleNoteChange = (
    index: number,
    field: keyof AboutNote,
    val: string,
  ) => {
    const updated = [...data.notes];
    updated[index] = { ...updated[index], [field]: val };
    setData({ ...data, notes: updated });
  };

  const handleReset = () => {
    setData(initialData);
    toast.info('Changes reverted to saved state');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/landing/about', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to update about section');
      }

      setInitialData(data);
      toast.success('About section updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Error updating about section');
    } finally {
      setIsSaving(false);
    }
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
              About Section
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

      {/* Main Content Form */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {isLoading ? (
          <div className="bg-white rounded-3xl p-12 text-center text-gray-500 border border-[#f0e8dc]">
            <div className="inline-block w-8 h-8 border-3 border-[#ff7b01] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold">
              Loading About Section Content...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-8">
            {/* Card 1: Narrative Paragraphs */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f0e8dc] shadow-xs space-y-6">
              <div className="border-b border-[#f0e8dc] pb-4">
                <h2 className="text-base font-bold text-[#2e0249] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#ff7b01]" />
                  <span>Studio Narrative & Story</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Edit the primary text paragraphs displayed in the About
                  section. Use the toolbar buttons to emphasize keywords in bold
                  or studio colors.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2e0249] uppercase tracking-wider mb-1.5">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    value={data.title}
                    onChange={(e) =>
                      setData({ ...data, title: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-[#f0e8dc] focus:ring-2 focus:ring-[#ff7b01] focus:outline-none"
                    placeholder="About Mulu Yu Kalam"
                  />
                </div>

                <RichParagraphEditor
                  label="Paragraph 1 (Studio Introduction)"
                  value={data.paragraph_1}
                  onChange={(val) => setData({ ...data, paragraph_1: val })}
                  description="First welcoming paragraph highlighting the studio identity, location, and passion."
                />

                <RichParagraphEditor
                  label="Paragraph 2 (Services & Consultations)"
                  value={data.paragraph_2}
                  onChange={(val) => setData({ ...data, paragraph_2: val })}
                  description="Second paragraph detailing consultations, coverups, walk-ins, and aftercare."
                />
              </div>

              {/* Live Preview Box */}
              <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#f0e8dc] space-y-3">
                <span className="text-[11px] font-bold text-[#ff7b01] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Real-time Landing Preview</span>
                </span>
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed font-sans">
                  <div
                    dangerouslySetInnerHTML={{ __html: data.paragraph_1 }}
                    className="[&_span]:inline"
                  />
                  <div
                    dangerouslySetInnerHTML={{ __html: data.paragraph_2 }}
                    className="[&_span]:inline"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Statistics & Animated Counters */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f0e8dc] shadow-xs space-y-6">
              <div className="border-b border-[#f0e8dc] pb-4">
                <h2 className="text-base font-bold text-[#2e0249] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#ff7b01]" />
                  <span>Animated Milestone Counters</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Configure the 3 statistics counters shown alongside the
                  narrative. Numbers smoothly count up when scrolled into view.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.counters.map((counter, idx) => {
                  const colorConfig =
                    COUNTER_COLOR_MAP[counter.color] ||
                    COUNTER_COLOR_MAP.purple;
                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-[#f0e8dc] bg-[#faf7f2] space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2e0249] uppercase">
                          Counter #{idx + 1}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full border ${colorConfig.previewBadge}`}
                        >
                          {colorConfig.label}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">
                            Target Number
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={counter.target}
                            onChange={(e) =>
                              handleCounterChange(
                                idx,
                                'target',
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-full px-3 py-2 text-sm font-bold bg-white rounded-xl border border-[#f0e8dc] focus:ring-2 focus:ring-[#ff7b01] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">
                            Display Label
                          </label>
                          <input
                            type="text"
                            value={counter.label}
                            onChange={(e) =>
                              handleCounterChange(idx, 'label', e.target.value)
                            }
                            className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-[#f0e8dc] focus:ring-2 focus:ring-[#ff7b01] focus:outline-none"
                            placeholder="e.g. Years of Tattooing"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">
                            Color Theme
                          </label>
                          <select
                            value={counter.color}
                            onChange={(e) =>
                              handleCounterChange(
                                idx,
                                'color',
                                e.target.value as CounterColor,
                              )
                            }
                            className="w-full px-3 py-2 text-xs font-semibold bg-white rounded-xl border border-[#f0e8dc] focus:ring-2 focus:ring-[#ff7b01] focus:outline-none"
                          >
                            {(
                              Object.keys(COUNTER_COLOR_MAP) as CounterColor[]
                            ).map((c) => (
                              <option key={c} value={c}>
                                {COUNTER_COLOR_MAP[c].label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Visual Card Swatch */}
                      <div
                        className={`p-4 rounded-xl ${colorConfig.bg} text-center transition-all`}
                      >
                        <p
                          className={`text-3xl font-black ${colorConfig.text}`}
                        >
                          {counter.target}+
                        </p>
                        <p className="text-xs font-medium text-gray-700 mt-1">
                          {counter.label || 'Counter Label'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 3: Feature Notes (Limit 2) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f0e8dc] shadow-xs space-y-6">
              <div className="border-b border-[#f0e8dc] pb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#2e0249] flex items-center gap-2">
                    <BookmarkCheck className="w-4 h-4 text-[#ff7b01]" />
                    <span>Studio Highlights & Notes</span>
                  </h2>
                  <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    Fixed Limit: 2 Cards
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Two highlight callout cards rendered below the narrative text
                  (e.g. Custom Artwork and Hygiene Standards).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.notes.slice(0, 2).map((note, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-[#ffbd5b]/40 bg-[#ffecd0]/40 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#ff7b01]" />
                      <span className="text-xs font-bold text-[#2e0249] uppercase">
                        Highlight Card #{idx + 1}
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={note.title}
                        onChange={(e) =>
                          handleNoteChange(idx, 'title', e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm font-bold bg-white rounded-xl border border-[#f0e8dc] focus:ring-2 focus:ring-[#ff7b01] focus:outline-none"
                        placeholder="Card Title"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={note.content}
                        onChange={(e) =>
                          handleNoteChange(idx, 'content', e.target.value)
                        }
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#f0e8dc] focus:ring-2 focus:ring-[#ff7b01] focus:outline-none leading-relaxed"
                        placeholder="Card description..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
