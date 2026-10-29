import { supabase } from '@/lib/supabase';
import {
  SiteSettings,
  SiteAbout,
  SiteGalleryItem,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_SITE_ABOUT,
  DEFAULT_HERO_ITEMS,
  DEFAULT_GALLERY_ITEMS,
} from '@/types/landing';

export const SETTINGS_TABLE = 'site_settings';
export const ABOUT_TABLE = 'site_about';
export const GALLERY_TABLE = 'site_gallery';

export const landingService = {
  /**
   * Fetches singleton website settings, falling back to DEFAULT_SITE_SETTINGS if not found or table doesn't exist yet.
   */
  async getSettings(): Promise<SiteSettings> {
    try {
      const { data, error } = await supabase
        .from(SETTINGS_TABLE)
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error || !data) {
        return DEFAULT_SITE_SETTINGS;
      }

      return {
        ...DEFAULT_SITE_SETTINGS,
        ...data,
      };
    } catch {
      return DEFAULT_SITE_SETTINGS;
    }
  },

  /**
   * Updates or upserts singleton website settings.
   */
  async updateSettings(payload: Partial<SiteSettings>): Promise<SiteSettings> {
    const { data, error } = await supabase
      .from(SETTINGS_TABLE)
      .upsert({
        id: 1,
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update website settings: ${error.message}`);
    }

    return data as SiteSettings;
  },

  /**
   * Fetches singleton about section data, falling back to DEFAULT_SITE_ABOUT.
   */
  async getAbout(): Promise<SiteAbout> {
    try {
      const { data, error } = await supabase
        .from(ABOUT_TABLE)
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error || !data) {
        return DEFAULT_SITE_ABOUT;
      }

      return {
        ...DEFAULT_SITE_ABOUT,
        ...data,
      };
    } catch {
      return DEFAULT_SITE_ABOUT;
    }
  },

  /**
   * Updates or upserts singleton about section data.
   */
  async updateAbout(payload: Partial<SiteAbout>): Promise<SiteAbout> {
    const { data, error } = await supabase
      .from(ABOUT_TABLE)
      .upsert({
        id: 1,
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update about section: ${error.message}`);
    }

    return data as SiteAbout;
  },

  /**
   * Fetches all hero showcase and main gallery items, falling back to default arrays.
   */
  async getGallery(): Promise<{
    hero: SiteGalleryItem[];
    gallery: SiteGalleryItem[];
  }> {
    try {
      const { data, error } = await supabase
        .from(GALLERY_TABLE)
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return {
          hero: DEFAULT_HERO_ITEMS,
          gallery: DEFAULT_GALLERY_ITEMS,
        };
      }

      const hero = (data as SiteGalleryItem[]).filter(
        (item) => item.section === 'hero',
      );
      const gallery = (data as SiteGalleryItem[]).filter(
        (item) => item.section === 'gallery',
      );

      return {
        hero: hero.length > 0 ? hero : DEFAULT_HERO_ITEMS,
        gallery: gallery.length > 0 ? gallery : DEFAULT_GALLERY_ITEMS,
      };
    } catch {
      return {
        hero: DEFAULT_HERO_ITEMS,
        gallery: DEFAULT_GALLERY_ITEMS,
      };
    }
  },

  /**
   * Upserts all hero and gallery slot items.
   */
  async updateGallery(
    hero: SiteGalleryItem[],
    gallery: SiteGalleryItem[],
  ): Promise<void> {
    const allItems = [...hero, ...gallery].map((item) => ({
      ...item,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from(GALLERY_TABLE)
      .upsert(allItems, { onConflict: 'section,slot_number' });

    if (error) {
      throw new Error(`Failed to update gallery items: ${error.message}`);
    }
  },
};

