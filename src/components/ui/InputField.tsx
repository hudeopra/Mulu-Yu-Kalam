'use client';

import {
  useState,
  useRef,
  useEffect,
  type ComponentProps,
  type ReactNode,
  type Ref,
  type FocusEvent,
  type ChangeEvent,
} from 'react';
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
  floatingLabel?: boolean;
  ref?: Ref<HTMLInputElement>;
}

function getLeftOffset(hasIcon: boolean, className: string): string {
  if (hasIcon) {
    if (className.includes('pl-12')) return 'left-12';
    if (className.includes('pl-11')) return 'left-11';
    if (className.includes('pl-10')) return 'left-10';
    if (className.includes('pl-9')) return 'left-9';
    if (className.includes('pl-8')) return 'left-8';
    if (className.includes('pl-7')) return 'left-7';
    return 'left-8';
  }
  if (className.includes('pl-4') || className.includes('px-4')) return 'left-4';
  if (className.includes('pl-3') || className.includes('px-3')) return 'left-3';
  if (className.includes('pl-2') || className.includes('px-2')) return 'left-2';
  return 'left-0';
}

function getTopOffset(className: string): string {
  if (className.includes('py-3.5') || className.includes('py-4'))
    return 'top-3.5';
  if (className.includes('py-3')) return 'top-3';
  if (className.includes('py-2.5')) return 'top-2.5';
  if (className.includes('py-2')) return 'top-2';
  return 'top-2.5';
}

export function InputField({
  register,
  name,
  label,
  error,
  type = 'text',
  placeholder,
  className = '',
  containerClassName = '',
  labelClassName = '',
  errorClassName = 'text-xs font-semibold text-red-500 flex items-center gap-1 mt-1.5',
  icon,
  rightElement,
  disabled = false,
  floatingLabel = true,
  id,
  ref,
  value,
  defaultValue,
  onFocus,
  onBlur,
  onChange,
  ...rest
}: InputFieldProps) {
  const inputId = id || name || register?.name;
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isControlled = value !== undefined;
  const isDateOrTime =
    type === 'date' || type === 'time' || type === 'datetime-local';

  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(() =>
    Boolean((isControlled ? value : defaultValue) || false),
  );

  // Sync value changes (for controlled inputs or browser autofill)
  useEffect(() => {
    if (isControlled) {
      setHasValue(Boolean(value && String(value).length > 0));
    } else if (inputRef.current) {
      setHasValue(
        Boolean(inputRef.current.value && inputRef.current.value.length > 0),
      );
    }
  }, [value]);

  const displayLabel = label || placeholder;
  const isFloating =
    floatingLabel &&
    Boolean(
      isFocused ||
      (isControlled ? Boolean(value && String(value).length > 0) : hasValue) ||
      isDateOrTime,
    );

  const leftOffset = getLeftOffset(Boolean(icon), className);
  const topOffset = getTopOffset(className);

  const isAmber =
    className.includes('placeholder-[#ffbd5b]') ||
    className.includes('border-[#ffbd5b]') ||
    className.includes('text-[#ffbd5b]');

  // When floating is active, show the secondary placeholder if provided; otherwise keep placeholder clean
  const resolvedPlaceholder = floatingLabel
    ? isFloating
      ? label && placeholder && placeholder !== label
        ? placeholder
        : ''
      : ' '
    : placeholder;

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(Boolean(e.target.value && e.target.value.length > 0));
    register?.onBlur?.(e);
    onBlur?.(e);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setHasValue(Boolean(e.target.value && e.target.value.length > 0));
    register?.onChange?.(e);
    onChange?.(e);
  };

  // Assign combined refs
  const assignRef = (el: HTMLInputElement | null) => {
    inputRef.current = el;
    if (typeof ref === 'function') {
      ref(el);
    } else if (ref && 'current' in ref) {
      (ref as { current: HTMLInputElement | null }).current = el;
    }
    if (register?.ref) {
      register.ref(el);
    }
  };

  return (
    <div className={`relative ${containerClassName}`}>
      {/* If non-floating label requested and label provided, render traditional label */}
      {!floatingLabel && label ? (
        <label
          htmlFor={inputId}
          className={
            labelClassName || 'block text-sm font-semibold text-gray-800 mb-2'
          }
        >
          {label}
        </label>
      ) : null}

      <div className="relative">
        {icon ? icon : null}

        <input
          {...register}
          ref={assignRef}
          id={inputId}
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder={resolvedPlaceholder}
          className={`peer ${className}`}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...rest}
        />

        {/* Floating Label */}
        {floatingLabel && displayLabel ? (
          <label
            htmlFor={inputId}
            className={`absolute transition-all duration-200 ease-out origin-top-left select-none pointer-events-none ${leftOffset} ${topOffset} ${
              isFloating
                ? '-translate-y-5.5 scale-75 font-bold tracking-wide'
                : 'translate-y-0 scale-100 font-normal'
            } ${
              error
                ? 'text-red-500'
                : isFocused
                  ? 'text-[#ff7b01]'
                  : isFloating
                    ? 'text-[#ff7b01]/80'
                    : isAmber
                      ? 'text-[#ffbd5b]'
                      : 'text-gray-400'
            } ${labelClassName}`}
          >
            {displayLabel}
          </label>
        ) : null}

        {rightElement ? rightElement : null}
      </div>

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
