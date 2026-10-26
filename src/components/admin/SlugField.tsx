'use client'

import React, { useEffect } from 'react'
import { TextInput, FieldLabel, useField, useFormFields } from '@payloadcms/ui'
import type { TextFieldClientProps } from 'payload'

const slugify = (val: string): string =>
  val
    ? val
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
    : ''

export type SlugFieldProps = TextFieldClientProps & {
  clientProps?: {
    source?: string
  }
}

export const SlugField: React.FC<SlugFieldProps> = (props) => {
  const { field, path, clientProps } = props

  const { value, setValue, showError } = useField<string>({ path })

  const sourceField =
    (clientProps?.source as string) ||
    ((field?.admin?.custom as Record<string, unknown>)?.source as string) ||
    'title'

  const sourceValue = useFormFields(([fields]) => {
    return fields?.[sourceField]?.value as string | undefined
  })

  useEffect(() => {
    if (sourceValue !== undefined) {
      const generated = slugify(sourceValue)
      if (generated !== value) {
        setValue(generated)
      }
    }
  }, [sourceValue, setValue, value])

  return (
    <div className="field-type text slug-locked-field">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '6px',
        }}
      >
        <FieldLabel
          htmlFor={`field-${path}`}
          label={field?.label || 'Slug'}
          required={field?.required}
        />
        <span
          style={{
            fontSize: '0.72rem',
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: 'var(--theme-elevation-150, #1f2937)',
            color: 'var(--theme-elevation-600, #9ca3af)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 500,
          }}
        >
          🔒 Locked & Synced
        </span>
      </div>

      <TextInput
        path={path}
        value={value || ''}
        readOnly={true}
        showError={showError}
        description={
          field?.admin?.description ||
          `Auto-generated in real-time from ${sourceField}`
        }
      />
    </div>
  )
}

export default SlugField

