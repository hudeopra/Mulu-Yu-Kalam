import type { ComponentProps, ReactNode, Ref } from 'react';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';

export interface InputFieldProps extends ComponentProps<'input'> {
  register?: Partial<UseFormRegisterReturn>;
  label?: string;
  error?: FieldError | { message?: string };
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

export function InputField({
  register,
  name,
  label,
  error,
  type = 'text',
  placeholder = 'Type Here...',
  className = '',
  containerClassName = '',
  labelClassName = 'block text-sm font-semibold text-gray-800 mb-2',
  errorClassName = 'text-xs font-semibold text-red-500 flex items-center gap-1 mt-1.5',
  icon,
  rightElement,
  disabled = false,
  id,
  ref,
  ...rest
}: InputFieldProps) {
  const inputId = id || name || register?.name;
  const combinedRef = ref || register?.ref;

  return (
    <div className={containerClassName}>
      {label ? (
        <label htmlFor={inputId} className={labelClassName}>
          {label}
        </label>
      ) : null}

      {icon || rightElement ? (
        <div className="relative">
          {icon ? icon : null}
          <input
            ref={combinedRef}
            {...register}
            id={inputId}
            type={type}
            placeholder={placeholder}
            className={className}
            disabled={disabled}
            {...rest}
          />
          {rightElement ? rightElement : null}
        </div>
      ) : (
        <input
          ref={combinedRef}
          {...register}
          id={inputId}
          type={type}
          placeholder={placeholder}
          className={className}
          disabled={disabled}
          {...rest}
        />
      )}

      {error?.message ? (
        <p className={errorClassName}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error.message}</span>
        </p>
      ) : null}
    </div>
  );
}

export default InputField;
