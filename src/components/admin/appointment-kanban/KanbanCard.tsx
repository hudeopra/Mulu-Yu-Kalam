'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Phone,
  Clock,
  Calendar,
  MapPin,
  MessageCircle,
  GripVertical,
  ImageIcon,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
} from 'lucide-react';
import {
  type Appointment,
  type AppointmentStatus,
  getAppointmentReferenceUrls,
  calculateRemainingBalance,
} from '@/lib/supabase';

interface KanbanCardProps {
  appointment: Appointment;
  isFirst: boolean;
  isLast: boolean;
  onViewDetails: (appointment: Appointment) => void;
  onQuickStatusChange: (id: string, newStatus: AppointmentStatus) => void;
  onDropOnCard: (
    draggedId: string,
    targetId: string,
    position: 'before' | 'after',
  ) => void;
  onMoveCardRelative?: (
    appointmentId: string,
    direction: 'up' | 'down' | 'top' | 'bottom',
  ) => void;
}

export function KanbanCard({
  appointment,
  isFirst,
  isLast,
  onViewDetails,
  onQuickStatusChange,
  onDropOnCard,
  onMoveCardRelative,
}: KanbanCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dropIndicator, setDropIndicator] = useState<'before' | 'after' | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  // Reference images
  const imageUrls = getAppointmentReferenceUrls(appointment);
  const hasImages = imageUrls.length > 0;

  // WhatsApp link preparation
  const phoneDigits = appointment.phone ? appointment.phone.replace(/[^0-9]/g, '') : '';
  const whatsappNumber =
    phoneDigits.length === 10 && phoneDigits.startsWith('9')
      ? `977${phoneDigits}`
      : phoneDigits;

  // Date formatting
  const dateObj = new Date(appointment.appointment_date);
  const formattedDate = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : appointment.appointment_date;

  const remainingBalance = calculateRemainingBalance(
    appointment.estimated_price,
    appointment.partial_payment_amount,
  );

  return (
    <div
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        e.dataTransfer.setData('text/plain', appointment.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragEnd={() => {
        setIsDragging(false);
        setDropIndicator(null);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        const rect = e.currentTarget.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        const position = offsetY < rect.height / 2 ? 'before' : 'after';
        setDropIndicator(position);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setDropIndicator(null);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const pos = dropIndicator || 'after';
        setDropIndicator(null);
        const draggedId = e.dataTransfer.getData('text/plain');
        if (draggedId && draggedId !== appointment.id) {
          onDropOnCard(draggedId, appointment.id, pos);
        }
      }}
      onClick={() => onViewDetails(appointment)}
      className={`group relative bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:shadow-md transition-all cursor-pointer select-none ${
        isDragging
          ? 'opacity-30 scale-95 ring-2 ring-[#ff7b01]'
          : 'hover:-translate-y-0.5'
      }`}
    >
      {/* Drop indicator lines */}
      {dropIndicator === 'before' ? (
        <div className="absolute -top-1.5 left-2 right-2 h-1 bg-[#ff7b01] rounded-full z-20 shadow-xs pointer-events-none" />
      ) : null}
      {dropIndicator === 'after' ? (
        <div className="absolute -bottom-1.5 left-2 right-2 h-1 bg-[#ff7b01] rounded-full z-20 shadow-xs pointer-events-none" />
      ) : null}

      {/* Top Header: Client Name, Grip Handle, & Options Menu */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <GripVertical className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 shrink-0 cursor-grab active:cursor-grabbing" />
          <h4 className="font-bold text-sm text-[#2e0249] group-hover:text-[#ff7b01] transition-colors truncate">
            {appointment.name}
          </h4>
        </div>

        {/* Card Actions Menu */}
        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setShowMenu((prev) => !prev)}
            title="Card options & placement"
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {showMenu ? (
            <div
              className="absolute right-0 top-6 z-30 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 text-xs divide-y divide-gray-100"
              onMouseLeave={() => setShowMenu(false)}
            >
              {/* Position Ordering Section */}
              <div className="py-1">
                <div className="px-2.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Reorder Position
                </div>
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={() => {
                    setShowMenu(false);
                    onMoveCardRelative?.(appointment.id, 'top');
                  }}
                  className="w-full text-left px-2.5 py-1.5 flex items-center gap-2 hover:bg-purple-50 text-gray-700 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                >
                  <ChevronsUp className="w-3.5 h-3.5 text-gray-400" />
                  <span>Move to Top</span>
                </button>
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={() => {
                    setShowMenu(false);
                    onMoveCardRelative?.(appointment.id, 'up');
                  }}
                  className="w-full text-left px-2.5 py-1.5 flex items-center gap-2 hover:bg-purple-50 text-gray-700 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5 text-gray-400" />
                  <span>Move Up</span>
                </button>
                <button
                  type="button"
                  disabled={isLast}
                  onClick={() => {
                    setShowMenu(false);
                    onMoveCardRelative?.(appointment.id, 'down');
                  }}
                  className="w-full text-left px-2.5 py-1.5 flex items-center gap-2 hover:bg-purple-50 text-gray-700 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5 text-gray-400" />
                  <span>Move Down</span>
                </button>
                <button
                  type="button"
                  disabled={isLast}
                  onClick={() => {
                    setShowMenu(false);
                    onMoveCardRelative?.(appointment.id, 'bottom');
                  }}
                  className="w-full text-left px-2.5 py-1.5 flex items-center gap-2 hover:bg-purple-50 text-gray-700 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                >
                  <ChevronsDown className="w-3.5 h-3.5 text-gray-400" />
                  <span>Move to Bottom</span>
                </button>
              </div>

              {/* Status Section */}
              <div className="py-1">
                <div className="px-2.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Move to Column
                </div>
                {(
                  [
                    { id: 'pending', label: 'Pending Review' },
                    { id: 'confirmed', label: 'Confirmed' },
                    { id: 'completed', label: 'Completed' },
                    { id: 'canceled', label: 'Canceled' },
                  ] as const
                ).map((target) => (
                  <button
                    key={target.id}
                    type="button"
                    disabled={appointment.status === target.id}
                    onClick={() => {
                      setShowMenu(false);
                      onQuickStatusChange(appointment.id, target.id);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 transition-colors cursor-pointer flex items-center justify-between ${
                      appointment.status === target.id
                        ? 'bg-gray-50 text-gray-400 font-semibold cursor-default'
                        : 'hover:bg-purple-50 hover:text-[#2e0249] text-gray-700'
                    }`}
                  >
                    <span>{target.label}</span>
                    {appointment.status === target.id ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Placement & Artwork Row */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-semibold text-[11px] capitalize border border-purple-100/60 truncate">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{appointment.tattoo_location}</span>
        </span>

        {hasImages ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-50 text-gray-600 text-[11px] font-medium border border-gray-100 shrink-0">
            <ImageIcon className="w-3 h-3 text-gray-400" />
            <span>{imageUrls.length}</span>
          </span>
        ) : null}
      </div>

      {/* Reference Image Thumbnail Preview (if present) */}
      {hasImages ? (
        <div className="mb-3 relative w-full h-24 rounded-xl overflow-hidden bg-gray-100 border border-black/5">
          <Image
            src={imageUrls[0]}
            alt={`${appointment.name} tattoo reference`}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : null}

      {/* Date & Time Slot */}
      <div className="flex items-center justify-between text-xs text-gray-600 mb-3 bg-gray-50/70 rounded-xl px-2.5 py-1.5 border border-gray-100">
        <div className="flex items-center gap-1.5 font-medium">
          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-gray-500">
          <Clock className="w-3 h-3 text-gray-400 shrink-0" />
          <span>{appointment.appointment_time}</span>
        </div>
      </div>

      {/* Card Footer: Pricing/Deposit & Quick Contact */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
        {/* Deposit / Price Info */}
        <div className="flex items-center gap-1.5">
          {appointment.estimated_price != null ? (
            <span className="font-bold text-[#2e0249] text-[11px]">
              Rs. {appointment.estimated_price.toLocaleString()}
            </span>
          ) : (
            <span className="text-[10px] text-gray-400 italic">No quote</span>
          )}

          {/* Deposit Status Pill */}
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
              appointment.deposit_status === 'paid'
                ? 'bg-emerald-100 text-emerald-800'
                : appointment.deposit_status === 'partial'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-gray-100 text-gray-500'
            }`}
          >
            {appointment.deposit_status}
          </span>
        </div>

        {/* Quick Contact Buttons */}
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {whatsappNumber ? (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Chat on WhatsApp"
              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </a>
          ) : null}

          {appointment.phone ? (
            <a
              href={`tel:${appointment.phone}`}
              title="Call Client"
              className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
