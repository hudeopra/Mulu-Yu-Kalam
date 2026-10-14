import { forwardRef, type ComponentProps } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from 'cn';

export interface TextareaFieldProps extends ComponentProps<'textarea'> {
  label?: string;
  labelClassName?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  (
    {
      label,
      labelClassName,
      error,
      helperText,
      containerClassName,
      className,
      id,
      rows = 3,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={containerClassName}>
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'block text-sm font-semibold text-gray-800 mb-2',
              labelClassName,
            )}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          className={cn(
            'w-full bg-white/70 border-2 border-[#ffbd5b] rounded-2xl p-4 text-[#2e0249] placeholder:text-[#ffbd5b] focus-visible:ring-2 focus-visible:ring-[#ff7b01]/30 focus-visible:border-[#ff7b01] transition-colors resize-none text-sm min-h-24 outline-none',
            error && 'border-red-400 focus-visible:border-red-500',
            className,
          )}
          {...props}
        />
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

TextareaField.displayName = 'TextareaField';

