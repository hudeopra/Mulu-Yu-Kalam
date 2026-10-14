'use client';

import * as React from 'react';
import type { Column } from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className = '',
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={`font-bold ${className}`}>{title}</div>;
  }

  const isSorted = column.getIsSorted();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        type="button"
        onClick={() => column.toggleSorting(isSorted === 'asc')}
        className="flex items-center gap-1.5 hover:text-[#ff7b01] transition-colors cursor-pointer text-left font-bold"
      >
        <span>{title}</span>
        {isSorted === 'asc' ? (
          <ArrowUp className="w-3.5 h-3.5 text-[#ff7b01]" />
        ) : isSorted === 'desc' ? (
          <ArrowDown className="w-3.5 h-3.5 text-[#ff7b01]" />
        ) : (
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-60" />
        )}
      </button>
    </div>
  );
}

