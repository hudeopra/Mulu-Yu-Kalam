'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type SortingState,
} from '@tanstack/react-table';
import { Search, RefreshCw, Calendar } from 'lucide-react';
import {
  type Appointment,
  type AppointmentStatus,
  type AppointmentStats,
  computeAppointmentStats,
} from '@/lib/supabase';
import { DataTable, DataTablePagination } from '@/components/shared/table';
import { getAppointmentColumns } from './columns';

interface AppointmentDataTableProps {
  data: Appointment[];
  stats?: AppointmentStats;
  isLoading: boolean;
  onRefresh: () => void;
  onViewDetails: (appointment: Appointment) => void;
  onQuickStatusChange: (id: string, newStatus: AppointmentStatus) => void;
}

export function AppointmentDataTable({
  data,
  stats: statsProp,
  isLoading,
  onRefresh,
  onViewDetails,
  onQuickStatusChange,
}: AppointmentDataTableProps) {
  // Table states
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'appointment_date', desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>(
    'all',
  );

  // Apply status category filter before TanStack global search & pagination (strictly excluding suspended)
  const categoryFilteredData = useMemo(() => {
    if (statusFilter === 'all') {
      return data.filter((app) => app.status !== 'suspended');
    }
    return data.filter((app) => app.status === statusFilter);
  }, [data, statusFilter]);

  // Compute or reuse live count stats for category tabs
  const stats = useMemo(() => {
    return statsProp ?? computeAppointmentStats(data);
  }, [statsProp, data]);

  // Column definitions
  const columns = useMemo(() => {
    return getAppointmentColumns({
      onViewDetails,
      onQuickStatusChange,
    });
  }, [onViewDetails, onQuickStatusChange]);

  // Custom global search filtering across client info fields
  const globalFilterFn = (
    row: { original: Appointment },
    _columnId: string,
    filterValue: string,
  ) => {
    if (!filterValue || filterValue.trim() === '') return true;
    const q = filterValue.toLowerCase().trim();
    const app = row.original;
    const nameMatch = app.name?.toLowerCase().includes(q) ?? false;
    const emailMatch = app.email?.toLowerCase().includes(q) ?? false;
    const phoneMatch = app.phone?.toLowerCase().includes(q) ?? false;
    const locationMatch =
      app.tattoo_location?.toLowerCase().includes(q) ?? false;
    return nameMatch || emailMatch || phoneMatch || locationMatch;
  };

  const table = useReactTable({
    data: categoryFilteredData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const totalRows = table.getFilteredRowModel().rows.length;
  const pageSize = table.getState().pagination.pageSize;

  return (
    <div className="space-y-4">
      {/* Search Bar, Refresh & Status Tabs Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-black/5 shadow-xs space-y-4 ">
        <div className="flex flex-wrap md:flex-nowrap flex-col sm:flex-row sm:items-center justify-between items-center gap-3">
          {/* Global Search Box */}
          <div className="relative flex-1  order-2 md:order-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search by client name, email, phone, location..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-9 py-2 text-xs text-[#2e0249] focus:outline-none focus:ring-2 focus:ring-[#ff7b01]/30 focus:border-[#ff7b01] placeholder:text-gray-400 transition-all"
            />
            {globalFilter ? (
              <button
                type="button"
                onClick={() => setGlobalFilter('')}
                className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                Clear
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none border-t border-gray-100 order 1 md:order-2 w-full md:w-auto">
            {(
              [
                { id: 'all', label: 'All', count: stats.total },
                { id: 'pending', label: 'Pending', count: stats.pending },
                { id: 'confirmed', label: 'Confirmed', count: stats.confirmed },
                { id: 'completed', label: 'Completed', count: stats.completed },
                { id: 'canceled', label: 'Canceled', count: stats.canceled },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id);
                  table.setPageIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-[#2e0249] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          {/* Table Page Size & Refresh Button */}
          <div className="flex items-center gap-2 justify-end order-2 md:order-3">
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 ">
              <span className="text-[11px] font-semibold text-gray-500">
                Rows:
              </span>
              <select
                value={pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="bg-transparent text-xs font-semibold text-[#2e0249] focus:outline-none cursor-pointer"
              >
                {[10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

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

        {/* Status Filter Tabs */}
      </div>

      {/* TanStack Table Card Container */}
      <div className="bg-white rounded-3xl border border-black/5 shadow-xs overflow-hidden">
        <DataTable
          table={table}
          isLoading={isLoading && data.length === 0}
          loadingContent={
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#ff7b01] animate-spin mx-auto" />
              <p className="text-sm font-semibold text-[#2e0249]">
                Loading appointment bookings...
              </p>
            </div>
          }
          emptyContent={
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#2e0249]">
                No appointments found
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {globalFilter
                  ? `No bookings match your search query "${globalFilter}".`
                  : statusFilter !== 'all'
                    ? `There are currently no appointments in the "${statusFilter}" category.`
                    : 'New client bookings submitted from the landing page will automatically stream here in real time.'}
              </p>
              {globalFilter ? (
                <button
                  type="button"
                  onClick={() => setGlobalFilter('')}
                  className="text-xs font-bold text-[#ff7b01] hover:underline cursor-pointer"
                >
                  Clear search filters
                </button>
              ) : null}
            </div>
          }
          onRowClick={onViewDetails}
        />

        {totalRows > 0 ? (
          <DataTablePagination table={table} itemName="appointments" />
        ) : null}
      </div>
    </div>
  );
}
