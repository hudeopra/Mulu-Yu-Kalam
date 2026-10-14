'use client';

import type { BaseSyntheticEvent } from 'react';
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormWatch,
} from 'react-hook-form';
import { Calendar, Clock, DollarSign } from 'lucide-react';
import { calculateRemainingBalance } from '@/lib/supabase';
import {
  InputField,
  TextareaField,
  SelectField,
} from '@/components/shared/forms';
import {
  appointmentStatusValues,
  depositStatusValues,
  type AppointmentEditFormData,
} from '@/schemas';

export type { AppointmentEditFormData } from '@/schemas';

export interface AppointmentEditFormProps {
  register: UseFormRegister<AppointmentEditFormData>;
  control: Control<AppointmentEditFormData, any, any>;
  errors: FieldErrors<AppointmentEditFormData>;
  watch: UseFormWatch<AppointmentEditFormData>;
  onSubmit: (e?: BaseSyntheticEvent) => Promise<void> | void;
}

export function AppointmentEditForm({
  register,
  control,
  errors,
  watch,
  onSubmit,
}: AppointmentEditFormProps) {
  const depositStatus = watch('depositStatus');
  const estimatedPrice = watch('estimatedPrice');
  const partialPaymentAmount = watch('partialPaymentAmount');

  const estNum =
    estimatedPrice && !isNaN(Number(estimatedPrice))
      ? parseFloat(estimatedPrice)
      : null;
  const partNum =
    partialPaymentAmount && !isNaN(Number(partialPaymentAmount))
      ? parseFloat(partialPaymentAmount)
      : 0;
  const remainingDue = calculateRemainingBalance(estNum, partNum);

  return (
    <form
      id="appointment-edit-form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void onSubmit(e);
      }}
      noValidate
      className="space-y-6"
    >
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
        Studio Management & Workflow Controls
      </h4>

      {/* Status Toggle Buttons */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-800">
          Appointment Status
        </label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {appointmentStatusValues.map((st) => {
                const isSelected = field.value === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => field.onChange(st)}
                    className={`px-4 py-2 rounded-xl border text-xs font-bold capitalize transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-[#ff7b01] text-white border-[#ff7b01] shadow-md shadow-[#ff7b01]/30'
                        : 'bg-transparent text-brand-primary border-[#ffbd5b] hover:bg-[#ffecd0]'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          )}
        />
        {errors.status?.message && (
          <p className="text-xs font-semibold text-red-500 mt-1">
            {errors.status.message}
          </p>
        )}
      </div>

      {/* Rescheduling: Date & Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <InputField
          label="Appointment Date"
          id="edit-appointment-date"
          type="date"
          icon={Calendar}
          {...register('appointmentDate')}
          error={errors.appointmentDate?.message}
        />

        <InputField
          label="Appointment Time"
          id="edit-appointment-time"
          type="text"
          icon={Clock}
          placeholder="e.g. 11:00 AM"
          {...register('appointmentTime')}
          error={errors.appointmentTime?.message}
        />
      </div>

      {/* Financials: Estimated Price & Deposit Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <InputField
          label="Estimated Price (NPR)"
          id="edit-estimated-price"
          type="number"
          step="0.01"
          min="0"
          icon={DollarSign}
          placeholder="e.g. 5000"
          {...register('estimatedPrice')}
          error={errors.estimatedPrice?.message}
        />

        <Controller
          name="depositStatus"
          control={control}
          render={({ field }) => (
            <SelectField
              label="Deposit Status"
              id="edit-deposit-status"
              value={field.value}
              onValueChange={field.onChange}
              options={depositStatusValues.map((status) => ({
                value: status,
                label:
                  status === 'unpaid'
                    ? 'Unpaid'
                    : status === 'partial'
                      ? 'Partial Deposit'
                      : 'Fully Paid',
              }))}
              error={errors.depositStatus?.message}
            />
          )}
        />
      </div>

      {/* If depositStatus is partial, show partial deposit input and remaining balance */}
      {depositStatus === 'partial' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InputField
            label="Partial Deposit (NPR)"
            id="edit-partial-payment"
            type="number"
            step="0.01"
            min="0"
            icon={DollarSign}
            placeholder="e.g. 2000"
            {...register('partialPaymentAmount')}
            error={errors.partialPaymentAmount?.message}
          />

          <InputField
            label="Remaining Unpaid"
            id="edit-remaining-unpaid"
            type="text"
            icon={DollarSign}
            value={
              remainingDue !== null
                ? `NPR ${remainingDue.toLocaleString()}`
                : '—'
            }
            readOnly
            className="font-bold text-[#ff7b01] cursor-default select-all"
          />
        </div>
      )}

      {/* Internal Staff Notes */}
      <TextareaField
        label="Private Internal Notes (Staff only)"
        id="edit-internal-notes"
        rows={3}
        placeholder="e.g. Requires stencil resizing; custom color ink prepared; client has low pain tolerance..."
        {...register('internalNotes')}
        error={errors.internalNotes?.message}
      />
    </form>
  );
}
