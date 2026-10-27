'use client';

import { useState } from 'react';
import { type Appointment, type AppointmentStatus } from '@/lib/supabase';
import { KanbanCard } from './KanbanCard';

export interface ColumnTheme {
  border: string;
  headerBg: string;
  badgeBg: string;
  badgeText: string;
  accentBar: string;
  dropHighlight: string;
}

interface KanbanColumnProps {
  status: AppointmentStatus;
  title: string;
  icon: React.ReactNode;
  theme: ColumnTheme;
  appointments: Appointment[];
  onViewDetails: (appointment: Appointment) => void;
  onQuickStatusChange: (id: string, newStatus: AppointmentStatus) => void;
  onDropOnCard: (
    draggedId: string,
    targetId: string,
    position: 'before' | 'after',
  ) => void;
  onDropAtColumnBottom: (
    draggedId: string,
    columnStatus: AppointmentStatus,
  ) => void;
  onMoveCardRelative: (
    appointmentId: string,
    direction: 'up' | 'down' | 'top' | 'bottom',
  ) => void;
}

export function KanbanColumn({
  status,
  title,
  icon,
  theme,
  appointments,
  onViewDetails,
  onQuickStatusChange,
  onDropOnCard,
  onDropAtColumnBottom,
  onMoveCardRelative,
}: KanbanColumnProps) {
  const [isColumnDragOver, setIsColumnDragOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsColumnDragOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsColumnDragOver(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsColumnDragOver(false);
        const draggedId = e.dataTransfer.getData('text/plain');
        if (draggedId) {
          // Dropped on the column area outside cards -> place at the bottom of this column
          onDropAtColumnBottom(draggedId, status);
        }
      }}
      className={`flex flex-col rounded-3xl bg-gray-50/70 border transition-all duration-200 min-w-[280px] max-w-[340px] flex-1 ${
        isColumnDragOver
          ? `ring-2 ${theme.dropHighlight} bg-purple-50/30 scale-[1.01]`
          : 'border-black/5'
      }`}
    >
      {/* Column Header */}
      <div className={`p-4 border-b border-gray-100/80 rounded-t-3xl ${theme.headerBg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="shrink-0">{icon}</span>
            <h3 className="font-bold text-sm text-[#2e0249]">{title}</h3>
          </div>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText}`}
          >
            {appointments.length}
          </span>
        </div>
      </div>

      {/* Cards Container */}
      <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[350px] max-h-[calc(100vh-280px)] scrollbar-thin scrollbar-thumb-gray-200">
        {appointments.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center p-4 rounded-2xl border border-dashed border-gray-200 bg-white/40">
            <p className="text-xs font-semibold text-gray-400">
              No appointments
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Drag cards here to place in this column
            </p>
          </div>
        ) : (
          appointments.map((appointment, idx) => (
            <KanbanCard
              key={appointment.id}
              appointment={appointment}
              isFirst={idx === 0}
              isLast={idx === appointments.length - 1}
              onViewDetails={onViewDetails}
              onQuickStatusChange={onQuickStatusChange}
              onDropOnCard={onDropOnCard}
              onMoveCardRelative={onMoveCardRelative}
            />
          ))
        )}

        {/* Column Bottom Drop Zone for easy bottom placement */}
        {appointments.length > 0 ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = 'move';
              setIsColumnDragOver(true);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsColumnDragOver(false);
              const draggedId = e.dataTransfer.getData('text/plain');
              if (draggedId) {
                onDropAtColumnBottom(draggedId, status);
              }
            }}
            className="py-3 px-2 text-center border border-dashed border-transparent hover:border-gray-300 rounded-xl transition-all"
          >
            <span className="text-[10px] text-gray-400 font-medium">
              Drop here to place at bottom
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
