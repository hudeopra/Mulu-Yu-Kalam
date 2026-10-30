'use client';

import React from 'react';
import type { DefaultCellComponentProps } from 'payload';

function formatDateOnly(dateValue?: string | Date | number | null): string {
  if (!dateValue) return '—';
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return String(dateValue);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(d);
  } catch {
    return String(dateValue);
  }
}

export const PostDatesCell: React.FC<DefaultCellComponentProps> = ({
  cellData,
  rowData,
}) => {
  const rawStatus = (rowData?._status as string) || (rowData?.publishedAt ? 'published' : 'draft');
  const isDraft = rawStatus === 'draft';

  // Top line: Updated if draft, Published if published (Date only, NO time)
  const topDateRaw = isDraft
    ? rowData?.updatedAt || rowData?.createdAt
    : (cellData as string) || rowData?.publishedAt || rowData?.updatedAt || rowData?.createdAt;

  const topPrefix = isDraft ? 'Updated: ' : 'Published: ';
  const topDateFormatted = formatDateOnly(topDateRaw);
  const topLineFull = `${topPrefix}${topDateFormatted}`;

  // Bottom line: Created date (Date only, NO time)
  const createdRaw = rowData?.createdAt;
  const createdFormatted = formatDateOnly(createdRaw);
  const bottomLineFull = `Created: ${createdFormatted}`;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        padding: '2px 0',
        justifyContent: 'center',
        maxWidth: '200px',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Line: Published or Updated (Date only, Truncated) */}
      <div
        style={{
          width: '180px',
          maxWidth: '180px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: '12px',
          lineHeight: '1.3',
          display: 'block',
        }}
        title={topLineFull}
      >
        <span style={{ fontWeight: 700, color: isDraft ? '#b45309' : '#047857' }}>
          {topPrefix}
        </span>
        <span
          suppressHydrationWarning
          style={{ fontWeight: 500, color: '#374151' }}
        >
          {topDateFormatted}
        </span>
      </div>

      {/* Bottom Line: Created (Date only, Truncated) */}
      <div
        style={{
          width: '180px',
          maxWidth: '180px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: '11px',
          lineHeight: '1.3',
          display: 'block',
          marginTop: '2px',
        }}
        title={bottomLineFull}
      >
        <span style={{ fontWeight: 600, color: '#6b7280' }}>Created: </span>
        <span
          suppressHydrationWarning
          style={{ color: '#9ca3af' }}
        >
          {createdFormatted}
        </span>
      </div>
    </div>
  );
};
