'use client';

import { useEffect } from 'react';
import { CursorTrail } from './CursorTrail';

export function PublicLandingClient() {
  useEffect(() => {
    document.body.classList.add('custom-cursor-page');
    return () => {
      document.body.classList.remove('custom-cursor-page');
    };
  }, []);

  return <CursorTrail />;
}
