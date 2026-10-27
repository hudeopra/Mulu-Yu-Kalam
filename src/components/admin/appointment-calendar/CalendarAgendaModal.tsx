'use client';

import {
  X,
  Calendar,
  Clock,
  Phone,
  MessageCircle,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import {
  type Appointment,
  getAppointmentStatusBadge,
  calculateRemainingBalance,
} from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface CalendarAgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateString: string;
  appointments: Appointment[];
  onViewDetails: (appointment: Appointment) => void;
}

export function CalendarAgendaModal({
  isOpen,
  onClose,
  dateString,
  appointments,
  onViewDetails,
}: CalendarAgendaModalProps) {
  const dateObj = new Date(dateString);
  const formattedDate = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : dateString;

  // Sort chronologically by appointment_time
  const sortedAppointments = [...appointments].sort((a, b) => {
    return (a.appointment_time || '').localeCompare(b.appointment_time || '');
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-white rounded-3xl border border-black/10">
        {/* Header */}
        <DialogHeader className="p-5 sm:p-6 bg-gradient-to-r from-[#2e0249] to-[#3b075e] text-white">
          <div className="flex items-center gap-2 text-orange-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Day Schedule</span>
          </div>
          <DialogTitle className="text-xl font-extrabold text-white">
            {formattedDate}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-200">
            {sortedAppointments.length}{' '}
            {sortedAppointments.length === 1 ? 'appointment' : 'appointments'} scheduled for this day.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable list of appointments */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3 flex-1 bg-[#faf7f2]/50">
          {sortedAppointments.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-semibold text-gray-500">
                No appointments for this date
              </p>
            </div>
          ) : (
            sortedAppointments.map((app) => {
              const statusBadge = getAppointmentStatusBadge(app.status);
              const phoneDigits = app.phone ? app.phone.replace(/[^0-9]/g, '') : '';
              const whatsappNumber =
                phoneDigits.length === 10 && phoneDigits.startsWith('9')
                  ? `977${phoneDigits}`
                  : phoneDigits;

              return (
                <div
                  key={app.id}
                  onClick={() => {
                    onClose();
                    onViewDetails(app);
                  }}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:shadow-md hover:border-[#ff7b01]/30 transition-all cursor-pointer space-y-3 group"
                >
                  {/* Top row: Time, Name, Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 font-bold text-xs text-[#ff7b01] bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100">
                          <Clock className="w-3 h-3" />
                          <span>{app.appointment_time}</span>
                        </span>
                        <h4 className="font-bold text-sm text-[#2e0249] group-hover:text-[#ff7b01] transition-colors">
                          {app.name}
                        </h4>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusBadge}`}
                    >
                      {app.status}
                    </span>
                  </div>

                  {/* Placement & Pricing info */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-semibold text-[11px] capitalize border border-purple-100">
                      <MapPin className="w-3 h-3" />
                      {app.tattoo_location}
                    </span>

                    {app.estimated_price != null ? (
                      <span className="text-[11px] font-bold text-gray-700">
                        Quote: Rs. {app.estimated_price.toLocaleString()}
                      </span>
                    ) : null}

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        app.deposit_status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.deposit_status === 'partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      Deposit: {app.deposit_status}
                    </span>
                  </div>

                  {/* Notes snippet if present */}
                  {app.notes ? (
                    <p className="text-xs text-gray-500 line-clamp-1 italic bg-gray-50 p-2 rounded-lg">
                      &quot;{app.notes}&quot;
                    </p>
                  ) : null}

                  {/* Footer actions: WhatsApp, Call, View */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {whatsappNumber ? (
                        <a
                          href={`https://wa.me/${whatsappNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      ) : null}
                      {app.phone ? (
                        <a
                          href={`tel:${app.phone}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 hover:text-gray-900"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{app.phone}</span>
                        </a>
                      ) : null}
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ff7b01] group-hover:underline">
                      <span>View details</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

