// src/hooks/useFormErrors.ts
import { useState, useEffect } from 'react'
import type { FieldErrors } from 'react-hook-form'

interface UseFormErrorsProps {
  errors: FieldErrors
  serverError?: string
  successMessage?: string
}

export const useFormErrors = ({ errors, serverError, successMessage }: UseFormErrorsProps) => {
  const [displayError, setDisplayError] = useState<string>('')
  const [displaySuccess, setDisplaySuccess] = useState<string>('')

  useEffect(() => {
    // Priority: Form validation errors > Server error
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0]
      const errorMessage =
        typeof firstError === 'object' && firstError !== null && 'message' in firstError
          ? (firstError.message as string)
          : 'Validation error'
      setDisplayError(errorMessage)
      setDisplaySuccess('')
    } else if (serverError) {
      setDisplayError(serverError)
      setDisplaySuccess('')
    } else {
      setDisplayError('')
    }
  }, [errors, serverError])

  useEffect(() => {
    if (successMessage) {
      setDisplaySuccess(successMessage)
      setDisplayError('')
    }
  }, [successMessage])

  const clearErrors = () => {
    setDisplayError('')
    setDisplaySuccess('')
  }

  // Helper function to get all validation errors as array
  const getAllValidationErrors = () => {
    return Object.values(errors)
      .map(error => {
        if (typeof error === 'object' && error !== null && 'message' in error) {
          return error.message as string
        }
        return 'Validation error'
      })
      .filter(Boolean)
  }

  // Helper function to check if there are any validation errors
  const hasValidationErrors = Object.keys(errors).length > 0

  // Helper function to check if only server error exists (no validation errors)
  const hasOnlyServerError = !hasValidationErrors && !!serverError

  return {
    displayError,
    displaySuccess,
    clearErrors,
    hasErrors: !!displayError || Object.keys(errors).length > 0,
    hasValidationErrors,
    hasOnlyServerError,
    getAllValidationErrors
  }
}