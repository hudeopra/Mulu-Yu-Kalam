import type { BaseSyntheticEvent } from 'react';
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form';
import {
  Send,
  AlertCircle,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  ShieldAlert,
} from 'lucide-react';
import {
  type AppointmentFormData,
  tattooLocations,
} from '@/schemas/appointmentSchema';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  InputField,
  TextareaField,
  FileUploadField,
  SubmitBtn,
} from '@/components/shared/forms';
import type { RateLimitStatus } from '@/utils/rateLimiter';

export interface AppointmentFormFieldsProps {
  register: UseFormRegister<AppointmentFormData>;
  control: Control<AppointmentFormData>;
  errors: FieldErrors<AppointmentFormData>;
  isSubmitting: boolean;
  rateLimit: RateLimitStatus;
  submissionError: string | null;
  statusMessage: string;
  onSubmit: (e?: BaseSyntheticEvent) => Promise<void>;
}

export function AppointmentFormFields({
  register,
  control,
  errors,
  isSubmitting,
  rateLimit,
  submissionError,
  statusMessage,
  onSubmit,
}: AppointmentFormFieldsProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void onSubmit(e);
      }}
      noValidate
      className="space-y-8"
    >
      {/* Rate Limit Notice */}
      {!rateLimit.isAllowed && (
        <Alert className="rounded-2xl bg-amber-50 border-amber-300 text-amber-900 shadow-sm p-4">
          <ShieldAlert className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <AlertTitle className="font-bold text-sm text-amber-950">
              Daily Booking Limit Reached
            </AlertTitle>
            <AlertDescription className="text-xs text-amber-800 mt-1 leading-relaxed">
              You have reached the maximum of 3 bookings in 24 hours from this
              device. Your next booking slot unlocks in{' '}
              <strong className="text-amber-950 font-bold">
                {rateLimit.formattedResetTime}
              </strong>
              . For urgent inquiries, please contact us directly via WhatsApp or
              Phone.
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Submission Error Banner */}
      {submissionError && (
        <Alert
          variant="destructive"
          className="rounded-2xl bg-red-50 border-red-200 text-red-700 p-4"
        >
          <AlertCircle className="size-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <AlertTitle className="font-semibold text-xs text-red-800">
              Unable to complete appointment
            </AlertTitle>
            <AlertDescription className="text-xs text-red-600 mt-0.5">
              {submissionError}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Tattoo Location Selector */}
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-3">
          I want to have a tattoo on...
        </label>
        <Controller
          name="tattooLocation"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {tattooLocations.map((location) => {
                const isSelected = field.value === location;
                return (
                  <button
                    key={location}
                    type="button"
                    onClick={() => field.onChange(location)}
                    className={`px-6 py-2.5 rounded-xl border text-sm sm:text-base font-semibold transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-[#ff7b01] text-white border-[#ff7b01] shadow-md shadow-[#ff7b01]/30 scale-105'
                        : 'bg-transparent text-brand-primary border-[#ff7b01] hover:bg-[#ffecd0]'
                    }`}
                  >
                    {location}
                  </button>
                );
              })}
            </div>
          )}
        />
        {errors.tattooLocation?.message && (
          <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-1.5">
            <AlertCircle className="size-3.5" />
            <span>{errors.tattooLocation.message}</span>
          </p>
        )}
      </div>

      <div className="space-y-6">
        {/* Name Field */}
        <InputField
          icon={User}
          type="text"
          label="Your Name"
          placeholder="Your Name"
          {...register('name')}
          error={errors.name?.message}
        />

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InputField
            icon={Mail}
            type="email"
            label="Your Email"
            placeholder="Your Email"
            {...register('email')}
            error={errors.email?.message}
          />
          <InputField
            icon={Phone}
            type="tel"
            label="Your Phone No."
            placeholder="Your Phone No."
            {...register('number')}
            error={errors.number?.message}
          />
        </div>

        {/* Time & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InputField
            icon={Clock}
            type="time"
            label="Appointment Time"
            placeholder="Appointment Time"
            {...register('appointmentTime')}
            error={errors.appointmentTime?.message}
          />
          <InputField
            icon={Calendar}
            type="date"
            label="Appointment Date"
            placeholder="Appointment Date"
            min={new Date().toISOString().split('T')[0]}
            {...register('appointmentDate')}
            error={errors.appointmentDate?.message}
          />
        </div>

        {/* Reference Files Upload */}
        <Controller
          name="referenceFiles"
          control={control}
          render={({ field }) => {
            const fileError =
              errors.referenceFiles?.message ||
              (Array.isArray(errors.referenceFiles)
                ? (
                    errors.referenceFiles as Array<
                      { message?: string } | undefined
                    >
                  ).find((e) => e?.message)?.message
                : undefined);

            return (
              <FileUploadField
                value={field.value}
                onChange={field.onChange}
                error={fileError}
                maxFiles={5}
              />
            );
          }}
        />

        {/* Additional Notes */}
        <TextareaField
          label="Additional Information (Optional)"
          id="notes"
          {...register('notes')}
          rows={3}
          placeholder="Any extra details, design ideas, or size preferences (optional)..."
          error={errors.notes?.message}
        />
      </div>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <SubmitBtn
          disabled={isSubmitting || !rateLimit.isAllowed}
          isSubmitting={isSubmitting}
          loadingText="Processing..."
          icon={Send}
          size="lg"
          className="w-full sm:w-auto"
        >
          Book Appointment
        </SubmitBtn>

        {isSubmitting && statusMessage ? (
          <span className="text-xs sm:text-sm font-semibold text-brand-primary animate-pulse">
            {statusMessage}
          </span>
        ) : null}
      </div>
    </form>
  );
}
