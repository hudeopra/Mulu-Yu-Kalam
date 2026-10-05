'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const CursorTrail = dynamic(
  () => import('./CursorTrail').then((m) => m.CursorTrail),
  { ssr: false },
);

export function PublicLandingClient() {
  useEffect(() => {
    document.body.classList.add('custom-cursor-page');
    return () => {
      document.body.classList.remove('custom-cursor-page');
    };
  }, []);

  return <CursorTrail />;
}
