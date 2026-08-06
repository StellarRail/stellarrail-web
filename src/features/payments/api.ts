import { env } from '@/lib/env'
import type { Paginated, Payment } from '@/types'
export async function listPayments(params: Record<string, string>): Promise<Paginated<Payment>> {
  const q = new URLSearchParams(params).toString()
  const r = await fetch(`${env.NEXT_PUBLIC_API_URL}/payments?${q}`)
  if (!r.ok) throw new Error('Failed to load payments')
  return (await r.json()) as Paginated<Payment>
}
export async function getPayment(id: string): Promise<Payment> {
  const r = await fetch(`${env.NEXT_PUBLIC_API_URL}/payments/${id}`)
  if (!r.ok) throw new Error('Payment not found')
  return (await r.json()) as Payment
}
export async function createPayment(body: Record<string, unknown>): Promise<Payment> {
  const key =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : String(Date.now())
  const r = await fetch(`${env.NEXT_PUBLIC_API_URL}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
    body: JSON.stringify(body)
  })
  if (!r.ok) throw new Error('Failed to create payment')
  return (await r.json()) as Payment
}
export async function checkBlocklist(
  address: string
): Promise<{ blocked: boolean; reason?: string }> {
  const r = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/blocklist/check?address=${encodeURIComponent(address)}`
  )
  if (!r.ok) return { blocked: false }
  return (await r.json()) as { blocked: boolean; reason?: string }
}
