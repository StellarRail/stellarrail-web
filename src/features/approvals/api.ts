import { env } from '@/lib/env'
export async function approvePayment(id: string): Promise<void> {
  const key =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : String(Date.now())
  const r = await fetch(`${env.NEXT_PUBLIC_API_URL}/payments/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
    body: '{}'
  })
  if (!r.ok) throw new Error('Approve failed')
}
export async function rejectPayment(id: string, reason: string, note?: string): Promise<void> {
  if (!reason) throw new Error('Reason is required')
  const r = await fetch(`${env.NEXT_PUBLIC_API_URL}/payments/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason, note })
  })
  if (!r.ok) throw new Error('Reject failed')
}
