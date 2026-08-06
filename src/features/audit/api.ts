import { env } from '@/lib/env'
import type { AuditLog } from '@/types'
export async function listAudit(): Promise<{ data: AuditLog[] }> {
  const r = await fetch(`${env.NEXT_PUBLIC_API_URL}/audit`)
  if (!r.ok) throw new Error('Failed to load audit')
  return (await r.json()) as { data: AuditLog[] }
}
