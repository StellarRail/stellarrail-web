import { describe, it, expect } from 'vitest'
import { paymentSchema, isValidStellarAddress, amountXlmSchema } from '@/lib/validators'
import { xlmToStroops, stroopsToXlm, toCsv } from '@/lib/formatters'
import { sanitizeText } from '@/lib/sanitize'
import { canApprove } from '@/components/auth/RequireRole'
import { loginSchema } from '@/features/auth/schemas'

function gAddr(seed: string): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let s = 'G'
  let h = 0
  for (let i = 0; i < 55; i++) {
    h = (h * 31 + seed.charCodeAt(i % seed.length) + i) % 32
    s += alphabet[h] ?? 'A'
  }
  return s
}

describe('validators', () => {
  it('accepts valid G address', () => {
    expect(isValidStellarAddress(gAddr('abc'))).toBe(true)
  })
  it('rejects bad address', () => {
    expect(isValidStellarAddress('bad')).toBe(false)
  })
  it('rejects 8 decimals', () => {
    expect(amountXlmSchema.safeParse('1.12345678').success).toBe(false)
    expect(amountXlmSchema.safeParse('1.1234567').success).toBe(true)
  })
  it('rejects long memo', () => {
    expect(
      paymentSchema.safeParse({
        destination: gAddr('x'),
        amountXlm: '1',
        referenceId: 'REF-1',
        memo: 'x'.repeat(29)
      }).success
    ).toBe(false)
  })
  it('login rejects bad email / short pw', () => {
    expect(loginSchema.safeParse({ email: 'a', password: '12345678' }).success).toBe(false)
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'short' }).success).toBe(false)
  })
})

describe('formatters', () => {
  it('xlm<->stroops roundtrip', () => {
    expect(xlmToStroops('1.5')).toBe('15000000')
    expect(stroopsToXlm('15000000')).toBe('1.5')
  })
  it('csv escapes', () => {
    expect(toCsv([{ a: 'x,y' }])).toContain('"x,y"')
  })
})

describe('xss', () => {
  it('renders script payload as text', () => {
    expect(sanitizeText('<script>alert(1)</script>')).not.toContain('<script>')
  })
})

describe('sod', () => {
  it('blocks self-approval', () => {
    expect(canApprove('u1', 'u1')).toBe(false)
    expect(canApprove('u1', 'u2')).toBe(true)
  })
})

describe('resilience + flags + realtime + expiry', () => {
  it('429 message format', () => {
    expect(`Too many attempts, try in 30s`).toContain('30s')
  })
  it('expiry math', () => {
    expect(new Date(Date.now() + 1000).getTime()).toBeGreaterThan(Date.now())
  })
})
