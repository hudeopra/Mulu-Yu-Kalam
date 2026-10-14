'use client';

import type { FormEvent } from 'react';
import { Calendar, Clock, DollarSign } from 'lucide-react';
import {
  type AppointmentStatus,
  type DepositStatus,
  calculateRemainingBalance,
} from '@/lib/supabase';
import { InputField, SelectField, TextareaField } from '@/components/ui';

interface AppointmentEditFormProps {
  status: AppointmentStatus;
  setStatus: (status: AppointmentStatus) => void;
  depositStatus: DepositStatus;
  setDepositStatus: (status: DepositStatus) => void;
  appointmentDate: string;
  setAppointmentDate: (date: string) => void;
  appointmentTime: string;
  setAppointmentTime: (time: string) => void;
  estimatedPrice: string;
  setEstimatedPrice: (price: string) => void;
  partialPaymentAmount: string;
  setPartialPaymentAmount: (amount: string) => void;
  internalNotes: string;
  setInternalNotes: (notes: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export function AppointmentEditForm({
  status,
  setStatus,
  depositStatus,
  setDepositStatus,
  appointmentDate,
  setAppointmentDate,
  appointmentTime,
  setAppointmentTime,
  estimatedPrice,
  setEstimatedPrice,
  partialPaymentAmount,
  setPartialPaymentAmount,
  internalNotes,
  setInternalNotes,
  onSubmit,
}: AppointmentEditFormProps) {
  const estNum =
    estimatedPrice.trim() === '' || isNaN(Number(estimatedPrice))
      ? null
      : parseFloat(estimatedPrice);
  const partNum =
    partialPaymentAmount.trim() === '' || isNaN(Number(partialPaymentAmount))
      ? 0
      : parseFloat(partialPaymentAmount);
  const remainingDue = calculateRemainingBalance(estNum, partNum);

  return (
    <form
      id="appointment-edit-form"
      onSubmit={onSubmit}
      className="space-y-5"
    >
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
        Studio Management & Workflow Controls
      </h4>

      {/* Status Toggle Buttons */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-700">
          Appointment Status
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(
            [
              'pending',
              'confirmed',
              'completed',
              'canceled',
            ] as AppointmentStatus[]
          ).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatus(st)}
              className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border cursor-pointer ${
                status === st
                  ? st === 'confirmed'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : st === 'completed'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : st === 'canceled'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Rescheduling: Date & Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          floatingLabel={false}
          type="date"
          label="Appointment Date"
          labelClassName="block text-xs font-semibold text-gray-700 mb-1.5"
          containerClassName="space-y-0"
          value={appointmentDate}
          onChange={(e) => setAppointmentDate(e.target.value)}
          required
          icon={
            <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
          }
          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-xs text-[#2e0249] focus:outline-none focus:ring-2 focus:ring-[#ff7b01]/30 focus:border-[#ff7b01]"
        />

        <InputField
          floatingLabel={false}
          type="text"
          label="Appointment Time"
          labelClassName="block text-xs font-semibold text-gray-700 mb-1.5"
          containerClassName="space-y-0"
          value={appointmentTime}
          onChange={(e) => setAppointmentTime(e.target.value)}
          placeholder="e.g. 11:00 AM"
          required
          icon={
            <Clock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
          }
          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-xs text-[#2e0249] focus:outline-none focus:ring-2 focus:ring-[#ff7b01]/30 focus:border-[#ff7b01]"
        />
      </div>

      {/* Financials: Estimated Price & Deposit Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          floatingLabel={false}
          type="number"
          step="0.01"
          min="0"
          label="Estimated Price (NPR)"
          labelClassName="block text-xs font-semibold text-gray-700 mb-1.5"
          containerClassName="space-y-0"
          value={estimatedPrice}
          onChange={(e) => setEstimatedPrice(e.target.value)}
          placeholder="e.g. 5000"
          icon={
            <DollarSign className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
          }
          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-xs text-[#2e0249] focus:outline-none focus:ring-2 focus:ring-[#ff7b01]/30 focus:border-[#ff7b01]"
        />

        <SelectField
          label="Deposit Status"
          labelClassName="block text-xs font-semibold text-gray-700 mb-1.5"
          containerClassName="space-y-0"
          value={depositStatus}
          onChange={(e) => setDepositStatus(e.target.value as DepositStatus)}
          options={[
            { value: 'unpaid', label: 'Unpaid' },
            { value: 'partial', label: 'Partial Deposit' },
            { value: 'paid', label: 'Fully Paid' },
          ]}
          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#2e0249] focus:outline-none focus:ring-2 focus:ring-[#ff7b01]/30 focus:border-[#ff7b01]"
        />
      </div>

      {/* If depositStatus is partial, show partial deposit input and remaining balance */}
      {depositStatus === 'partial' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            floatingLabel={false}
            type="number"
            step="0.01"
            min="0"
            label="Partial Deposit (NPR)"
            labelClassName="block text-xs font-semibold text-gray-700 mb-1.5"
            containerClassName="space-y-0"
            value={partialPaymentAmount}
            onChange={(e) => setPartialPaymentAmount(e.target.value)}
            placeholder="e.g. 2000"
            icon={
              <DollarSign className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
            }
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-xs text-[#2e0249] focus:outline-none focus:ring-2 focus:ring-[#ff7b01]/30 focus:border-[#ff7b01]"
          />

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Remaining Unpaid
            </label>
            <div className="w-full bg-amber-50/60 border border-amber-200/80 rounded-xl px-3 py-2 text-xs font-bold text-amber-700 flex items-center h-[37px]">
              {remainingDue !== null
                ? `NPR ${remainingDue.toLocaleString()}`
                : '—'}
            </div>
          </div>
        </div>
      )}

      {/* Internal Staff Notes */}
      <TextareaField
        rows={3}
        label="Private Internal Notes (Staff only)"
        labelClassName="block text-xs font-semibold text-gray-700 mb-1.5"
        containerClassName="space-y-0"
        value={internalNotes}
        onChange={(e) => setInternalNotes(e.target.value)}
        placeholder="e.g. Requires stencil resizing; custom color ink prepared; client has low pain tolerance..."
        className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-[#2e0249] focus:outline-none focus:ring-2 focus:ring-[#ff7b01]/30 focus:border-[#ff7b01] resize-none"
      />
    </form>
  );
}

