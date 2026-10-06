import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://placeholder.supabase.co',
);

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.warn(
    'Notice: Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) are not set. Database features will run in offline mode.',
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'canceled';
export type DepositStatus = 'unpaid' | 'paid' | 'partial';

export interface Appointment {
  id: string;
  created_at: string;
  updated_at: string;
  tattoo_location: string;
  name: string;
  email: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  reference_image_url: string | null;
  reference_image_urls: string[] | null;
  notes: string | null;
  internal_notes: string | null;
  estimated_price: number | null;
  deposit_status: DepositStatus;
  status: AppointmentStatus;
}

/**
 * Extracts all reference image URLs for an appointment, prioritizing
 * the native text[] array (reference_image_urls) with fallback to reference_image_url.
 */
export function getAppointmentReferenceUrls(
  appointment?: {
    reference_image_url?: string | null;
    reference_image_urls?: string[] | null;
  } | null,
): string[] {
  if (!appointment) return [];

  // 1. Native PostgreSQL array
  if (
    Array.isArray(appointment.reference_image_urls) &&
    appointment.reference_image_urls.length > 0
  ) {
    return appointment.reference_image_urls.filter(
      (url): url is string => typeof url === 'string' && url.trim().length > 0,
    );
  }

  // 2. Single reference image fallback
  if (
    typeof appointment.reference_image_url === 'string' &&
    appointment.reference_image_url.trim().length > 0
  ) {
    return [appointment.reference_image_url.trim()];
  }

  return [];
}

/**
 * Extracts relative storage object path from a Supabase Storage public URL.
 * e.g., 'https://.../tattoo-references/1743673000-0-art.webp' -> '1743673000-0-art.webp'
 */
export function extractStoragePath(
  url: string,
  bucketName: string = 'tattoo-references',
): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const marker = `/${bucketName}/`;
  const index = trimmed.indexOf(marker);
  if (index !== -1) {
    const rawPath = trimmed.slice(index + marker.length).split('?')[0];
    return decodeURIComponent(rawPath);
  }

  // Relative path or direct filename
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return decodeURIComponent(trimmed.split('?')[0]);
  }

  // Fallback to filename in URL
  const lastSegment = trimmed.split('/').pop()?.split('?')[0];
  return lastSegment ? decodeURIComponent(lastSegment) : null;
}

/**
 * Deletes all reference image files belonging to an appointment from Supabase Storage bucket.
 */
export async function deleteAppointmentStorageImages(
  appointment?: {
    reference_image_url?: string | null;
    reference_image_urls?: string[] | null;
  } | null,
  bucketName: string = 'tattoo-references',
): Promise<void> {
  if (!appointment) return;

  const urls = getAppointmentReferenceUrls(appointment);
  if (urls.length === 0) return;

  const paths = urls
    .map((u) => extractStoragePath(u, bucketName))
    .filter((p): p is string => Boolean(p && p.length > 0));

  if (paths.length === 0) return;

  try {
    const { error } = await supabase.storage.from(bucketName).remove(paths);
    if (error) {
      console.warn(
        `[Supabase Storage] Failed to remove images from "${bucketName}":`,
        error.message,
      );
    }
  } catch (err) {
    console.warn('[Supabase Storage] Storage removal exception:', err);
  }
}
