'use client';

import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Search,
  RefreshCw,
} from 'lucide-react';
import { type Appointment } from '@/lib/supabase';
import {
  buildMonthGrid,
  normalizeDateString,
  type CalendarDay,
} from './calendar-utils';
import { CalendarDayCell } from './CalendarDayCell';
import { CalendarAgendaModal } from './CalendarAgendaModal';

export interface AppointmentCalendarViewProps {
  data: Appointment[];
  isLoading: boolean;
  onRefresh: () => void;
  onViewDetails: (appointment: Appointment) => void;
  onRescheduleAppointment?: (appointmentId: string, newDateString: string) => void;
}

// 7 days in a row starting on SUNDAY
const WEEKDAYS = [
  { short: 'Sun', full: 'Sunday' },
  { short: 'Mon', full: 'Monday' },
  { short: 'Tue', full: 'Tuesday' },
  { short: 'Wed', full: 'Wednesday' },
  { short: 'Thu', full: 'Thursday' },
  { short: 'Fri', full: 'Friday' },
  { short: 'Sat', full: 'Saturday' },
];

export function AppointmentCalendarView({
  data,
  isLoading,
  onRefresh,
  onViewDetails,
  onRescheduleAppointment,
}: AppointmentCalendarViewProps) {
  // Current month viewing cursor
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDayString, setSelectedDayString] = useState<string | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  // Filter active appointments by search query
  const filteredAppointments = useMemo(() => {
    const active = data.filter((app) => app.status !== 'suspended');
    if (!searchQuery.trim()) return active;

    const q = searchQuery.toLowerCase().trim();
    return active.filter((app) => {
      const nameMatch = app.name?.toLowerCase().includes(q) ?? false;
      const emailMatch = app.email?.toLowerCase().includes(q) ?? false;
      const phoneMatch = app.phone?.toLowerCase().includes(q) ?? false;
      const locationMatch = app.tattoo_location?.toLowerCase().includes(q) ?? false;
      return nameMatch || emailMatch || phoneMatch || locationMatch;
    });
  }, [data, searchQuery]);

  // Group filtered appointments by 'YYYY-MM-DD'
  const appointmentsByDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};

    filteredAppointments.forEach((app) => {
      const key = normalizeDateString(app.appointment_date);
      if (!key) return;
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(app);
    });

    // Sort items chronologically within each day
    Object.keys(map).forEach((dateKey) => {
      map[dateKey].sort((a, b) =>
        (a.appointment_time || '').localeCompare(b.appointment_time || ''),
      );
    });

    return map;
  }, [filteredAppointments]);

  // Build the strict 7-days-a-row calendar grid starting on Sunday
  const monthGrid: CalendarDay[] = useMemo(() => {
    return buildMonthGrid(currentYear, currentMonth, appointmentsByDate);
  }, [currentYear, currentMonth, appointmentsByDate]);

  // Formatted header string: e.g. "October 2026"
  const formattedMonthHeader = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, {
      month: 'long',
      year: 'numeric',
    }).format(currentDate);
  }, [currentDate]);

  const selectedDayAppointments = useMemo(() => {
    if (!selectedDayString) return [];
    return appointmentsByDate[selectedDayString] || [];
  }, [selectedDayString, appointmentsByDate]);

  return (
    <div className="space-y-4">
      {/* Calendar Top Toolbar: Search, Month Navigator, Refresh */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-black/5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Global Search Box */}
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search schedule by client, placement, phone..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-9 py-2 text-xs text-[#2e0249] focus:outline-none focus:ring-2 focus:ring-[#ff7b01]/30 focus:border-[#ff7b01] placeholder:text-gray-400 transition-all"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                Clear
              </button>
            ) : null}
          </div>

          {/* Month Navigator Controls */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                title="Previous month"
                className="p-1.5 rounded-lg hover:bg-white text-gray-600 hover:text-[#2e0249] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-extrabold text-xs text-[#2e0249] px-3 min-w-[130px] text-center">
                {formattedMonthHeader}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                title="Next month"
                className="p-1.5 rounded-lg hover:bg-white text-gray-600 hover:text-[#2e0249] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleGoToToday}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 hover:bg-gray-50 text-[#2e0249] transition-colors cursor-pointer"
            >
              Today
            </button>

            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh bookings"
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#ff7b01]' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Status Legend Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Legend:
            </span>
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[11px] font-medium">Pending Review</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-medium">Confirmed</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[11px] font-medium">Completed</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-[11px] font-medium">Canceled</span>
            </div>
          </div>

          <div className="text-[11px] text-gray-400 italic">
            Tip: Week starts Sunday. Drag sessions across date boxes to reschedule.
          </div>
        </div>
      </div>

      {/* Actual Boxed Calendar: 7 Columns with full borders */}
      <div className="overflow-x-auto pb-3">
        <div className="min-w-[780px] bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
          {/* Weekday Column Headers: Starts Sunday, 7 across */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/90 divide-x divide-gray-200 text-center">
            {WEEKDAYS.map((day, idx) => (
              <div
                key={day.short}
                className={`py-3 px-2 text-xs font-extrabold uppercase tracking-wider ${
                  idx === 0
                    ? 'text-rose-600 bg-rose-50/30'
                    : 'text-[#2e0249]'
                }`}
              >
                <span className="hidden sm:inline">{day.full}</span>
                <span className="sm:hidden">{day.short}</span>
              </div>
            ))}
          </div>

          {/* 7-Column Day Boxes Grid with divide-x divide-y for full rectangular boxes */}
          <div className="grid grid-cols-7 divide-x divide-y divide-gray-200 bg-white">
            {monthGrid.map((day) => (
              <CalendarDayCell
                key={day.dateString}
                day={day}
                onSelectDay={(dateStr) => setSelectedDayString(dateStr)}
                onViewDetails={onViewDetails}
                onRescheduleAppointment={onRescheduleAppointment}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Selected Day Agenda Modal */}
      {selectedDayString ? (
        <CalendarAgendaModal
          isOpen={Boolean(selectedDayString)}
          onClose={() => setSelectedDayString(null)}
          dateString={selectedDayString}
          appointments={selectedDayAppointments}
          onViewDetails={onViewDetails}
        />
      ) : null}
    </div>
  );
}
