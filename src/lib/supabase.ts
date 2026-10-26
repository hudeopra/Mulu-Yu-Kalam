import { createBrowserClient } from '@supabase/ssr';

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

export const supabase = createBrowserClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
);

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'canceled'
  | 'suspended';
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
  reference_image_urls: string[] | null;
  notes: string | null;
  internal_notes: string | null;
  estimated_price: number | null;
  deposit_status: DepositStatus;
  partial_payment_amount: number | null;
  status: AppointmentStatus;
}

/**
 * Calculates remaining unpaid amount from estimated price and partial payment amount.
 * Returns null if estimated price is not set.
 */
export function calculateRemainingBalance(
  estimatedPrice: number | null | undefined,
  partialPaymentAmount: number | null | undefined,
): number | null {
  if (estimatedPrice === null || estimatedPrice === undefined) return null;
  const partial = partialPaymentAmount ?? 0;
  return Math.max(0, estimatedPrice - partial);
}

/**
 * Structure of active appointment category metrics.
 */
export interface AppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  canceled: number;
}

/**
 * Computes category counts in a single O(N) pass, strictly excluding suspended appointments.
 */
export function computeAppointmentStats(
  appointments: Appointment[],
): AppointmentStats {
  const stats: AppointmentStats = {
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    canceled: 0,
  };

  for (let i = 0; i < appointments.length; i++) {
    const app = appointments[i];
    if (app.status === 'suspended') continue;

    stats.total++;
    switch (app.status) {
      case 'pending':
        stats.pending++;
        break;
      case 'confirmed':
        stats.confirmed++;
        break;
      case 'completed':
        stats.completed++;
        break;
      case 'canceled':
        stats.canceled++;
        break;
    }
  }

  return stats;
}

/**
 * Returns Tailwind badge styling classes based on appointment status.
 */
export function getAppointmentStatusBadge(
  status: AppointmentStatus | string,
): string {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'confirmed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'canceled':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'suspended':
      return 'bg-gray-100 text-gray-500 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

// Re-export storage service utilities for backwards compatibility
export {
  getAppointmentReferenceUrls,
  extractStoragePath,
  uploadReferenceFiles,
  removeStorageFiles,
  deleteAppointmentStorageImages,
  suspendAppointmentStorageImages,
} from '@/services/storage';
