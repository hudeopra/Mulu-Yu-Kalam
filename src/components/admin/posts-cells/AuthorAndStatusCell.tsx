'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { DefaultCellComponentProps } from 'payload';
import { useListRelationships } from '@payloadcms/ui';

interface UserDoc {
  id?: string | number;
  name?: string;
  username?: string;
  email?: string;
}

export const AuthorAndStatusCell: React.FC<DefaultCellComponentProps> = ({
  cellData,
  rowData,
}) => {
  const { documents, getRelationships } = useListRelationships?.() || {};
  const [hasRequested, setHasRequested] = useState(false);

  // --- Authors Resolution ---
  const rawAuthors = useMemo(() => {
    const raw = cellData ?? rowData?.authors;
    if (Array.isArray(raw)) return raw;
    if (raw) return [raw];
    return [];
  }, [cellData, rowData?.authors]);

  useEffect(() => {
    if (hasRequested || !getRelationships) return;

    const toRequest: Array<{ relationTo: string; value: string | number }> = [];
    rawAuthors.forEach((author: unknown) => {
      if (typeof author === 'string' || typeof author === 'number') {
        toRequest.push({ relationTo: 'users', value: author });
      }
    });

    if (toRequest.length > 0) {
      getRelationships(toRequest);
      setHasRequested(true);
    }
  }, [rawAuthors, hasRequested, getRelationships]);

  const authorNames = useMemo(() => {
    if (!rawAuthors || rawAuthors.length === 0) return 'Unknown Author';

    const names = rawAuthors
      .map((author: unknown) => {
        if (typeof author === 'object' && author !== null) {
          const user = author as UserDoc;
          return user.name || user.username || user.email || 'Author';
        }
        if (typeof author === 'string' || typeof author === 'number') {
          const doc = documents?.['users']?.[author];
          if (doc && typeof doc === 'object') {
            const user = doc as UserDoc;
            return user.name || user.username || user.email || String(author);
          }
          return null;
        }
        return null;
      })
      .filter((n): n is string => Boolean(n));

    return names.length > 0 ? names.join(', ') : 'Unknown Author';
  }, [rawAuthors, documents]);

  // Read Time
  const readTime = (rowData?.readTime as number) || 1;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
        padding: '2px 0',
        justifyContent: 'center',
        maxWidth: '200px',
        boxSizing: 'border-box',
      }}
    >
      {/* Top: Author Name with Truncation */}
      <div
        style={{
          width: '180px',
          maxWidth: '180px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: '12px',
          fontWeight: 600,
          color: '#1f2937',
          display: 'block',
          lineHeight: '1.3',
        }}
        title={authorNames}
      >
        {authorNames}
      </div>

      {/* Bottom: Read time (without status badge and without icon) */}
      <span
        style={{
          fontSize: '11px',
          color: '#6b7280',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          lineHeight: '1.2',
          display: 'block',
        }}
      >
        {readTime}m read
      </span>
    </div>
  );
};
