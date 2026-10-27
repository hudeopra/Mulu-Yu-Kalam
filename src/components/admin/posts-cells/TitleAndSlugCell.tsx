'use client';

import React from 'react';
import Link from 'next/link';
import type { DefaultCellComponentProps } from 'payload';

export const TitleAndSlugCell: React.FC<DefaultCellComponentProps> = ({
  cellData,
  rowData,
  linkURL,
}) => {
  const title = (cellData as string) || (rowData?.title as string) || 'Untitled Post';
  const rawSlug = (rowData?.slug as string) || '';
  // Remove any leading or trailing slashes from slug to ensure "no /"
  const slug = rawSlug.replace(/^\/+|\/+$/g, '');
  const href = linkURL || (rowData?.id ? `/cms/collections/posts/${rowData.id}` : '#');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
        padding: '4px 0',
        maxWidth: '300px',
        boxSizing: 'border-box',
      }}
    >
      {/* Line 1: Title (Truncated) */}
      <Link
        href={href}
        style={{
          display: 'block',
          width: '300px',
          maxWidth: '300px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontWeight: 700,
          fontSize: '13px',
          color: '#2e0249',
          lineHeight: '1.4',
          textDecoration: 'none',
        }}
        title={title}
      >
        {title}
      </Link>

      {/* Line 2: Slug (Separate line, no "/", Truncated) */}
      <span
        style={{
          display: 'block',
          width: '300px',
          maxWidth: '300px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: '11px',
          fontFamily: 'monospace',
          color: '#6b7280',
          lineHeight: '1.3',
        }}
        title={slug}
      >
        {slug ? slug : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>no slug</span>}
      </span>
    </div>
  );
};
