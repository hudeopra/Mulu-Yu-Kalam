import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

export interface InputFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onKeyDown'
> {
  register?: Partial<UseFormRegisterReturn>;
  name?: string;
  label?: string;
  error?: FieldError;
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'date'
    | 'time'
    | 'url'
    | 'tel'
    | 'search'
    | 'number'
    | 'checkbox';
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  disabled?: boolean;
  onKeyDown?: (
    e: React.KeyboardEvent<HTMLInputElement>,
    index?: number,
  ) => void;
  index?: number;
}

const InputField = ({
  register,
  name,
  label,
  error,
  type = 'text',
  placeholder = 'Type Here...',
  className = '',
  containerClassName = 'form__item',
  labelClassName,
  errorClassName,
  icon,
  rightElement,
  disabled = false,
  onKeyDown,
  index,
  id,
  ...rest
}: InputFieldProps) => {
  const inputId = id || name;

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={inputId} className={labelClassName}>
          {label}
        </label>
      )}

      {icon || rightElement ? (
        <div className="relative">
          {icon}
          <input
            {...register}
            id={inputId}
            type={type}
            placeholder={placeholder}
            className={`${className}`}
            disabled={disabled}
            onKeyDown={(e) => onKeyDown?.(e, index as number)}
            {...rest}
          />
          {rightElement}
        </div>
      ) : (
        <input
          {...register}
          id={inputId}
          type={type}
          placeholder={placeholder}
          className={`${className}`}
          disabled={disabled}
          onKeyDown={(e) => onKeyDown?.(e, index as number)}
          {...rest}
        />
      )}

      {error && (
        <p
          className={errorClassName}
          style={errorClassName ? undefined : { color: 'red' }}
        >
          {error?.message}
        </p>
      )}
    </div>
  );
};

export default InputField;
