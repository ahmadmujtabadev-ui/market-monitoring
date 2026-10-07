import { useField } from 'formik'
import type { InputHTMLAttributes } from 'react'
import { errorTextClassName, inputClassName, labelClassName } from './Field'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string
  label: string
}

export function TextField({ name, label, className, ...props }: TextFieldProps) {
  const [field, meta] = useField(name)
  const error = meta.touched && meta.error

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className={labelClassName}>
        {label}
      </label>
      <input
        {...field}
        {...props}
        id={name}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={className ? `${inputClassName} ${className}` : inputClassName}
      />
      <p id={`${name}-error`} className={errorTextClassName}>
        {error ? meta.error : null}
      </p>
    </div>
  )
}
