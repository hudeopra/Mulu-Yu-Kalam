'use client';

import { useState } from 'react';
import { Clock } from 'lucide-react';
import { type Appointment } from '@/lib/supabase';
import { type CalendarDay } from './calendar-utils';

interface CalendarDayCellProps {
  day: CalendarDay;
  onSelectDay: (dateString: string) => void;
  onViewDetails: (appointment: Appointment) => void;
  onRescheduleAppointment?: (appointmentId: string, newDateString: string) => void;
}

function getStatusChipColor(status: string): { bg: string; text: string; dot: string; border: string } {
  switch (status) {
    case 'pending':
      return {
        bg: 'bg-amber-50 hover:bg-amber-100/80',
        text: 'text-amber-900',
        dot: 'bg-amber-500',
        border: 'border-amber-200',
      };
    case 'confirmed':
      return {
        bg: 'bg-emerald-50 hover:bg-emerald-100/80',
        text: 'text-emerald-900',
        dot: 'bg-emerald-500',
        border: 'border-emerald-200',
      };
    case 'completed':
      return {
        bg: 'bg-blue-50 hover:bg-blue-100/80',
        text: 'text-blue-900',
        dot: 'bg-blue-500',
        border: 'border-blue-200',
      };
    case 'canceled':
      return {
        bg: 'bg-rose-50 hover:bg-rose-100/80',
        text: 'text-rose-900',
        dot: 'bg-rose-400',
        border: 'border-rose-200',
      };
    default:
      return {
        bg: 'bg-gray-50 hover:bg-gray-100',
        text: 'text-gray-800',
        dot: 'bg-gray-400',
        border: 'border-gray-200',
      };
  }
}

export function CalendarDayCell({
  day,
  onSelectDay,
  onViewDetails,
  onRescheduleAppointment,
}: CalendarDayCellProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const MAX_VISIBLE_CHIPS = 2;
  const visibleAppointments = day.appointments.slice(0, MAX_VISIBLE_CHIPS);
  const overflowCount = day.appointments.length - MAX_VISIBLE_CHIPS;

  return (
    <div
      onDragOver={(e) => {
        if (!onRescheduleAppointment) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDragOver(false);
        }
      }}
      onDrop={(e) => {
        if (!onRescheduleAppointment) return;
        e.preventDefault();
        setIsDragOver(false);
        const appointmentId = e.dataTransfer.getData('text/plain');
        if (appointmentId) {
          onRescheduleAppointment(appointmentId, day.dateString);
        }
      }}
      onClick={() => onSelectDay(day.dateString)}
      className={`min-h-[125px] sm:min-h-[140px] p-2 sm:p-2.5 flex flex-col justify-between transition-all cursor-pointer select-none relative group ${
        day.isToday
          ? 'bg-orange-50/25 hover:bg-orange-50/40'
          : !day.isCurrentMonth
            ? 'bg-gray-50/60 hover:bg-gray-100/60 text-gray-300'
            : 'bg-white hover:bg-purple-50/20 text-gray-800'
      } ${
        isDragOver
          ? 'ring-2 ring-inset ring-[#ff7b01] bg-orange-100/40 scale-[0.99] z-10'
          : ''
      }`}
    >
      {/* Box Header: Date Number & Session Pill */}
      <div className="flex items-center justify-between mb-2">
        {day.isToday ? (
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-[#ff7b01] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
              {day.dayNumber}
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#ff7b01] hidden sm:inline">
              Today
            </span>
          </div>
        ) : (
          <span
            className={`text-sm font-extrabold transition-colors ${
              day.isCurrentMonth
                ? 'text-[#2e0249] group-hover:text-[#ff7b01]'
                : 'text-gray-300 font-normal'
            }`}
          >
            {day.dayNumber}
          </span>
        )}

        {day.appointments.length > 0 ? (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
            {day.appointments.length} {day.appointments.length === 1 ? 'session' : 'sessions'}
          </span>
        ) : null}
      </div>

      {/* Appointment Session Chips inside the Day Box */}
      <div className="space-y-1.5 flex-1 overflow-hidden">
        {visibleAppointments.map((app) => {
          const colors = getStatusChipColor(app.status);

          return (
            <div
              key={app.id}
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('text/plain', app.id);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(app);
              }}
              title={`${app.name} (${app.appointment_time}) - ${app.status} • ${app.tattoo_location}`}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-xl border text-[11px] font-medium transition-all truncate shadow-2xs ${colors.bg} ${colors.text} ${colors.border}`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />
              <span className="font-extrabold shrink-0 text-[#2e0249]">
                {app.appointment_time}
              </span>
              <span className="truncate">{app.name}</span>
            </div>
          );
        })}

        {overflowCount > 0 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectDay(day.dateString);
            }}
            className="w-full text-left px-1.5 py-0.5 text-[10px] font-bold text-[#ff7b01] hover:underline cursor-pointer"
          >
            +{overflowCount} more sessions...
          </button>
        ) : null}
      </div>
    </div>
  );
}
