import type { ComponentProps, ReactNode, Ref } from 'react';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps extends ComponentProps<'select'> {
  register?: Partial<UseFormRegisterReturn>;
  label?: string;
  error?: FieldError | { message?: string };
  options?: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  icon?: ReactNode;
  ref?: Ref<HTMLSelectElement>;
}

export function SelectField({
  register,
  name,
  label,
  error,
  options,
  placeholder,
  className = '',
  containerClassName = '',
  labelClassName = 'block text-sm font-semibold text-gray-800 mb-2',
  errorClassName = 'text-xs font-semibold text-red-500 flex items-center gap-1 mt-1.5',
  icon,
  disabled = false,
  children,
  id,
  ref,
  ...rest
}: SelectFieldProps) {
  const selectId = id || name || register?.name;
  const combinedRef = ref || register?.ref;

  const selectNode = (
    <select
      ref={combinedRef}
      {...register}
      id={selectId}
      className={className}
      disabled={disabled}
      {...rest}
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options
        ? options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))
        : children}
    </select>
  );

  return (
    <div className={containerClassName}>
      {label ? (
        <label htmlFor={selectId} className={labelClassName}>
          {label}
        </label>
      ) : null}

      {icon ? (
        <div className="relative">
          {icon}
          {selectNode}
        </div>
      ) : (
        selectNode
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

export default SelectField;
