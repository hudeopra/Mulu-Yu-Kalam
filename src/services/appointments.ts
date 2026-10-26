import {
  supabase,
  type Appointment,
  type AppointmentStatus,
  type DepositStatus,
} from '@/lib/supabase';
import {
  suspendAppointmentStorageImages,
  extractStoragePath,
  removeStorageFiles,
  getAppointmentReferenceUrls,
} from './storage';

/**
 * Database table name for tattoo appointments in Supabase.
 */
export const APPOINTMENTS_TABLE = 'tattoo_appointments';

export interface CreateAppointmentInput {
  tattooLocation: string;
  name: string;
  email: string;
  phone: string;
  appointmentDate: string;
  appointmentTime: string;
  referenceImageUrls?: string[] | null;
  notes?: string | null;
}

export interface UpdateAppointmentInput {
  status?: AppointmentStatus;
  deposit_status?: DepositStatus;
  appointment_date?: string;
  appointment_time?: string;
  estimated_price?: number | null;
  partial_payment_amount?: number | null;
  internal_notes?: string | null;
  reference_image_urls?: string[] | null;
}

/**
 * Service providing typed, centralized data access for Appointment operations.
 */
export const appointmentsService = {
  /**
   * Fetches all active appointments (excluding soft-deleted / suspended records),
   * ordered by appointment_date in descending order.
   */
  async getActiveAppointments(): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from(APPOINTMENTS_TABLE)
      .select('*')
      .neq('status', 'suspended')
      .order('appointment_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch appointments: ${error.message}`);
    }

    return (data as Appointment[]) || [];
  },

  /**
   * Updates only the appointment status (used by table quick actions).
   */
  async updateAppointmentStatus(
    id: string,
    status: AppointmentStatus,
  ): Promise<Appointment> {
    const { data, error } = await supabase
      .from(APPOINTMENTS_TABLE)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Could not update appointment status: ${error.message}`);
    }

    return data as Appointment;
  },

  /**
   * Updates appointment fields (date, time, status, pricing, internal notes).
   */
  async updateAppointment(
    id: string,
    payload: UpdateAppointmentInput,
  ): Promise<Appointment> {
    const { data, error } = await supabase
      .from(APPOINTMENTS_TABLE)
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update appointment: ${error.message}`);
    }

    return data as Appointment;
  },

  /**
   * Inserts a new appointment booking submitted by a client.
   */
  async createAppointment(
    input: CreateAppointmentInput,
  ): Promise<Appointment> {
    const { data, error } = await supabase
      .from(APPOINTMENTS_TABLE)
      .insert({
        tattoo_location: input.tattooLocation,
        name: input.name,
        email: input.email,
        phone: input.phone,
        appointment_date: input.appointmentDate,
        appointment_time: input.appointmentTime,
        reference_image_urls:
          input.referenceImageUrls && input.referenceImageUrls.length > 0
            ? input.referenceImageUrls
            : null,
        notes: input.notes || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to record appointment: ${error.message}`);
    }

    return data as Appointment;
  },

  /**
   * Soft-deletes an appointment by renaming its storage artwork with "suspended-"
   * and updating the appointment status to 'suspended'.
   */
  async suspendAppointment(appointment: Appointment): Promise<Appointment> {
    // 1. Rename associated reference images with "suspended-" prefix in Supabase Storage
    const suspendedUrls = await suspendAppointmentStorageImages(appointment);

    // 2. Soft-delete database record by updating status to 'suspended'
    const { data, error } = await supabase
      .from(APPOINTMENTS_TABLE)
      .update({
        status: 'suspended',
        reference_image_urls:
          suspendedUrls.length > 0
            ? suspendedUrls
            : appointment.reference_image_urls,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointment.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to suspend appointment: ${error.message}`);
    }

    return data as Appointment;
  },

  /**
   * Deletes a specific reference image from storage and removes its URL from the database.
   */
  async deleteAppointmentArtwork(
    appointment: Appointment,
    targetImageUrl: string,
  ): Promise<Appointment> {
    // 1. Remove file from Supabase Storage
    const storagePath = extractStoragePath(targetImageUrl);
    if (storagePath) {
      await removeStorageFiles([storagePath]);
    }

    // 2. Update remaining URLs in PostgreSQL
    const currentUrls = getAppointmentReferenceUrls(appointment);
    const remainingUrls = currentUrls.filter((url) => url !== targetImageUrl);

    const { data, error } = await supabase
      .from(APPOINTMENTS_TABLE)
      .update({
        reference_image_urls: remainingUrls.length > 0 ? remainingUrls : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointment.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update artwork in database: ${error.message}`);
    }

    return data as Appointment;
  },
};

