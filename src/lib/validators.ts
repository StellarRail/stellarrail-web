import { z } from 'zod'

export const stellarAddressSchema = z
  .string()
  .length(56, 'Stellar address must be 56 characters')
  .regex(
    /^G[A-Z2-7]{55}$/,
    'Invalid Stellar address (must start with G, base32) — see https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts'
  )

export function isValidStellarAddress(addr: string): boolean {
  return stellarAddressSchema.safeParse(addr).success
}

// StrKey checksum validation via stellar-sdk when available; falls back to format check
export async function isValidStellarAddressStrict(addr: string): Promise<boolean> {
  if (!isValidStellarAddress(addr)) return false
  try {
    const { StrKey } = await import('stellar-sdk')
    return StrKey.isValidEd25519PublicKey(addr)
  } catch {
    return true
  }
}

export const amountXlmSchema = z
  .string()
  .regex(/^\d+(\.\d{1,7})?$/, 'Max 7 decimals (1 XLM = 10^7 stroops)')
  .refine((v) => Number(v) > 0, 'Amount must be greater than 0')

export const memoSchema = z.string().max(28, 'Memo must be ≤ 28 chars').optional()

export const paymentSchema = z.object({
  destination: stellarAddressSchema,
  amountXlm: amountXlmSchema,
  memo: memoSchema,
  referenceId: z.string().min(3).max(64)
})
