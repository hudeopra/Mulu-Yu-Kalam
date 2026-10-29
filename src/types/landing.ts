export type CounterColor = 'purple' | 'blue' | 'orange' | 'gold' | 'green';

export interface AboutCounter {
  target: number;
  label: string;
  color: CounterColor;
}

export interface AboutNote {
  title: string;
  content: string;
}

export interface SiteAbout {
  id?: number;
  title: string;
  paragraph_1: string;
  paragraph_2: string;
  counters: AboutCounter[];
  notes: AboutNote[];
  updated_at?: string;
}

export interface SiteSettings {
  id?: number;
  logo_url: string;
  favicon_url: string;
  banner_image_url: string;
  email: string;
  phone: string;
  address: string;
  maps_url: string;
  copyright_text: string;
  whatsapp_url: string;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  updated_at?: string;
}

export interface SiteGalleryItem {
  id?: number;
  section: 'hero' | 'gallery';
  slot_number: number;
  item_class: string;
  image_url: string;
  storage_path: string | null;
  alt: string;
  display_order: number;
  updated_at?: string;
}

export const COUNTER_COLOR_MAP: Record<
  CounterColor,
  { text: string; bg: string; label: string; previewBadge: string }
> = {
  purple: {
    text: 'text-[#8d00ff]',
    bg: 'bg-[#f0ddff]',
    label: 'Studio Purple',
    previewBadge: 'bg-[#f0ddff] text-[#8d00ff] border-[#8d00ff]/30',
  },
  blue: {
    text: 'text-[#0067a5]',
    bg: 'bg-[#c3e9ff]',
    label: 'Ocean Blue',
    previewBadge: 'bg-[#c3e9ff] text-[#0067a5] border-[#0067a5]/30',
  },
  orange: {
    text: 'text-[#ff7b01]',
    bg: 'bg-[#ffecd0]',
    label: 'Signature Flame',
    previewBadge: 'bg-[#ffecd0] text-[#ff7b01] border-[#ff7b01]/30',
  },
  gold: {
    text: 'text-[#d97706]',
    bg: 'bg-[#fef3c7]',
    label: 'Warm Gold',
    previewBadge: 'bg-[#fef3c7] text-[#d97706] border-[#d97706]/30',
  },
  green: {
    text: 'text-[#059669]',
    bg: 'bg-[#d1fae5]',
    label: 'Healing Green',
    previewBadge: 'bg-[#d1fae5] text-[#059669] border-[#059669]/30',
  },
};

export const DEFAULT_SITE_ABOUT: SiteAbout = {
  title: 'About Mulu Yu Kalam',
  paragraph_1:
    'Welcome to <span class="font-bold text-[#2e0249]">Mulu Yu Kalam</span>—Lalitpur\'s premier custom tattoo studio nestled in Harisiddhi, Nepal. Driven by a genuine passion for authentic body art, creative ink illustration, and personal storytelling, our studio transforms your thoughts, stories, and heritage into permanent, breathtaking custom tattoo artwork crafted with anatomical precision.',
  paragraph_2:
    'Whether you are looking for your very first tattoo, seeking an intricate custom design, requesting a tattoo coverup, or finishing an existing piece, our experienced tattoo artists in Harisiddhi provide free design consultations, walk-in visits, and comprehensive healing aftercare to make your tattoo experience unforgettable.',
  counters: [
    { target: 7, label: 'Years of Tattooing', color: 'purple' },
    { target: 250, label: 'Successful Tattoos', color: 'blue' },
    { target: 148, label: 'Customers Served', color: 'orange' },
  ],
  notes: [
    {
      title: 'Custom Tattoo Artwork & Design',
      content:
        'Specializing in fine line tattoos, micro-realism, illustrative ink, sacred Nepalese mandala patterns, and complete sleeve compositions tailored to your vision.',
    },
    {
      title: 'Sterile Hygiene & Safety Standards',
      content:
        'Your health and safety come first. We strictly use 100% single-use disposable needle cartridges, medical autoclave sterilization, and premium certified vegan inks.',
    },
  ],
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  logo_url: '/assets/img/Mulu-Yu-Kalam.svg',
  favicon_url: '/assets/img/unalome-favicon.png',
  banner_image_url: '/assets/img/banner-bg.jpg',
  email: 'contact@muluyukalam.com.np',
  phone: '+977 9861-341995',
  address: 'Harisiddhi, LMC-29, Lalitpur',
  maps_url: 'https://maps.app.goo.gl/HW5GvBYDiaNLx4rK6',
  copyright_text:
    'Copyright © {year} Mulu Yu Kalam. All rights reserved.',
  whatsapp_url: 'https://wa.me/9779861341995/',
  instagram_url: 'https://www.instagram.com/mulu_yu_kalam/',
  facebook_url: 'https://www.facebook.com/MuluYuKalam',
  tiktok_url: 'https://www.tiktok.com/@mulu_yu_kalam',
};

