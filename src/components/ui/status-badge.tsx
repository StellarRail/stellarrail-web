import { cn } from '@/lib/cn'
import type { PaymentStatus } from '@/types'

const styles: Record<PaymentStatus, string> = {
  DRAFT: 'bg-ink/10 text-ink',
  LOCKED_IN_ESCROW: 'bg-brand/10 text-brand-dark',
  PENDING_APPROVAL: 'bg-warning/10 text-[#92400E]',
  SETTLING: 'bg-brand/10 text-brand-dark',
  SETTLED: 'bg-success/10 text-success-dark',
  REFUNDED: 'bg-ink/10 text-ink-secondary',
  FAILED: 'bg-danger/10 text-danger-dark'
}

const labels: Record<PaymentStatus, string> = {
  DRAFT: 'Draft',
  LOCKED_IN_ESCROW: 'Locked in escrow',
  PENDING_APPROVAL: 'Pending approval',
  SETTLING: 'Settling',
  SETTLED: 'Settled',
  REFUNDED: 'Refunded',
  FAILED: 'Failed'
}

export function StatusBadge({
  status,
  className
}: {
  status: PaymentStatus
  className?: string
}): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wide',
        styles[status],
        className
      )}
    >
      {labels[status]}
    </span>
  )
}
