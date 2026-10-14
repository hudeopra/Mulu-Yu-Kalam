'use client';

import {
  forwardRef,
  isValidElement,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { cn } from 'cn';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from '@/components/ui/select';

export interface SelectOptionObject {
  value: string;
  label: string;
  disabled?: boolean;
}

export type SelectOption = string | SelectOptionObject;

export interface SelectFieldProps {
  label?: string;
  labelClassName?: string;
  placeholder?: string;
  icon?: LucideIcon | ReactNode;
  iconClassName?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options?: SelectOption[];
  children?: ReactNode;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  containerClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
  id?: string;
}

export const SelectField = forwardRef<HTMLButtonElement, SelectFieldProps>(
  (
    {
      label,
      labelClassName,
      placeholder,
      icon,
      iconClassName,
      value,
      onValueChange,
      options,
      children,
      error,
      helperText,
      disabled,
      open: controlledOpen,
      onOpenChange: controlledOnOpenChange,
      containerClassName,
      triggerClassName,
      contentClassName,
      id,
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    // Support both controlled and uncontrolled open state
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlledOpen = controlledOpen !== undefined;
    const isOpen = isControlledOpen ? controlledOpen : internalOpen;

    const handleOpenChange = (openState: boolean) => {
      if (!isControlledOpen) {
        setInternalOpen(openState);
      }
      controlledOnOpenChange?.(openState);
    };

    // Normalize options (supports array of strings or option objects)
    const normalizedOptions = useMemo<SelectOptionObject[] | undefined>(() => {
      if (!options) return undefined;
      return options.map((opt) =>
        typeof opt === 'string'
          ? { value: opt, label: opt, disabled: false }
          : opt,
      );
    }, [options]);

    // Resolve friendly label for currently selected value
    const selectedOption = useMemo(
      () => normalizedOptions?.find((opt) => opt.value === value),
      [normalizedOptions, value],
    );
    const selectedLabel = selectedOption ? selectedOption.label : value;

    const displayLabel = label || placeholder;
    const hasValue = Boolean(value && value.trim() !== '');
    const isFloating = hasValue || isOpen;

    const renderIcon = () => {
      if (!icon) return null;
      if (isValidElement(icon)) return icon;
      const IconComponent = icon as LucideIcon;
      return (
        <IconComponent
          className={cn(
            'size-5 text-[#ffbd5b] shrink-0 mr-3 pointer-events-none transition-colors group-focus-within:text-[#ff7b01]',
            iconClassName,
          )}
        />
      );
    };

    return (
      <div className={cn('relative pt-3', containerClassName)}>
        <div
          className={cn(
            'group relative flex items-center h-12 border-b-2 border-[#ffbd5b] focus-within:border-[#ff7b01] transition-colors',
            error && 'border-red-400 focus-within:border-red-500',
          )}
        >
          {renderIcon()}

          {displayLabel && (
            <label
              htmlFor={selectId}
              className={cn(
                'absolute pointer-events-none transition-all duration-200 origin-left select-none',
                icon ? 'left-8' : 'left-0',
                isFloating
                  ? '-top-2.5 text-xs font-semibold text-[#ff7b01]'
                  : 'top-3 text-base font-normal text-[#ffbd5b]',
                labelClassName,
              )}
            >
              {displayLabel}
            </label>
          )}

          <Select
            value={value}
            open={isOpen}
            onOpenChange={handleOpenChange}
            onValueChange={(val) => {
              if (val != null && onValueChange) {
                onValueChange(val);
              }
            }}
            disabled={disabled}
          >
            <SelectTrigger
              ref={ref}
              id={selectId}
              className={cn(
                'w-full bg-transparent border-none rounded-none px-0 text-base text-[#2e0249] shadow-none focus-visible:ring-0 h-full transition-colors cursor-pointer data-placeholder:text-[#ffbd5b] [&_svg]:text-[#ffbd5b] group-focus-within:[&_svg]:text-[#ff7b01]',
                !isFloating && 'opacity-0',
                triggerClassName,
              )}
            >
              <SelectValue placeholder={placeholder || displayLabel}>
                {selectedLabel}
              </SelectValue>
            </SelectTrigger>

            <SelectContent
              className={cn(
                'bg-white border border-[#ffbd5b] shadow-xl rounded-2xl p-1',
                contentClassName,
              )}
            >
              {normalizedOptions ? (
                <SelectGroup>
                  {normalizedOptions.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      disabled={opt.disabled}
                      className="rounded-xl hover:bg-[#ffecd0] focus:bg-[#ffecd0] text-sm text-[#2e0249] font-medium py-2 px-3 cursor-pointer"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ) : (
                children
              )}
            </SelectContent>
          </Select>
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

SelectField.displayName = 'SelectField';
