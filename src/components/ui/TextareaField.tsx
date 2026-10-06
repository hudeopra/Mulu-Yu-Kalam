import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

export interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  register?: Partial<UseFormRegisterReturn>;
  name?: string;
  label?: string;
  error?: FieldError;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  disabled?: boolean;
}

const TextareaField = ({
  register,
  name,
  label,
  error,
  placeholder = 'Type Here...',
  className = '',
  containerClassName,
  labelClassName,
  errorClassName,
  disabled = false,
  id,
  ...rest
}: TextareaFieldProps) => {
  const textareaId = id || name;

  const content = (
    <>
      {label && (
        <label htmlFor={textareaId} className={labelClassName}>
          {label}
        </label>
      )}
      <textarea
        {...register}
        id={textareaId}
        placeholder={placeholder}
        className={`${className}`}
        disabled={disabled}
        {...rest}
      />
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

export default TextareaField;
