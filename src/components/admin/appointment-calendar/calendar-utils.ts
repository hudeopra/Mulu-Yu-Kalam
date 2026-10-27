import { type Appointment } from '@/lib/supabase';

export interface CalendarDay {
  date: Date;
  dateString: string; // 'YYYY-MM-DD'
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointments: Appointment[];
}

/**
 * Normalizes an appointment date string to standard 'YYYY-MM-DD'.
 */
export function normalizeDateString(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  if (dateStr.length >= 10 && dateStr[4] === '-' && dateStr[7] === '-') {
    return dateStr.substring(0, 10);
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Formats a Date object to standard 'YYYY-MM-DD'.
 */
export function formatDateToKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Builds a strict 7-days-a-row calendar grid starting on SUNDAY.
 * Always produces complete 7-day rows (35 or 42 cells total)
 * matching actual calendar date and day placement.
 */
export function buildMonthGrid(
  year: number,
  month: number,
  appointmentsByDate: Record<string, Appointment[]>,
): CalendarDay[] {
  const todayKey = formatDateToKey(new Date());

  const firstDayOfMonth = new Date(year, month, 1);
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

  // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
  const startDayOfWeek = firstDayOfMonth.getDay();

  const days: CalendarDay[] = [];

  // 1. Previous month trailing days to fill Row 1 before Day 1
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNumber = totalDaysInPrevMonth - i;
    const date = new Date(year, month - 1, dayNumber);
    const dateString = formatDateToKey(date);
    days.push({
      date,
      dateString,
      dayNumber,
      isCurrentMonth: false,
      isToday: dateString === todayKey,
      appointments: appointmentsByDate[dateString] || [],
    });
  }

  // 2. Current month days (1 through totalDaysInMonth)
  for (let dayNumber = 1; dayNumber <= totalDaysInMonth; dayNumber++) {
    const date = new Date(year, month, dayNumber);
    const dateString = formatDateToKey(date);
    days.push({
      date,
      dateString,
      dayNumber,
      isCurrentMonth: true,
      isToday: dateString === todayKey,
      appointments: appointmentsByDate[dateString] || [],
    });
  }

  // 3. Next month leading days to complete the final 7-day week row
  const remainder = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remainder; i++) {
    const date = new Date(year, month + 1, i);
    const dateString = formatDateToKey(date);
    days.push({
      date,
      dateString,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: dateString === todayKey,
      appointments: appointmentsByDate[dateString] || [],
    });
  }

  // 4. If grid has only 35 days (5 rows) but month layout needs 6 rows to feel balanced,
  // or if total is under 35, pad another week of next month.
  if (days.length < 35) {
    const currentNextDay = days[days.length - 1].dayNumber;
    for (let i = 1; i <= 7; i++) {
      const date = new Date(year, month + 1, currentNextDay + i);
      const dateString = formatDateToKey(date);
      days.push({
        date,
        dateString,
        dayNumber: date.getDate(),
        isCurrentMonth: false,
        isToday: dateString === todayKey,
        appointments: appointmentsByDate[dateString] || [],
      });
    }
  }

  return days;
}
