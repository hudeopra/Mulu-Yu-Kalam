-- ==============================================================================
-- MULU YU KALAM: LANDING PAGE & SITE SETTINGS SCHEMA MIGRATION
-- Run this in your Supabase SQL Editor.
-- This script creates site_settings, site_about, and site_gallery tables,
-- configures RLS policies, and seeds all current default static content.
-- ==============================================================================

-- 1. Create site_settings table (Global Studio & Branding Assets)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  logo_url text NOT NULL DEFAULT '/assets/img/Mulu-Yu-Kalam.svg',
  favicon_url text NOT NULL DEFAULT '/assets/img/unalome-favicon.png',
  banner_image_url text NOT NULL DEFAULT '/assets/img/banner-bg.jpg',
  email text NOT NULL DEFAULT 'contact@muluyukalam.com.np',
  phone text NOT NULL DEFAULT '+977 9861-341995',
  address text NOT NULL DEFAULT 'Harisiddhi, LMC-29, Lalitpur',
  maps_url text NOT NULL DEFAULT 'https://maps.app.goo.gl/HW5GvBYDiaNLx4rK6',
  copyright_text text NOT NULL DEFAULT 'Copyright © {year} Mulu Yu Kalam. All rights reserved.',
  whatsapp_url text NOT NULL DEFAULT 'https://wa.me/9779861341995/',
  instagram_url text NOT NULL DEFAULT 'https://www.instagram.com/mulu_yu_kalam/',
  facebook_url text NOT NULL DEFAULT 'https://www.facebook.com/MuluYuKalam',
  tiktok_url text NOT NULL DEFAULT 'https://www.tiktok.com/@mulu_yu_kalam',
  updated_at timestamptz DEFAULT now()
);

