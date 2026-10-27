'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { DefaultCellComponentProps } from 'payload';
import { useListRelationships } from '@payloadcms/ui';

interface CategoryDoc {
  id?: string | number;
  title?: string;
  name?: string;
  slug?: string;
}

interface FeatureTagDoc {
  id?: string | number;
  name?: string;
  title?: string;
  icon?: string;
  badgeColor?: 'gold' | 'flame' | 'blue' | 'purple' | string;
}

export const CategoriesAndTagCell: React.FC<DefaultCellComponentProps> = ({
  cellData,
  rowData,
}) => {
  const { documents, getRelationships } = useListRelationships?.() || {};
  const [hasRequested, setHasRequested] = useState(false);

  // --- Categories Resolution ---
  const rawCategories = useMemo(() => {
    const raw = cellData ?? rowData?.categories;
    if (Array.isArray(raw)) return raw;
    if (raw) return [raw];
    return [];
  }, [cellData, rowData?.categories]);

  // --- Feature Tag Resolution ---
  const rawFeatureTag = rowData?.featureTag;

  // Request unpopulated relationships
  useEffect(() => {
    if (hasRequested || !getRelationships) return;

    const toRequest: Array<{ relationTo: string; value: string | number }> = [];

    rawCategories.forEach((cat: unknown) => {
      if (typeof cat === 'string' || typeof cat === 'number') {
        toRequest.push({ relationTo: 'categories', value: cat });
      }
    });

    if (typeof rawFeatureTag === 'string' || typeof rawFeatureTag === 'number') {
      toRequest.push({ relationTo: 'feature-tags', value: rawFeatureTag });
    }

    if (toRequest.length > 0) {
      getRelationships(toRequest);
      setHasRequested(true);
    }
  }, [rawCategories, rawFeatureTag, hasRequested, getRelationships]);

  // Build resolved categories list
  const resolvedCategories: CategoryDoc[] = useMemo(() => {
    return rawCategories
      .map((cat: unknown) => {
        if (typeof cat === 'object' && cat !== null) {
          return cat as CategoryDoc;
        }
        if (typeof cat === 'string' || typeof cat === 'number') {
          const doc = documents?.['categories']?.[cat];
          if (doc && typeof doc === 'object') {
            return doc as CategoryDoc;
          }
          return { id: cat, title: String(cat) };
        }
        return null;
      })
      .filter((c): c is CategoryDoc => Boolean(c));
  }, [rawCategories, documents]);

  // Build resolved feature tag
  const resolvedFeatureTag: FeatureTagDoc | null = useMemo(() => {
    if (!rawFeatureTag) return null;
    if (typeof rawFeatureTag === 'object') {
      return rawFeatureTag as FeatureTagDoc;
    }
    if (typeof rawFeatureTag === 'string' || typeof rawFeatureTag === 'number') {
      const doc = documents?.['feature-tags']?.[rawFeatureTag];
      if (doc && typeof doc === 'object') {
        return doc as FeatureTagDoc;
      }
      return { id: rawFeatureTag, name: String(rawFeatureTag) };
    }
    return null;
  }, [rawFeatureTag, documents]);

  const maxCategories = 3;
  const visibleCategories = resolvedCategories.slice(0, maxCategories);
  const overflowCount = resolvedCategories.length - maxCategories;
  const overflowNames =
    overflowCount > 0
      ? resolvedCategories
          .slice(maxCategories)
          .map((c) => c.title || c.name || '')
          .filter(Boolean)
          .join(', ')
      : '';

  // Feature tag badge style color mapping (text only tag)
  const getTagStyle = (color?: string): React.CSSProperties => {
    switch (color) {
      case 'flame':
        return { backgroundColor: '#ffe4e6', color: '#9f1239', borderColor: '#fecdd3' };
      case 'blue':
        return { backgroundColor: '#e0f2fe', color: '#075985', borderColor: '#bae6fd' };
      case 'purple':
        return { backgroundColor: '#f3e8ff', color: '#6b21a8', borderColor: '#e9d5ff' };
      case 'gold':
      default:
        return { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fde68a' };
    }
  };

  const tagName = resolvedFeatureTag?.name || resolvedFeatureTag?.title || 'Featured';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        justifyContent: 'center',
        minWidth: '130px',
        maxWidth: '240px',
        padding: '2px 0',
        boxSizing: 'border-box',
      }}
    >
      {/* Top: Categories (xs text size badges with 4px gap, or <No Category>) */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {visibleCategories.length > 0 ? (
          <>
            {visibleCategories.map((cat, idx) => {
              const label = cat.title || cat.name || 'Category';
              return (
                <span
                  key={cat.id || idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: '#f5effb',
                    color: '#2e0249',
                    border: '1px solid #e4d4f4',
                    whiteSpace: 'nowrap',
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: '1.3',
                  }}
                  title={label}
                >
                  {label}
                </span>
              );
            })}
            {overflowCount > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  fontSize: '10px',
                  fontWeight: 700,
                  backgroundColor: '#f3f4f6',
                  color: '#4b5563',
                  border: '1px solid #e5e7eb',
                  cursor: 'help',
                  lineHeight: '1.3',
                }}
                title={`+${overflowCount} more: ${overflowNames}`}
              >
                +{overflowCount}
              </span>
            )}
          </>
        ) : (
          <span
            style={{
              fontSize: '11px',
              color: '#9ca3af',
              fontStyle: 'italic',
              display: 'block',
              lineHeight: '1.4',
            }}
          >
            &lt;No Category&gt;
          </span>
        )}
      </div>

      {/* Bottom: Feature Tag (Text only, no icon, or <No Feature Tag>) */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {resolvedFeatureTag ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 600,
              borderWidth: '1px',
              borderStyle: 'solid',
              maxWidth: '160px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.3',
              ...getTagStyle(resolvedFeatureTag.badgeColor),
            }}
            title={tagName}
          >
            {tagName}
          </span>
        ) : (
          <span
            style={{
              fontSize: '11px',
              color: '#9ca3af',
              fontStyle: 'italic',
              display: 'block',
              lineHeight: '1.4',
            }}
          >
            &lt;No Feature Tag&gt;
          </span>
        )}
      </div>
    </div>
  );
};
