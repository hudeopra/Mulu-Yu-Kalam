'use client';

import React, { useEffect, useState } from 'react';
import type { DefaultCellComponentProps } from 'payload';
import { useListRelationships } from '@payloadcms/ui';

interface MediaDoc {
  id?: string | number;
  url?: string;
  thumbnailURL?: string;
  sizes?: Record<string, { url?: string }>;
  alt?: string;
  filename?: string;
}

export const HeroImageCell: React.FC<DefaultCellComponentProps> = ({ cellData, rowData }) => {
  const rawImage = (cellData as MediaDoc | string | number | null | undefined) ?? rowData?.heroImage;
  const { documents, getRelationships } = useListRelationships?.() || {};
  const [hasRequested, setHasRequested] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isId = typeof rawImage === 'string' || typeof rawImage === 'number';
  const imageId = isId ? rawImage : undefined;

  useEffect(() => {
    if (imageId && !hasRequested && getRelationships) {
      getRelationships([{ relationTo: 'media', value: imageId }]);
      setHasRequested(true);
    }
  }, [imageId, hasRequested, getRelationships]);

  let resolvedDoc: MediaDoc | null = null;
  if (rawImage && typeof rawImage === 'object') {
    resolvedDoc = rawImage as MediaDoc;
  } else if (imageId && documents?.['media']?.[imageId]) {
    const found = documents['media'][imageId];
    if (typeof found === 'object' && found !== null) {
      resolvedDoc = found as MediaDoc;
    }
  }

  const imageSrc =
    resolvedDoc?.thumbnailURL ||
    resolvedDoc?.sizes?.thumbnail?.url ||
    resolvedDoc?.sizes?.card?.url ||
    resolvedDoc?.url;

  const alt = resolvedDoc?.alt || (rowData?.title as string) || 'Hero image';

  if (!imageSrc || imgError) {
    return (
      <div
        style={{
          width: '75px',
          height: '75px',
          minWidth: '75px',
          minHeight: '75px',
          maxWidth: '75px',
          maxHeight: '75px',
          borderRadius: '8px',
          border: '1px dashed #d1d5db',
          backgroundColor: '#faf7f2',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af',
          flexShrink: 0,
          boxSizing: 'border-box',
          userSelect: 'none',
        }}
        title="No hero image"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
        <span style={{ fontSize: '9px', marginTop: '3px', fontWeight: 500, color: '#9ca3af' }}>
          No img
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '75px',
        height: '75px',
        minWidth: '75px',
        minHeight: '75px',
        maxWidth: '75px',
        maxHeight: '75px',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #f0e8dc',
        backgroundColor: '#faf7f2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
      title={alt}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={alt}
        style={{
          width: '75px',
          height: '75px',
          minWidth: '75px',
          minHeight: '75px',
          maxWidth: '75px',
          maxHeight: '75px',
          objectFit: 'cover',
          display: 'block',
        }}
        onError={() => setImgError(true)}
        loading="lazy"
      />
    </div>
  );
};
