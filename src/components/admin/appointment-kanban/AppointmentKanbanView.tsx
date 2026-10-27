'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  Clock4,
  CheckCircle2,
  Users,
  XCircle,
} from 'lucide-react';
import { type Appointment, type AppointmentStatus } from '@/lib/supabase';
import { KanbanColumn, type ColumnTheme } from './KanbanColumn';

export interface AppointmentKanbanViewProps {
  data: Appointment[];
  isLoading: boolean;
  onRefresh: () => void;
  onViewDetails: (appointment: Appointment) => void;
  onQuickStatusChange: (id: string, newStatus: AppointmentStatus) => void;
}

const COLUMN_CONFIGS: {
  status: AppointmentStatus;
  title: string;
  icon: React.ReactNode;
  theme: ColumnTheme;
}[] = [
  {
    status: 'pending',
    title: 'Pending Review',
    icon: <Clock4 className="w-4 h-4 text-amber-600" />,
    theme: {
      border: 'border-amber-200',
      headerBg: 'bg-amber-50/70',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      accentBar: 'bg-amber-500',
      dropHighlight: 'ring-amber-400 border-amber-300',
    },
  },
  {
    status: 'confirmed',
    title: 'Confirmed',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    theme: {
      border: 'border-emerald-200',
      headerBg: 'bg-emerald-50/70',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      accentBar: 'bg-emerald-500',
      dropHighlight: 'ring-emerald-400 border-emerald-300',
    },
  },
  {
    status: 'completed',
    title: 'Completed Works',
    icon: <Users className="w-4 h-4 text-blue-600" />,
    theme: {
      border: 'border-blue-200',
      headerBg: 'bg-blue-50/70',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-800',
      accentBar: 'bg-blue-500',
      dropHighlight: 'ring-blue-400 border-blue-300',
    },
  },
  {
    status: 'canceled',
    title: 'Canceled',
    icon: <XCircle className="w-4 h-4 text-rose-600" />,
    theme: {
      border: 'border-rose-200',
      headerBg: 'bg-rose-50/70',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-800',
      accentBar: 'bg-rose-500',
      dropHighlight: 'ring-rose-400 border-rose-300',
    },
  },
];

const LOCAL_STORAGE_ORDER_KEY = 'admin_kanban_card_position_order';

