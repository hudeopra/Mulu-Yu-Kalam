'use client';

import { LayoutList, Kanban, CalendarDays } from 'lucide-react';

export type AdminViewMode = 'table' | 'kanban' | 'calendar';

interface AppointmentViewSwitcherProps {
  currentView: AdminViewMode;
  onViewChange: (view: AdminViewMode) => void;
}

const VIEW_OPTIONS: {
  id: AdminViewMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'table', label: 'List Table', icon: LayoutList },
  { id: 'kanban', label: 'Kanban Board', icon: Kanban },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
];

export function AppointmentViewSwitcher({
  currentView,
  onViewChange,
}: AppointmentViewSwitcherProps) {
  return (
    <div className="inline-flex items-center p-1 bg-white rounded-2xl border border-black/5 shadow-xs gap-1">
      {VIEW_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const isActive = currentView === opt.id;

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onViewChange(opt.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isActive
                ? 'bg-[#2e0249] text-white shadow-xs'
                : 'text-gray-600 hover:text-[#2e0249] hover:bg-gray-100'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

