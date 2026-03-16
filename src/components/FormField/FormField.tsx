// src/components/FormField/FormField.tsx
import React from "react"
import type { UseFormRegister, FieldError } from "react-hook-form"
import "./FormField.scss"

interface FormFieldProps {
  name: string
  type?: string
  placeholder: string
  register: UseFormRegister<any>
  error?: FieldError
  disabled?: boolean
  className?: string
  autoComplete?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  type = "text",
  placeholder,
  register,
  error,
  disabled = false,
  className = "",
  autoComplete,
}) => {
  return (
    <div className="form-field">
      <div className={`input-wrapper ${error ? "has-error" : ""}`}>
        <input
          type={type}
          placeholder={placeholder}
          className={`input-field ${className}`}
          disabled={disabled}
          autoComplete={autoComplete}
          {...register(name)}
        />
        {error && (
          <div className="field-error">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error.message}</span>
          </div>
        )}
      </div>
    </div>
  )
}
