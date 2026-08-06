import type { Payment, PaymentStatus } from '@/types'

const ADDRS = [
  'GDQNY3PBOJOKYZSRMK2S7LHHN6G7IEZ7KZN7FMVJGY6L3QJ5FQ5K2C7A1',
  'GBRPYHIL2CI3FNQ4BXLFMTHLXDGQAJJGI4E5Y5L7LQ5K2C7B3N9D2E4F6',
  'GCXKG5IL2CI3FNQ4BXLFMTHLXDGQAJJGI4E5Y5L7LQ5K2C7B3N9D2EFGH'
]
// Valid-format G addresses (56 chars base32). Generate deterministic ones:
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

const statuses: PaymentStatus[] = [
  'DRAFT',
  'DRAFT',
  'LOCKED_IN_ESCROW',
  'PENDING_APPROVAL',
  'PENDING_APPROVAL',
  'PENDING_APPROVAL',
  'SETTLED',
  'SETTLED',
  'SETTLED',
  'REFUNDED',
  'FAILED',
  'PENDING_APPROVAL'
]

export const seedPayments: Payment[] = statuses.map((status, i) => ({
  id: `pay_${String(i + 1).padStart(3, '0')}`,
  destination: gAddr(`dest-${i}`),
  amountXlm: `${(100 * (i + 1) + (i % 3) * 0.5).toFixed(i % 2 === 0 ? 2 : 7)}`,
  memo: i % 3 === 0 ? `Invoice ${1000 + i}` : undefined,
  referenceId: `REF-${2024001 + i}`,
  status,
  requesterId: i % 4 === 0 ? 'user_approver_1' : 'user_operator_1',
  requesterEmail: i % 4 === 0 ? 'approver@stellarrail.test' : 'operator@stellarrail.test',
  createdAt: new Date(Date.now() - (i + 1) * 3600_000 * 5).toISOString(),
  updatedAt: new Date(Date.now() - i * 3600_000).toISOString(),
  deadline: new Date(Date.now() + (i % 2 === 0 ? 50 : 90) * 60000).toISOString(),
  escrowContractId: status === 'DRAFT' ? undefined : `CC${String(i).padStart(4, '0')}ESCROWTESTNET`,
  lockTxHash: status === 'DRAFT' ? undefined : `${'a'.repeat(60)}${String(i).padStart(4, '0')}`,
  settleTxHash: status === 'SETTLED' ? `${'b'.repeat(60)}${String(i).padStart(4, '0')}` : undefined
}))

export const seedUsers = [
  { id: 'user_operator_1', email: 'operator@stellarrail.test', role: 'operator', mfaEnabled: true },
  { id: 'user_approver_1', email: 'approver@stellarrail.test', role: 'approver', mfaEnabled: true },
  { id: 'user_admin_1', email: 'admin@stellarrail.test', role: 'admin', mfaEnabled: true }
]

export const seedAudit = seedPayments.slice(0, 8).map((p, i) => ({
  id: `audit_${i + 1}`,
  timestamp: p.createdAt,
  actor: p.requesterEmail ?? 'system',
  action: `payment.${p.status.toLowerCase()}`,
  payloadHash: `sha256:${'c'.repeat(16)}${String(i).padStart(4, '0')}`,
  ip: '10.0.0.1'
}))

export { ADDRS }
