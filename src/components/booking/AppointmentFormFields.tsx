'use client';

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
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import {
  type AppointmentFormData,
  tattooLocations,
} from '@/schemas/appointmentSchema';
import { FileUpload } from './FileUpload';
import { InputField, TextareaField } from '@/components/ui';
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

export function RateLimitBanner({ rateLimit }: { rateLimit: RateLimitStatus }) {
  if (rateLimit.isAllowed) return null;

  return (
    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-sm flex items-start gap-3 shadow-sm">
      <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-bold">Daily Booking Limit Reached</p>
        <p className="text-xs text-amber-800 mt-1 leading-relaxed">
          You have reached the maximum of 3 bookings in 24 hours from this
          device. Your next booking slot unlocks in{' '}
          <strong className="text-amber-950 font-bold">
            {rateLimit.formattedResetTime}
          </strong>
          . For urgent inquiries, please contact us directly via WhatsApp or
          Phone.
        </p>
      </div>
    </div>
  );
}

export function SubmissionErrorBanner({ message }: { message: string }) {
  return (
    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold">Unable to complete appointment</p>
        <p className="text-xs text-red-600 mt-0.5">{message}</p>
      </div>
    </div>
  );
}

export function TattooLocationSelector({
  control,
  error,
}: {
  control: Control<AppointmentFormData>;
  error?: string;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-base font-semibold text-gray-800">
        I wanna have tattoo in...
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
      {error ? (
        <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function CustomerInfoFields({
  register,
  errors,
}: {
  register: UseFormRegister<AppointmentFormData>;
  errors: FieldErrors<AppointmentFormData>;
}) {
  return (
    <>
      {/* Name Input */}
      <InputField
        type="text"
        placeholder="Your Name"
        register={register('name')}
        icon={<User className="absolute left-0 top-3 w-5 h-5 text-[#ffbd5b] pointer-events-none" />}
        className={`w-full bg-transparent pl-8 pr-3 py-2.5 border-b-2 text-[#2e0249] placeholder-[#ffbd5b] transition-colors focus:outline-none ${
          errors.name
            ? 'border-red-500 focus:border-red-600'
            : 'border-[#ffbd5b] focus:border-[#ff7b01]'
        }`}
        error={errors.name}
      />

      {/* Email & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <InputField
          type="email"
          placeholder="Your Email"
          register={register('email')}
          icon={<Mail className="absolute left-0 top-3 w-5 h-5 text-[#ffbd5b] pointer-events-none" />}
          className={`w-full bg-transparent pl-8 pr-3 py-2.5 border-b-2 text-[#2e0249] placeholder-[#ffbd5b] transition-colors focus:outline-none ${
            errors.email
              ? 'border-red-500 focus:border-red-600'
              : 'border-[#ffbd5b] focus:border-[#ff7b01]'
          }`}
          error={errors.email}
        />

        <InputField
          type="tel"
          placeholder="Your Phone No."
          register={register('number')}
          icon={<Phone className="absolute left-0 top-3 w-5 h-5 text-[#ffbd5b] pointer-events-none" />}
          className={`w-full bg-transparent pl-8 pr-3 py-2.5 border-b-2 text-[#2e0249] placeholder-[#ffbd5b] transition-colors focus:outline-none ${
            errors.number
              ? 'border-red-500 focus:border-red-600'
              : 'border-[#ffbd5b] focus:border-[#ff7b01]'
          }`}
          error={errors.number}
        />
      </div>
    </>
  );
}

export function AppointmentDateTimeFields({
  register,
  errors,
}: {
  register: UseFormRegister<AppointmentFormData>;
  errors: FieldErrors<AppointmentFormData>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <InputField
        type="time"
        register={register('appointmentTime')}
        onClick={(e) => {
          try {
            e.currentTarget.showPicker?.();
          } catch {}
        }}
        icon={<Clock className="absolute left-0 top-3 w-5 h-5 text-[#ffbd5b] pointer-events-none" />}
        className={`w-full bg-transparent pl-8 pr-3 py-2.5 border-b-2 text-[#2e0249] transition-colors focus:outline-none cursor-pointer [color-scheme:light] ${
          errors.appointmentTime
            ? 'border-red-500 focus:border-red-600'
            : 'border-[#ffbd5b] focus:border-[#ff7b01]'
        }`}
        error={errors.appointmentTime}
      />

      <InputField
        type="date"
        min={new Date().toISOString().split('T')[0]}
        register={register('appointmentDate')}
        onClick={(e) => {
          try {
            e.currentTarget.showPicker?.();
          } catch {}
        }}
        icon={<Calendar className="absolute left-0 top-3 w-5 h-5 text-[#ffbd5b] pointer-events-none" />}
        className={`w-full bg-transparent pl-8 pr-3 py-2.5 border-b-2 text-[#2e0249] transition-colors focus:outline-none cursor-pointer [color-scheme:light] ${
          errors.appointmentDate
            ? 'border-red-500 focus:border-red-600'
            : 'border-[#ffbd5b] focus:border-[#ff7b01]'
        }`}
        error={errors.appointmentDate}
      />
    </div>
  );
}

export function FormSubmitButton({
  isSubmitting,
  isDisabled,
  statusMessage,
}: {
  isSubmitting: boolean;
  isDisabled: boolean;
  statusMessage?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <button
        type="submit"
        disabled={isSubmitting || isDisabled}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-[#ff7b01] text-white font-bold text-base shadow-lg shadow-[#ff7b01]/30 hover:bg-[#e66f00] active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>Book Appointment</span>
          </>
        )}
      </button>

      {isSubmitting && statusMessage ? (
        <span className="text-xs sm:text-sm font-semibold text-brand-primary animate-pulse">
          {statusMessage}
        </span>
      ) : null}
    </div>
  );
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
      <RateLimitBanner rateLimit={rateLimit} />
      {submissionError ? (
        <SubmissionErrorBanner message={submissionError} />
      ) : null}

      <TattooLocationSelector
        control={control}
        error={errors.tattooLocation?.message}
      />

      <div className="space-y-6">
        <CustomerInfoFields register={register} errors={errors} />
        <AppointmentDateTimeFields register={register} errors={errors} />

        <Controller
          name="referenceFiles"
          control={control}
          render={({ field }) => (
            <FileUpload
              value={field.value}
              onChange={field.onChange}
              error={errors.referenceFiles?.message}
              maxFiles={5}
            />
          )}
        />

        <TextareaField
          register={register('notes')}
          placeholder="Any extra details, design ideas, or size preferences (optional)..."
          rows={3}
          className="w-full bg-white/70 border-2 border-[#ffbd5b] rounded-2xl p-4 text-[#2e0249] placeholder-[#ffbd5b] focus:outline-none focus:border-[#ff7b01] transition-colors resize-none text-sm"
          error={errors.notes}
        />
      </div>

      <FormSubmitButton
        isSubmitting={isSubmitting}
        isDisabled={!rateLimit.isAllowed}
        statusMessage={statusMessage}
      />
    </form>
  );
}
