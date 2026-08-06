import { env } from '@/lib/env'
export async function loginRequest(
  email: string,
  password: string
): Promise<{ mfaRequired: boolean }> {
  const r = await fetch(`${env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  if (r.status === 429) {
    const after = r.headers.get('Retry-After') ?? '30'
    throw new Error(`Too many attempts, try in ${after}s`)
  }
  if (!r.ok) throw new Error('Invalid credentials')
  return (await r.json()) as { mfaRequired: boolean }
}
export async function mfaRequest(
  code: string
): Promise<{
  accessToken: string
  expiresIn: number
  user: { id: string; email: string; role: 'operator' | 'approver' | 'admin'; mfaEnabled: boolean }
}> {
  const r = await fetch(`${env.NEXT_PUBLIC_API_URL}/auth/mfa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  })
  if (!r.ok) {
    const j = (await r.json().catch(() => ({}))) as { attemptsLeft?: number }
    throw new Error(
      j.attemptsLeft !== undefined
        ? `Invalid code (${j.attemptsLeft} attempts left)`
        : 'Invalid code'
    )
  }
  return (await r.json()) as never
}
