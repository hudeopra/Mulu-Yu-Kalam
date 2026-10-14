import {
  forwardRef,
  isValidElement,
  type ComponentProps,
  type ReactNode,
} from 'react';
import type { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { cn } from 'cn';

export interface SubmitBtnProps extends ComponentProps<'button'> {
  isSubmitting?: boolean;
  loadingText?: string;
  icon?: LucideIcon | ReactNode;
  iconClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
}

const sizeClasses = {
  sm: 'px-5 py-2.5 rounded-xl text-xs gap-2 shadow-md shadow-[#ff7b01]/25',
  md: 'h-12 px-6 rounded-2xl text-sm gap-2 shadow-lg shadow-[#ff7b01]/30',
  lg: 'px-10 py-4 h-auto rounded-2xl text-base gap-3 shadow-lg shadow-[#ff7b01]/30',
};

const iconSizes = {
  sm: 'size-4',
  md: 'size-4',
  lg: 'size-5',
};

export const SubmitBtn = forwardRef<HTMLButtonElement, SubmitBtnProps>(
  (
    {
      type = 'submit',
      isSubmitting = false,
      loadingText,
      icon,
      iconClassName,
      size = 'md',
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const iconSize = iconSizes[size];

    const renderIcon = () => {
      if (!icon) return null;
      if (isValidElement(icon)) return icon;
      const IconComponent = icon as LucideIcon;
      return <IconComponent className={cn(iconSize, 'shrink-0', iconClassName)} />;
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isSubmitting}
        aria-busy={isSubmitting}
        className={cn(
          'inline-flex items-center justify-center font-bold text-white bg-[#ff7b01] hover:bg-[#e66f00] active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none',
          sizeClasses[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {isSubmitting ? (
          <>
            <Loader2 className={cn(iconSize, 'animate-spin shrink-0')} />
            <span>{loadingText || (typeof children === 'string' ? `${children}...` : 'Please wait...')}</span>
          </>
        ) : (
          <>
            {renderIcon()}
            <span>{children}</span>
          </>
        )}
      </button>
    );
  },
);

SubmitBtn.displayName = 'SubmitBtn';

