import { z } from 'zod'
export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})
export type LoginInput = z.infer<typeof loginSchema>
export const mfaSchema = z.object({ code: z.string().length(6, 'Enter the 6-digit code') })
export type MfaInput = z.infer<typeof mfaSchema>
