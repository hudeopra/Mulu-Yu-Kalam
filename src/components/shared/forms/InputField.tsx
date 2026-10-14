import {
  forwardRef,
  isValidElement,
  useId,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { cn } from 'cn';

export interface InputFieldProps extends ComponentProps<'input'> {
  label?: string;
  labelClassName?: string;
  icon?: LucideIcon | ReactNode;
  iconClassName?: string;
  rightAction?: ReactNode;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  wrapperClassName?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      labelClassName,
      icon,
      iconClassName,
      rightAction,
      error,
      helperText,
      containerClassName,
      wrapperClassName,
      className,
      id,
      placeholder,
      type = 'text',
      onClick,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id || (props.name ? `input-${props.name}` : generatedId);
    const displayLabel = label || placeholder;
    const isPicker = type === 'date' || type === 'time';

    const handleClick = (e: MouseEvent<HTMLInputElement>) => {
      if (isPicker) {
        try {
          e.currentTarget.showPicker?.();
        } catch {}
      }
      onClick?.(e);
    };

    const renderIcon = () => {
      if (!icon) return null;
      if (isValidElement(icon)) {
        return icon;
      }
      const IconComponent = icon as LucideIcon;
      return (
        <IconComponent
          className={cn('size-5 text-[#ffbd5b] shrink-0', iconClassName)}
        />
      );
    };

    return (
      <div className={cn('relative pt-3', containerClassName)}>
        <div
          className={cn(
            'relative flex items-center h-12 border-b-2 border-[#ffbd5b] focus-within:border-[#ff7b01] transition-colors',
            isPicker && 'cursor-pointer',
            error && 'border-red-400 focus-within:border-red-500',
            wrapperClassName,
          )}
        >
          {renderIcon()}

          <input
            ref={ref}
            id={inputId}
            type={type}
            placeholder=" "
            onClick={handleClick}
            className={cn(
              'peer w-full pl-3 bg-transparent text-[#2e0249] outline-none text-base',
              isPicker && 'cursor-pointer [color-scheme:light]',
              className,
            )}
            {...props}
          />

          {displayLabel && (
            <label
              htmlFor={inputId}
              className={cn(
                'absolute pointer-events-none transition-all duration-200 origin-left select-none',
                icon ? 'left-8' : 'left-0',
                isPicker
                  ? '-top-2.5 text-xs font-semibold text-[#ff7b01]'
                  : '-top-2.5 text-xs font-semibold text-[#ff7b01] peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-placeholder-shown:text-[#ffbd5b] peer-focus:-top-2.5 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-[#ff7b01]',
                labelClassName,
              )}
            >
              {displayLabel}
            </label>
          )}

          {rightAction && (
            <div className="shrink-0 flex items-center ml-2">{rightAction}</div>
          )}
        </div>

        {error ? (
          <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-1">
            <AlertCircle className="size-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-xs text-gray-500 mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

InputField.displayName = 'InputField';

