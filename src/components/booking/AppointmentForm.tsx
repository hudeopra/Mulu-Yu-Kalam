'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  appointmentSchema,
  type AppointmentFormData,
} from '@/schemas/appointmentSchema';
import { isSupabaseConfigured, type Appointment } from '@/lib/supabase';
import {
  appointmentsService,
  uploadReferenceFiles,
  removeStorageFiles,
} from '@/services';
import {
  checkRateLimit,
  recordSubmission,
  type RateLimitStatus,
} from '@/utils/rateLimiter';
import { FormResponse } from './FormResponse';
import { AppointmentFormFields } from './AppointmentFormFields';

export { FormResponse } from './FormResponse';
export { AppointmentFormFields } from './AppointmentFormFields';

export function AppointmentForm() {
  const [createdAppointment, setCreatedAppointment] =
    useState<Appointment | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [rateLimit, setRateLimit] = useState<RateLimitStatus>(checkRateLimit());

  useEffect(() => {
    // Recheck rate limit on mount
    setRateLimit(checkRateLimit());
  }, []);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      tattooLocation: 'Arm',
      name: '',
      email: '',
      number: '',
      appointmentTime: '',
      appointmentDate: '',
      referenceFiles: [],
      notes: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data: AppointmentFormData) => {
    setSubmissionError(null);

    if (!isSupabaseConfigured) {
      setSubmissionError(
        'Studio booking system is currently running in offline preview mode. Please contact us directly via Phone or WhatsApp to confirm your appointment.',
      );
      return;
    }

    // 1. Validate data & rate limits
    const currentLimit = checkRateLimit();
    if (!currentLimit.isAllowed) {
      setRateLimit(currentLimit);
      setSubmissionError(
        `Submission limit reached (3 bookings per 24 hours). Next booking slot frees up in ${currentLimit.formattedResetTime}. Please contact us via phone or WhatsApp for direct assistance.`,
      );
      return;
    }

    // Keep track of uploaded storage paths for atomic rollback
    let uploadedStoragePaths: string[] = [];
    let uploadedImageUrls: string[] = [];

    try {
      // 2. Upload images on submit, then retrieve public URLs
      const filesToUpload = data.referenceFiles || [];

      if (filesToUpload.length > 0) {
        setStatusMessage(
          `Uploading ${filesToUpload.length} reference ${
            filesToUpload.length === 1 ? 'design' : 'designs'
          } to studio storage...`,
        );

        const uploadResult = await uploadReferenceFiles(filesToUpload);
        uploadedStoragePaths = uploadResult.storagePaths;
        uploadedImageUrls = uploadResult.publicUrls;
      }

      // 3. Add table row with input information and image URLs
      setStatusMessage('Booking your session in studio database...');

      const record = await appointmentsService.createAppointment({
        tattooLocation: data.tattooLocation,
        name: data.name,
        email: data.email,
        phone: data.number,
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
        referenceImageUrls: uploadedImageUrls,
        notes: data.notes || null,
      });

      // 4. Success: Record submission in rate limiter & present confirmation view immediately!
      recordSubmission();
      setRateLimit(checkRateLimit());
      setCreatedAppointment(record);

      // 5. Fire-and-forget email dispatch in background (won't hold up UX or button loading state)
      fetch('/api/send-appointment-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        keepalive: true,
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          number: data.number,
          tattooLocation: data.tattooLocation,
          appointmentDate: data.appointmentDate,
          appointmentTime: data.appointmentTime,
          notes: data.notes || '',
          referenceImageUrls: uploadedImageUrls,
        }),
      })
        .then((res) => res.json().catch(() => ({})))
        .then((result) => {
          console.log('[AppointmentForm] Background email dispatch finished:', result);
        })
        .catch((emailErr) => {
          console.warn('[AppointmentForm] Background email dispatch error:', emailErr);
        });
    } catch (err: unknown) {
      console.error('Submission error:', err);

      // ATOMIC ROLLBACK: If ANY upload failed or DB insertion failed, delete all uploaded files
      if (uploadedStoragePaths.length > 0) {
        await removeStorageFiles(uploadedStoragePaths);
      }

      const message =
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.';
      setSubmissionError(message);
    } finally {
      setStatusMessage('');
    }
  };

  const handleBookAnother = () => {
    setCreatedAppointment(null);
    setSubmissionError(null);
    setRateLimit(checkRateLimit());
    reset();
  };

  return (
    <div className="bg-[#f2f2f2] rounded-3xl p-6 sm:p-10 shadow-xl border border-black/5">
      {createdAppointment ? (
        <FormResponse
          appointment={createdAppointment}
          onBookAnother={handleBookAnother}
        />
      ) : (
        <AppointmentFormFields
          register={register}
          control={control}
          errors={errors}
          isSubmitting={isSubmitting}
          rateLimit={rateLimit}
          submissionError={submissionError}
          statusMessage={statusMessage}
          onSubmit={handleSubmit(onSubmit, (invalidErrors) => {
            console.warn('Booking form validation failed:', invalidErrors);
          })}
        />
      )}
    </div>
  );
}
