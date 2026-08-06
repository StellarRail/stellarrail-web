import { env } from '@/lib/env'
export async function getLimits(): Promise<{
  perTx: number
  daily: number
  require2Approvers: number
}> {
  const r = await fetch(`${env.NEXT_PUBLIC_API_URL}/config/limits`)
  if (!r.ok) throw new Error('Failed to load limits')
  return (await r.json()) as { perTx: number; daily: number; require2Approvers: number }
}
export async function saveLimits(v: {
  perTx: number
  daily: number
  require2Approvers: number
}): Promise<void> {
  const r = await fetch(`${env.NEXT_PUBLIC_API_URL}/config/limits`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(v)
  })
  if (!r.ok) throw new Error('Failed to save limits')
}
