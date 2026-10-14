import * as React from 'react';
import { flexRender, type Table as TanstackTable } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RefreshCw, FileQuestion } from 'lucide-react';

export interface DataTableProps<TData> {
  table: TanstackTable<TData>;
  isLoading?: boolean;
  loadingContent?: React.ReactNode;
  emptyContent?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  className?: string;
  headerClassName?: string;
  rowClassName?: string | ((row: TData) => string);
}

export function DataTable<TData>({
  table,
  isLoading = false,
  loadingContent,
  emptyContent,
  onRowClick,
  className = '',
  headerClassName = '',
  rowClassName = '',
}: DataTableProps<TData>) {
  const totalRows = table.getFilteredRowModel().rows.length;

  if (isLoading && totalRows === 0) {
    return (
      loadingContent ?? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#ff7b01] animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#2e0249]">
            Loading records...
          </p>
        </div>
      )
    );
  }

  if (totalRows === 0) {
    return (
      emptyContent ?? (
        <div className="py-16 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
            <FileQuestion className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#2e0249]">
            No records found
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            No items match the current filters or query.
          </p>
        </div>
      )
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className={`bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider hover:bg-gray-50/70 ${headerClassName}`}
            >
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="py-3.5 px-4 sm:px-6">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="divide-y divide-gray-100 text-xs">
          {table.getRowModel().rows.map((row) => {
            const customRowClass =
              typeof rowClassName === 'function'
                ? rowClassName(row.original)
                : rowClassName;

            return (
              <TableRow
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={`transition-colors ${
                  onRowClick
                    ? 'hover:bg-orange-50/30 cursor-pointer group'
                    : 'hover:bg-gray-50/50'
                } ${customRowClass}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-4 px-4 sm:px-6">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

