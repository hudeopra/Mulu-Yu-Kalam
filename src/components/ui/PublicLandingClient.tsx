'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CursorTrail } from './CursorTrail';

export function PublicLandingClient() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') || pathname?.startsWith('/cms');

  const [isEnabled, setIsEnabled] = useState<boolean>(true);

  useEffect(() => {
    // Read user preference from localStorage (default: true)
    const stored = localStorage.getItem('mulu_cursor_enabled');
    const active = stored !== 'false';
    setIsEnabled(active);

    const applyState = (enabled: boolean) => {
      if (enabled && !isAdmin) {
        document.body.classList.remove('custom-cursor-disabled');
        document.documentElement.classList.remove('custom-cursor-disabled');
        document.body.classList.add('custom-cursor-page');
      } else {
        document.body.classList.remove('custom-cursor-page');
        if (!enabled) {
          document.body.classList.add('custom-cursor-disabled');
          document.documentElement.classList.add('custom-cursor-disabled');
        }
      }
    };

    applyState(active);

    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.enabled === 'boolean') {
        const nextState = customEvent.detail.enabled;
        setIsEnabled(nextState);
        applyState(nextState);
      }
    };

    window.addEventListener('mulu-cursor-toggle', handleToggle);

    return () => {
      window.removeEventListener('mulu-cursor-toggle', handleToggle);
    };
  }, [isAdmin, pathname]);

  if (isAdmin || !isEnabled) return null;

  return <CursorTrail />;
}
