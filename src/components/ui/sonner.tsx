'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-[#2e0249] group-[.toaster]:border-[#ede3d4] group-[.toaster]:shadow-xl group-[.toaster]:rounded-2xl font-sans text-xs',
          description: 'group-[.toast]:text-gray-500 text-[11px]',
          actionButton:
            'group-[.toast]:bg-[#ff7b01] group-[.toast]:text-white font-bold text-xs rounded-xl',
          cancelButton:
            'group-[.toast]:bg-gray-100 group-[.toast]:text-gray-600 font-semibold text-xs rounded-xl',
          success: '!border-emerald-200 !bg-emerald-50 text-emerald-900',
          error: '!border-red-200 !bg-red-50 text-red-900',
          info: '!border-blue-200 !bg-blue-50 text-blue-900',
          warning: '!border-amber-200 !bg-amber-50 text-amber-900',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

