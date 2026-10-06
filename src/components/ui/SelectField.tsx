import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  register?: Partial<UseFormRegisterReturn>;
  name?: string;
  label?: string;
  error?: FieldError;
  options?: SelectOption[];
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  children?: React.ReactNode;
}

const SelectField = ({
  register,
  name,
  label,
  error,
  options,
  placeholder,
  className = '',
  containerClassName,
  labelClassName,
  errorClassName,
  icon,
  disabled = false,
  children,
  id,
  ...rest
}: SelectFieldProps) => {
  const selectId = id || name;

  const content = (
    <>
      {label && (
        <label htmlFor={selectId} className={labelClassName}>
          {label}
        </label>
      )}
      {icon ? (
        <div className="relative">
          {icon}
          <select
            {...register}
            id={selectId}
            className={`${className}`}
            disabled={disabled}
            {...rest}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
        </div>
      ) : (
        <select
          {...register}
          id={selectId}
          className={`${className}`}
          disabled={disabled}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
      )}
      {error && (
        <p
          className={errorClassName}
          style={errorClassName ? undefined : { color: 'red' }}
        >
          {error?.message}
        </p>
      )}
    </>
  );

  return containerClassName ? (
    <div className={containerClassName}>{content}</div>
  ) : (
    content
  );
};

export default SelectField;
