export type Role = 'operator' | 'approver' | 'admin'

export type PaymentStatus =
  | 'DRAFT'
  | 'LOCKED_IN_ESCROW'
  | 'PENDING_APPROVAL'
  | 'SETTLING'
  | 'SETTLED'
  | 'REFUNDED'
  | 'FAILED'

export interface User {
  id: string
  email: string
  role: Role
  mfaEnabled: boolean
}

export interface Payment {
  id: string
  destination: string
  amountXlm: string
  memo?: string
  referenceId: string
  status: PaymentStatus
  requesterId: string
  requesterEmail?: string
  createdAt: string
  updatedAt: string
  deadline?: string
  escrowContractId?: string
  lockTxHash?: string
  settleTxHash?: string
  rejectReason?: string
}

export interface AuditLog {
  id: string
  timestamp: string
  actor: string
  action: string
  payloadHash: string
  ip: string
  detail?: Record<string, unknown>
}

export interface Paginated<T> {
  data: T[]
  page: number
  limit: number
  total: number
}
