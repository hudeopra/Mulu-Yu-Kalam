import { User, Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { type Appointment, calculateRemainingBalance } from '@/lib/supabase';

interface AppointmentClientCardProps {
  appointment: Appointment;
}

export function AppointmentClientCard({
  appointment,
}: AppointmentClientCardProps) {
  // Clean phone number for WhatsApp wa.me link
  const phoneDigits = appointment.phone.replace(/[^0-9]/g, '');
  // If no country code, default to Nepal code 977 if 10 digits starting with 9
  const whatsappNumber =
    phoneDigits.length === 10 && phoneDigits.startsWith('9')
      ? `977${phoneDigits}`
      : phoneDigits;

  const remainingDue = calculateRemainingBalance(
    appointment.estimated_price,
    appointment.partial_payment_amount,
  );

  return (
    <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-200/80 space-y-4">
      {/* Header with Client Name and Quick Contact Actions */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#2e0249] text-white flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-[#2e0249] text-base leading-tight">
              {appointment.name}
            </h3>
          </div>
        </div>

        {/* Quick Communication Actions */}
        <div className="flex items-center gap-1.5">
          {whatsappNumber ? (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition-colors"
              title="Open WhatsApp chat"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          ) : null}
          <a
            href={`tel:${appointment.phone}`}
            className="p-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
            title="Call client"
          >
            <Phone className="w-3.5 h-3.5" />
          </a>
          <a
            href={`mailto:${appointment.email}`}
            className="p-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
            title="Email client"
          >
            <Mail className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Client Detail Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
            Email
          </p>
          <a
            href={`mailto:${appointment.email}`}
            className="text-[#2e0249] font-medium hover:text-[#ff7b01] flex items-center gap-1 truncate"
          >
            <Mail className="w-3 h-3 shrink-0 text-gray-400" />
            <span className="truncate">{appointment.email}</span>
          </a>
        </div>

        <div className="space-y-1">
          <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
            Phone
          </p>
          <a
            href={`tel:${appointment.phone}`}
            className="text-[#2e0249] font-medium hover:text-[#ff7b01] flex items-center gap-1"
          >
            <Phone className="w-3 h-3 shrink-0 text-gray-400" />
            <span>{appointment.phone}</span>
          </a>
        </div>

        <div className="space-y-1">
          <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
            Tattoo Location
          </p>
          <div className="flex items-center gap-1 text-[#2e0249] font-medium">
            <MapPin className="w-3 h-3 shrink-0 text-[#ff7b01]" />
            <span className="capitalize">{appointment.tattoo_location}</span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
            Requested Slot
          </p>
          <div className="flex items-center gap-1 text-[#2e0249] font-medium">
            <Clock className="w-3 h-3 shrink-0 text-[#ff7b01]" />
            <span>{appointment.appointment_time}</span>
          </div>
        </div>

        {/* Current Financial Status summary */}
        <div className="space-y-1 sm:col-span-2 pt-2 border-t border-gray-200">
          <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
            Payment & Deposit
          </p>
          {appointment.deposit_status === 'partial' ? (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-[#2e0249]">
                {appointment.estimated_price !== null &&
                appointment.estimated_price !== undefined
                  ? `NPR ${appointment.estimated_price.toLocaleString()}`
                  : 'No Quote'}
              </span>
              <span className="text-gray-300">&bull;</span>
              <span className="text-gray-600">
                Paid:{' '}
                <strong className="text-blue-700 font-semibold">
                  NPR{' '}
                  {(appointment.partial_payment_amount ?? 0).toLocaleString()}
                </strong>
              </span>
              <span className="text-gray-300">&bull;</span>
              <span className="text-gray-600">
                Due:{' '}
                <strong className="text-amber-600 font-bold">
                  NPR{' '}
                  {remainingDue !== null ? remainingDue.toLocaleString() : '—'}
                </strong>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full uppercase bg-blue-100 text-blue-800 border border-blue-200 ml-auto">
                Partial Deposit
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-[#2e0249]">
                {appointment.estimated_price !== null &&
                appointment.estimated_price !== undefined
                  ? `NPR ${appointment.estimated_price.toLocaleString()}`
                  : 'No Quote Yet'}
              </span>
              <span
                className={`inline-block text-[10px] font-bold px-2 py-0.2 rounded-full uppercase border ${
                  appointment.deposit_status === 'paid'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}
              >
                Deposit: {appointment.deposit_status}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Client Note / Concept */}
      {appointment.notes ? (
        <div className="pt-2 border-t border-gray-200">
          <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px] mb-1">
            Client Concept & Instructions:
          </p>
          <p className="text-xs text-gray-700 italic bg-white/70 p-2.5 rounded-xl border border-gray-200">
            &ldquo;{appointment.notes}&rdquo;
          </p>
        </div>
      ) : null}
    </div>
  );
}
