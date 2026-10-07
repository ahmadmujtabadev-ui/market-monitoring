import { useField } from 'formik'
import { useState, type ReactNode } from 'react'
import { errorTextClassName, inputClassName, labelClassName } from './Field'

interface PasswordFieldProps {
  name: string
  label: string
  autoComplete?: string
  placeholder?: string
  labelAside?: ReactNode
  children?: ReactNode
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {hidden && <path d="m3 3 18 18" />}
    </svg>
  )
}

export function PasswordField({
  name,
  label,
  autoComplete,
  placeholder,
  labelAside,
  children,
}: PasswordFieldProps) {
  const [field, meta] = useField(name)
  const [visible, setVisible] = useState(false)
  const error = meta.touched && meta.error

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor={name} className={labelClassName}>
          {label}
        </label>
        {labelAside}
      </div>
      <div className="relative">
        <input
          {...field}
          id={name}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`${inputClassName} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute inset-y-0 right-1 flex w-11 cursor-pointer items-center justify-center rounded-lg text-muted transition hover:text-ink"
        >
          <EyeIcon hidden={visible} />
        </button>
      </div>
      {children}
      <p id={`${name}-error`} className={errorTextClassName}>
        {error ? meta.error : null}
      </p>
    </div>
  )
}
