import type { ComponentProps, Ref } from 'react';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';

export interface TextareaFieldProps extends ComponentProps<'textarea'> {
  register?: Partial<UseFormRegisterReturn>;
  label?: string;
  error?: FieldError | { message?: string };
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

export function TextareaField({
  register,
  name,
  label,
  error,
  placeholder = 'Type Here...',
  className = '',
  containerClassName = '',
  labelClassName = 'block text-sm font-semibold text-gray-800 mb-2',
  errorClassName = 'text-xs font-semibold text-red-500 flex items-center gap-1 mt-1.5',
  disabled = false,
  id,
  ref,
  ...rest
}: TextareaFieldProps) {
  const textareaId = id || name || register?.name;
  const combinedRef = ref || register?.ref;

  return (
    <div className={containerClassName}>
      {label ? (
        <label htmlFor={textareaId} className={labelClassName}>
          {label}
        </label>
      ) : null}
      <textarea
        ref={combinedRef}
        {...register}
        id={textareaId}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        {...rest}
      />
      {error?.message ? (
        <p className={errorClassName}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error.message}</span>
        </p>
      ) : null}
    </div>
  );
}

export default TextareaField;
