// src/utils/validationSchemas.ts
import { z } from 'zod'

const MIN_PASSWORD_LENGTH = 6
const MIN_USERNAME_LENGTH = 3
const MAX_USERNAME_LENGTH = 20
const MIN_AGE = 6

// Common validation rules
const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
  // .regex(
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  //   'Password must contain at least one uppercase letter, lowercase letter, number, and special character'
  // )

const emailSchema = z
  .string()
  .min(3, 'Email is required')
  .email('Please enter a valid email address')

const usernameSchema = z
  .string()
  .min(MIN_USERNAME_LENGTH, `Username must be at least ${MIN_USERNAME_LENGTH} characters`)
  .max(MAX_USERNAME_LENGTH, `Username must not exceed ${MAX_USERNAME_LENGTH} characters` )
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')

// Login Schema
export const loginSchema = z.object({
  usernameOrEmail: z
    .string()
    .min(1, 'Username or email is required')
    .refine(
      (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const usernameRegex = /^[a-zA-Z0-9_]+$/
        return emailRegex.test(value) || usernameRegex.test(value)
      },
      'Please enter a valid username or email'
    ),
  password: z.string().min(1, 'Password is required')
})

// Register Schema
export const registerSchema = z
  .object({
    userName: usernameSchema,
    email: emailSchema,
    birthday: z
      .string()
      .optional()
      .refine(
        (date) => {
          if (!date) return true
          const selectedDate = new Date(date)
          const today = new Date()
          
          selectedDate.setHours(0, 0, 0, 0)
          today.setHours(0, 0, 0, 0)
          
          // Birthday must be before today
          return selectedDate < today
        },
        `Birthday must be before today: ${new Date().toLocaleDateString()}`
      )
      .refine(
        (date) => {
          if (!date) return true
          const selectedDate = new Date(date)
          const today = new Date()
          const age = today.getFullYear() - selectedDate.getFullYear()
          const monthDiff = today.getMonth() - selectedDate.getMonth()
          
          const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate()) 
            ? age - 1 
            : age
          
          return actualAge >= MIN_AGE
        },
        `You must be over ${MIN_AGE} years old to register`
      ),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

// Reset Password Schema
export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: emailSchema
})

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>