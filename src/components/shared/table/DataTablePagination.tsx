'use client';

import * as React from 'react';
import type { Table } from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

export interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  itemName?: string;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  className?: string;
}

export function DataTablePagination<TData>({
  table,
  itemName = 'records',
  pageSizeOptions = [10, 20, 50],
  showPageSizeSelector = false,
  className = '',
}: DataTablePaginationProps<TData>) {
  const pagination = table.getState().pagination;
  const pageIndex = pagination.pageIndex;
  const pageSize = pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();

  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div
      className={`px-4 sm:px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="text-[11px] text-gray-500 font-medium">
          Showing <span className="font-bold text-[#2e0249]">{startRow}</span> to{' '}
          <span className="font-bold text-[#2e0249]">{endRow}</span> of{' '}
          <span className="font-bold text-[#2e0249]">{totalRows}</span>{' '}
          {itemName}
        </div>

        {showPageSizeSelector ? (
          <div className="flex items-center gap-1.5 bg-gray-100/70 border border-gray-200 rounded-xl px-2.5 py-1">
            <span className="text-[11px] font-semibold text-gray-500">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="bg-transparent text-xs font-semibold text-[#2e0249] focus:outline-none cursor-pointer"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="First page"
          aria-label="Go to first page"
        >
          <ChevronsLeft className="w-4 h-4 text-gray-600" />
        </button>
        <button
          type="button"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="Previous page"
          aria-label="Go to previous page"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>

        <span className="px-3 py-1 font-semibold text-xs text-[#2e0249]">
          Page {pageIndex + 1} of {Math.max(1, pageCount)}
        </span>

        <button
          type="button"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="Next page"
          aria-label="Go to next page"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
        <button
          type="button"
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!table.getCanNextPage()}
          className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="Last page"
          aria-label="Go to last page"
        >
          <ChevronsRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
}

