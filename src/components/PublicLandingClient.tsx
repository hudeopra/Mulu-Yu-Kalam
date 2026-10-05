'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';

const CursorTrail = dynamic(
  () => import('./ui/CursorTrail').then((m) => m.CursorTrail),
  { ssr: false },
);

export const PublicLandingClient: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    document.body.classList.add('custom-cursor-page');
    return () => {
      document.body.classList.remove('custom-cursor-page');
    };
  }, []);

  return (
    <div className="custom-cursor-page min-h-screen flex flex-col bg-white text-gray-900 selection:bg-[#ff7b01] selection:text-white font-sans antialiased">
      <CursorTrail />
      {children}
    </div>
  );
};