export const DEFAULT_HERO_ITEMS: SiteGalleryItem[] = [
  {
    section: 'hero',
    slot_number: 1,
    item_class: 'hero-tattoo-item-1',
    image_url: '/assets/img/tattoo-1.webp',
    storage_path: null,
    alt: 'Tattoo Showcase 1',
    display_order: 1,
  },
  {
    section: 'hero',
    slot_number: 2,
    item_class: 'hero-tattoo-item-2',
    image_url: '/assets/img/tattoo-2.webp',
    storage_path: null,
    alt: 'Tattoo Showcase 2',
    display_order: 2,
  },
  {
    section: 'hero',
    slot_number: 3,
    item_class: 'hero-tattoo-item-3',
    image_url: '/assets/img/tattoo-3.webp',
    storage_path: null,
    alt: 'Tattoo Showcase 3',
    display_order: 3,
  },
  {
    section: 'hero',
    slot_number: 4,
    item_class: 'hero-tattoo-item-4',
    image_url: '/assets/img/tattoo-4.webp',
    storage_path: null,
    alt: 'Tattoo Showcase 4',
    display_order: 4,
  },
  {
    section: 'hero',
    slot_number: 5,
    item_class: 'hero-tattoo-item-5',
    image_url: '/assets/img/tattoo-5.webp',
    storage_path: null,
    alt: 'Tattoo Showcase 5',
    display_order: 5,
  },
  {
    section: 'hero',
    slot_number: 6,
    item_class: 'hero-tattoo-item-6',
    image_url: '/assets/img/tattoo-6.webp',
    storage_path: null,
    alt: 'Tattoo Showcase 6',
    display_order: 6,
  },
];

export const DEFAULT_GALLERY_ITEMS: SiteGalleryItem[] = [
  {
    section: 'gallery',
    slot_number: 1,
    item_class: 'gallery-item-1',
    image_url: '/assets/img/tattoo-1.webp',
    storage_path: null,
    alt: 'Tattoo Artwork 1',
    display_order: 1,
  },
  {
    section: 'gallery',
    slot_number: 2,
    item_class: 'gallery-item-2',
    image_url: '/assets/img/gallery.jpg',
    storage_path: null,
    alt: 'Tattoo Artwork 2',
    display_order: 2,
  },
  {
    section: 'gallery',
    slot_number: 3,
    item_class: 'gallery-item-3',
    image_url: '/assets/img/tattoo-2.webp',
    storage_path: null,
    alt: 'Tattoo Artwork 3',
    display_order: 3,
  },
  {
    section: 'gallery',
    slot_number: 4,
    item_class: 'gallery-item-4',
    image_url: '/assets/img/tattoo-3.webp',
    storage_path: null,
    alt: 'Tattoo Artwork 4',
    display_order: 4,
  },
  {
    section: 'gallery',
    slot_number: 5,
    item_class: 'gallery-item-5',
    image_url: '/assets/img/tattoo-4.webp',
    storage_path: null,
    alt: 'Tattoo Artwork 5',
    display_order: 5,
  },
  {
    section: 'gallery',
    slot_number: 6,
    item_class: 'gallery-item-6',
    image_url: '/assets/img/gallery.jpg',
    storage_path: null,
    alt: 'Tattoo Artwork 6',
    display_order: 6,
  },
  {
    section: 'gallery',
    slot_number: 7,
    item_class: 'gallery-item-7',
    image_url: '/assets/img/tattoo-5.webp',
    storage_path: null,
    alt: 'Tattoo Artwork 7',
    display_order: 7,
  },
  {
    section: 'gallery',
    slot_number: 8,
    item_class: 'gallery-item-8',
    image_url: '/assets/img/gallery.jpg',
    storage_path: null,
    alt: 'Tattoo Artwork 8',
    display_order: 8,
  },
  {
    section: 'gallery',
    slot_number: 9,
    item_class: 'gallery-item-9',
    image_url: '/assets/img/tattoo-6.webp',
    storage_path: null,
    alt: 'Tattoo Artwork 9',
    display_order: 9,
  },
  {
    section: 'gallery',
    slot_number: 11,
    item_class: 'gallery-item-11',
    image_url: '/assets/img/gallery.jpg',
    storage_path: null,
    alt: 'Tattoo Artwork 11',
    display_order: 10,
  },
  {
    section: 'gallery',
    slot_number: 12,
    item_class: 'gallery-item-12',
    image_url: '/assets/img/tattoo-2.webp',
    storage_path: null,
    alt: 'Tattoo Artwork 12',
    display_order: 11,
  },
  {
    section: 'gallery',
    slot_number: 13,
    item_class: 'gallery-item-13',
    image_url: '/assets/img/tattoo-1.webp',
    storage_path: null,
    alt: 'Tattoo Artwork 13',
    display_order: 12,
  },
  {
    section: 'gallery',
    slot_number: 14,
    item_class: 'gallery-item-14',
    image_url: '/assets/img/gallery.jpg',
    storage_path: null,
    alt: 'Tattoo Artwork 14',
    display_order: 13,
  },
];