export function AppointmentKanbanView({
  data,
  isLoading,
  onRefresh,
  onViewDetails,
  onQuickStatusChange,
}: AppointmentKanbanViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [orderedIds, setOrderedIds] = useState<string[]>([]);

  // Initialize and synchronize ordered IDs with incoming data & localStorage
  useEffect(() => {
    let savedOrder: string[] = [];
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_ORDER_KEY);
      if (stored) {
        savedOrder = JSON.parse(stored);
      }
    } catch {
      // Ignore json parse error
    }

    const currentDataIds = data.map((d) => d.id);
    const existingSaved = savedOrder.filter((id) => currentDataIds.includes(id));
    const newIds = currentDataIds.filter((id) => !existingSaved.includes(id));

    const merged = [...newIds, ...existingSaved];
    setOrderedIds(merged);
  }, [data]);

  // Persist order helper
  const updateOrder = useCallback((newOrder: string[]) => {
    setOrderedIds(newOrder);
    try {
      localStorage.setItem(LOCAL_STORAGE_ORDER_KEY, JSON.stringify(newOrder));
    } catch {
      // Ignore storage error
    }
  }, []);

  // Map of appointments for quick lookup
  const appointmentMap = useMemo(() => {
    const map = new Map<string, Appointment>();
    data.forEach((app) => map.set(app.id, app));
    return map;
  }, [data]);

  // Filter appointments excluding suspended, filtered by search query
  const searchFilteredSet = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const set = new Set<string>();

    data.forEach((app) => {
      if (app.status === 'suspended') return;
      if (!q) {
        set.add(app.id);
        return;
      }
      const nameMatch = app.name?.toLowerCase().includes(q) ?? false;
      const emailMatch = app.email?.toLowerCase().includes(q) ?? false;
      const phoneMatch = app.phone?.toLowerCase().includes(q) ?? false;
      const locationMatch = app.tattoo_location?.toLowerCase().includes(q) ?? false;
      if (nameMatch || emailMatch || phoneMatch || locationMatch) {
        set.add(app.id);
      }
    });

    return set;
  }, [data, searchQuery]);

  // Group appointments into columns in the exact user-defined order
  const groupedData = useMemo(() => {
    const groups: Record<AppointmentStatus, Appointment[]> = {
      pending: [],
      confirmed: [],
      completed: [],
      canceled: [],
      suspended: [],
    };

    orderedIds.forEach((id) => {
      if (!searchFilteredSet.has(id)) return;
      const app = appointmentMap.get(id);
      if (app && groups[app.status]) {
        groups[app.status].push(app);
      }
    });

    return groups;
  }, [orderedIds, searchFilteredSet, appointmentMap]);

  // Handle dropping a card directly before or after another specific card
  const handleDropOnCard = (
    draggedId: string,
    targetId: string,
    position: 'before' | 'after',
  ) => {
    if (draggedId === targetId) return;

    const draggedApp = appointmentMap.get(draggedId);
    const targetApp = appointmentMap.get(targetId);
    if (!draggedApp || !targetApp) return;

    // 1. If column/status changed, update database status
    if (draggedApp.status !== targetApp.status) {
      onQuickStatusChange(draggedId, targetApp.status);
    }

    // 2. Reorder array so draggedId is placed right before or after targetId
    const filtered = orderedIds.filter((id) => id !== draggedId);
    const targetIndex = filtered.indexOf(targetId);

    if (targetIndex === -1) return;

    const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
    const nextOrder = [...filtered];
    nextOrder.splice(insertIndex, 0, draggedId);

    updateOrder(nextOrder);
  };

  // Handle dropping a card onto the column area (places at the bottom of that column)
  const handleDropAtColumnBottom = (
    draggedId: string,
    columnStatus: AppointmentStatus,
  ) => {
    const draggedApp = appointmentMap.get(draggedId);
    if (!draggedApp) return;

    // 1. If status changed, update status
    if (draggedApp.status !== columnStatus) {
      onQuickStatusChange(draggedId, columnStatus);
    }

    // 2. Reorder: move draggedId after the last card of this column
    const filtered = orderedIds.filter((id) => id !== draggedId);
    const columnCardIds = filtered.filter((id) => {
      const a = appointmentMap.get(id);
      return a && a.status === columnStatus;
    });

    if (columnCardIds.length === 0) {
      // Column is empty, place at beginning
      updateOrder([draggedId, ...filtered]);
    } else {
      const lastCardId = columnCardIds[columnCardIds.length - 1];
      const lastIndex = filtered.indexOf(lastCardId);
      const nextOrder = [...filtered];
      nextOrder.splice(lastIndex + 1, 0, draggedId);
      updateOrder(nextOrder);
    }
  };

  // Handle relative positioning shortcuts from the card menu ('up' | 'down' | 'top' | 'bottom')
  const handleMoveCardRelative = (
    appointmentId: string,
    direction: 'up' | 'down' | 'top' | 'bottom',
  ) => {
    const targetApp = appointmentMap.get(appointmentId);
    if (!targetApp) return;

    const columnCardIds = orderedIds.filter((id) => {
      const a = appointmentMap.get(id);
      return a && a.status === targetApp.status;
    });

    const currentIndexInColumn = columnCardIds.indexOf(appointmentId);
    if (currentIndexInColumn === -1) return;

    let targetNeighborId: string | null = null;
    let pos: 'before' | 'after' = 'after';

    if (direction === 'top') {
      if (currentIndexInColumn === 0) return;
      targetNeighborId = columnCardIds[0];
      pos = 'before';
    } else if (direction === 'bottom') {
      if (currentIndexInColumn === columnCardIds.length - 1) return;
      targetNeighborId = columnCardIds[columnCardIds.length - 1];
      pos = 'after';
    } else if (direction === 'up') {
      if (currentIndexInColumn === 0) return;
      targetNeighborId = columnCardIds[currentIndexInColumn - 1];
      pos = 'before';
    } else if (direction === 'down') {
      if (currentIndexInColumn === columnCardIds.length - 1) return;
      targetNeighborId = columnCardIds[currentIndexInColumn + 1];
      pos = 'after';
    }

    if (targetNeighborId) {
      handleDropOnCard(appointmentId, targetNeighborId, pos);
    }
  };

  const totalVisibleCount = searchFilteredSet.size;

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-black/5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search board by client name, email, phone, placement..."
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

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs text-gray-400 font-medium">
            Showing {totalVisibleCount} bookings • Drag cards to any rank
          </span>
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

      {/* Kanban Board Horizontal Scroll Track */}
      <div className="overflow-x-auto pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-4 min-w-[1160px] pb-2">
          {COLUMN_CONFIGS.map((col) => (
            <KanbanColumn
              key={col.status}
              status={col.status}
              title={col.title}
              icon={col.icon}
              theme={col.theme}
              appointments={groupedData[col.status] || []}
              onViewDetails={onViewDetails}
              onQuickStatusChange={onQuickStatusChange}
              onDropOnCard={handleDropOnCard}
              onDropAtColumnBottom={handleDropAtColumnBottom}
              onMoveCardRelative={handleMoveCardRelative}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
