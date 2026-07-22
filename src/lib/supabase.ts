import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables. Please check your .env file.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "canceled";
export type DepositStatus = "unpaid" | "paid" | "partial";

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
  notes: string | null;
  internal_notes: string | null;
  estimated_price: number | null;
  deposit_status: DepositStatus;
  status: AppointmentStatus;
}
