import Image from 'next/image';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Eye,
  Image as ImageIcon,
} from 'lucide-react';
import {
  type Appointment,
  type AppointmentStatus,
  getAppointmentReferenceUrls,
  getAppointmentStatusBadge,
  calculateRemainingBalance,
} from '@/lib/supabase';
import { DataTableColumnHeader } from '@/components/shared/table';

interface ColumnActions {
  onViewDetails: (appointment: Appointment) => void;
  onQuickStatusChange: (id: string, newStatus: AppointmentStatus) => void;
}

export function getAppointmentColumns({
  onViewDetails,
  onQuickStatusChange,
}: ColumnActions): ColumnDef<Appointment>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Client" />
      ),
      cell: ({ row }) => {
        const app = row.original;
        return (
          <div className="space-y-0.5">
            <p className="font-bold text-[#2e0249] group-hover:text-[#ff7b01] transition-colors text-sm">
              {app.name}
            </p>
            <div className="flex flex-col text-[11px] text-gray-500 gap-0.5">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                <span>{app.phone}</span>
              </span>
              <span className="flex items-center gap-1 truncate max-w-[180px]">
                <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                <span className="truncate">{app.email}</span>
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'tattoo_location',
      header: 'Placement',
      cell: ({ row }) => {
        const location = row.original.tattoo_location;
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 font-semibold text-[11px] capitalize border border-purple-100">
            <MapPin className="w-3 h-3" />
            {location}
          </span>
        );
      },
    },
    {
      accessorKey: 'appointment_date',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Session Date" />
      ),
      sortingFn: (rowA, rowB) => {
        const timeA = new Date(rowA.original.appointment_date).getTime() || 0;
        const timeB = new Date(rowB.original.appointment_date).getTime() || 0;
        return timeA - timeB;
      },
      cell: ({ row }) => {
        const app = row.original;
        const dateObj = new Date(app.appointment_date);
        const formattedDate = isNaN(dateObj.getTime())
          ? app.appointment_date
          : dateObj.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

        return (
          <div className="space-y-0.5">
            <p className="font-semibold text-gray-900">{formattedDate}</p>
            <p className="text-[11px] text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span>{app.appointment_time}</span>
            </p>
          </div>
        );
      },
    },
    {
      id: 'artwork',
      header: 'Artwork',
      cell: ({ row }) => {
        const app = row.original;
        const refUrls = getAppointmentReferenceUrls(app);

        if (refUrls.length === 0) {
          return (
            <div className="w-12 h-12 rounded-xl bg-gray-100 border border-dashed border-gray-200 flex items-center justify-center text-gray-400">
              <ImageIcon className="w-4 h-4" />
            </div>
          );
        }

        return (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(app);
            }}
            className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-2xs group/art cursor-pointer hover:border-[#ff7b01] transition-colors"
            title={`View ${refUrls.length} reference ${refUrls.length === 1 ? 'artwork' : 'artworks'}`}
          >
            <Image
              src={refUrls[0]}
              alt="Tattoo reference preview"
              fill
              sizes="48px"
              unoptimized
              className="object-cover group-hover/art:scale-105 transition-transform"
            />
            {refUrls.length > 1 ? (
              <span className="absolute bottom-0 right-0 bg-[#2e0249] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-tl-md shadow-xs">
                +{refUrls.length - 1}
              </span>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getAppointmentStatusBadge(
              status,
            )}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      id: 'financials',
      accessorKey: 'estimated_price',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Quote / Deposit" />
      ),
      sortingFn: (rowA, rowB) => {
        const valA = rowA.original.estimated_price ?? -1;
        const valB = rowB.original.estimated_price ?? -1;
        return valA - valB;
      },
      cell: ({ row }) => {
        const app = row.original;

        if (app.deposit_status === 'partial') {
          const due = calculateRemainingBalance(
            app.estimated_price,
            app.partial_payment_amount,
          );

          return (
            <div className="space-y-1">
              <div className="text-[11px] leading-tight">
                <span className="text-gray-500">Paid: </span>
                <span className="font-bold text-blue-700">
                  NPR {(app.partial_payment_amount ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="text-[11px] leading-tight">
                <span className="text-gray-500">Due: </span>
                <span className="font-bold text-amber-600">
                  NPR {due !== null ? due.toLocaleString() : '—'}
                </span>
              </div>
              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase bg-blue-100 text-blue-800 border border-blue-200">
                Partial Deposit
              </span>
            </div>
          );
        }

        return (
          <div className="space-y-1">
            <p className="font-bold text-[#2e0249]">
              {app.estimated_price !== null && app.estimated_price !== undefined
                ? `NPR ${app.estimated_price.toLocaleString()}`
                : 'No Quote Yet'}
            </p>
            <span
              className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase border ${
                app.deposit_status === 'paid'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}
            >
              Deposit: {app.deposit_status}
            </span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const app = row.original;

        return (
          <div className="flex items-center justify-end gap-1">
            {/* Quick confirm button for pending */}
            {app.status === 'pending' ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickStatusChange(app.id, 'confirmed');
                }}
                title="Quick Confirm"
                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : null}

            {/* Quick complete button for confirmed */}
            {app.status === 'confirmed' ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickStatusChange(app.id, 'completed');
                }}
                title="Mark Completed"
                className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : null}

            {/* View Inspector Modal Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(app);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-[#ff7b01] hover:text-white text-[#2e0249] font-bold text-xs transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>
          </div>
        );
      },
    },
  ];
}