-- Seed site_settings default record (id = 1)
INSERT INTO public.site_settings (
  id,
  logo_url,
  favicon_url,
  banner_image_url,
  email,
  phone,
  address,
  maps_url,
  copyright_text,
  whatsapp_url,
  instagram_url,
  facebook_url,
  tiktok_url
)
VALUES (
  1,
  '/assets/img/Mulu-Yu-Kalam.svg',
  '/assets/img/unalome-favicon.png',
  '/assets/img/banner-bg.jpg',
  'contact@muluyukalam.com.np',
  '+977 9861-341995',
  'Harisiddhi, LMC-29, Lalitpur',
  'https://maps.app.goo.gl/HW5GvBYDiaNLx4rK6',
  'Copyright © {year} Mulu Yu Kalam. All rights reserved.',
  'https://wa.me/9779861341995/',
  'https://www.instagram.com/mulu_yu_kalam/',
  'https://www.facebook.com/MuluYuKalam',
  'https://www.tiktok.com/@mulu_yu_kalam'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Create site_about table (About Narrative, Counters & Highlights)
CREATE TABLE IF NOT EXISTS public.site_about (
  id integer PRIMARY KEY DEFAULT 1,
  title text NOT NULL DEFAULT 'About Mulu Yu Kalam',
  paragraph_1 text NOT NULL,
  paragraph_2 text NOT NULL,
  counters jsonb NOT NULL,
  notes jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Seed site_about default record (id = 1)
INSERT INTO public.site_about (
  id,
  title,
  paragraph_1,
  paragraph_2,
  counters,
  notes
)
VALUES (
  1,
  'About Mulu Yu Kalam',
  'Welcome to <span class="font-bold text-[#2e0249]">Mulu Yu Kalam</span>—Lalitpur''s premier custom tattoo studio nestled in Harisiddhi, Nepal. Driven by a genuine passion for authentic body art, creative ink illustration, and personal storytelling, our studio transforms your thoughts, stories, and heritage into permanent, breathtaking custom tattoo artwork crafted with anatomical precision.',
  'Whether you are looking for your very first tattoo, seeking an intricate custom design, requesting a tattoo coverup, or finishing an existing piece, our experienced tattoo artists in Harisiddhi provide free design consultations, walk-in visits, and comprehensive healing aftercare to make your tattoo experience unforgettable.',
  '[
    {"target": 7, "label": "Years of Tattooing", "color": "purple"},
    {"target": 250, "label": "Successful Tattoos", "color": "blue"},
    {"target": 148, "label": "Customers Served", "color": "orange"}
  ]'::jsonb,
  '[
    {
      "title": "Custom Tattoo Artwork & Design",
      "content": "Specializing in fine line tattoos, micro-realism, illustrative ink, sacred Nepalese mandala patterns, and complete sleeve compositions tailored to your vision."
    },
    {
      "title": "Sterile Hygiene & Safety Standards",
      "content": "Your health and safety come first. We strictly use 100% single-use disposable needle cartridges, medical autoclave sterilization, and premium certified vegan inks."
    }
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 3. Create site_gallery table (Hero Showcase & Main Bento Grid Slots)
CREATE TABLE IF NOT EXISTS public.site_gallery (
  id serial PRIMARY KEY,
  section text NOT NULL CHECK (section IN ('hero', 'gallery')),
  slot_number integer NOT NULL,
  item_class text NOT NULL,
  image_url text NOT NULL,
  storage_path text,
  alt text NOT NULL,
  display_order integer NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (section, slot_number)
);

-- Seed Hero Showcase Slots (6 Items)
INSERT INTO public.site_gallery (section, slot_number, item_class, image_url, storage_path, alt, display_order)
VALUES
  ('hero', 1, 'hero-tattoo-item-1', '/assets/img/tattoo-1.webp', NULL, 'Tattoo Showcase 1', 1),
  ('hero', 2, 'hero-tattoo-item-2', '/assets/img/tattoo-2.webp', NULL, 'Tattoo Showcase 2', 2),
  ('hero', 3, 'hero-tattoo-item-3', '/assets/img/tattoo-3.webp', NULL, 'Tattoo Showcase 3', 3),
  ('hero', 4, 'hero-tattoo-item-4', '/assets/img/tattoo-4.webp', NULL, 'Tattoo Showcase 4', 4),
  ('hero', 5, 'hero-tattoo-item-5', '/assets/img/tattoo-5.webp', NULL, 'Tattoo Showcase 5', 5),
  ('hero', 6, 'hero-tattoo-item-6', '/assets/img/tattoo-6.webp', NULL, 'Tattoo Showcase 6', 6)
ON CONFLICT (section, slot_number) DO NOTHING;

-- Seed Main Gallery Grid Slots (13 Items - note slot 10 is the static header banner card)
INSERT INTO public.site_gallery (section, slot_number, item_class, image_url, storage_path, alt, display_order)
VALUES
  ('gallery', 1, 'gallery-item-1', '/assets/img/tattoo-1.webp', NULL, 'Tattoo Artwork 1', 1),
  ('gallery', 2, 'gallery-item-2', '/assets/img/gallery.jpg', NULL, 'Tattoo Artwork 2', 2),
  ('gallery', 3, 'gallery-item-3', '/assets/img/tattoo-2.webp', NULL, 'Tattoo Artwork 3', 3),
  ('gallery', 4, 'gallery-item-4', '/assets/img/tattoo-3.webp', NULL, 'Tattoo Artwork 4', 4),
  ('gallery', 5, 'gallery-item-5', '/assets/img/tattoo-4.webp', NULL, 'Tattoo Artwork 5', 5),
  ('gallery', 6, 'gallery-item-6', '/assets/img/gallery.jpg', NULL, 'Tattoo Artwork 6', 6),
  ('gallery', 7, 'gallery-item-7', '/assets/img/tattoo-5.webp', NULL, 'Tattoo Artwork 7', 7),
  ('gallery', 8, 'gallery-item-8', '/assets/img/gallery.jpg', NULL, 'Tattoo Artwork 8', 8),
  ('gallery', 9, 'gallery-item-9', '/assets/img/tattoo-6.webp', NULL, 'Tattoo Artwork 9', 9),
  ('gallery', 11, 'gallery-item-11', '/assets/img/gallery.jpg', NULL, 'Tattoo Artwork 11', 10),
  ('gallery', 12, 'gallery-item-12', '/assets/img/tattoo-2.webp', NULL, 'Tattoo Artwork 12', 11),
  ('gallery', 13, 'gallery-item-13', '/assets/img/tattoo-1.webp', NULL, 'Tattoo Artwork 13', 12),
  ('gallery', 14, 'gallery-item-14', '/assets/img/gallery.jpg', NULL, 'Tattoo Artwork 14', 13)
ON CONFLICT (section, slot_number) DO NOTHING;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_about ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_gallery ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: Allow Read and Write Access (matching studio operations model)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
  DROP POLICY IF EXISTS "Authenticated users can update site settings" ON public.site_settings;
  DROP POLICY IF EXISTS "Allow all access for site_settings" ON public.site_settings;
  CREATE POLICY "Allow all access for site_settings" ON public.site_settings
    FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_object THEN null; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can view site about" ON public.site_about;
  DROP POLICY IF EXISTS "Authenticated users can update site about" ON public.site_about;
  DROP POLICY IF EXISTS "Allow all access for site_about" ON public.site_about;
  CREATE POLICY "Allow all access for site_about" ON public.site_about
    FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_object THEN null; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can view site gallery" ON public.site_gallery;
  DROP POLICY IF EXISTS "Authenticated users can update site gallery" ON public.site_gallery;
  DROP POLICY IF EXISTS "Allow all access for site_gallery" ON public.site_gallery;
  CREATE POLICY "Allow all access for site_gallery" ON public.site_gallery
    FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_object THEN null; END $$;

