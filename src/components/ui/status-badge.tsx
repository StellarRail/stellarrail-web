import { cn } from '@/lib/cn'
import type { PaymentStatus } from '@/types'

const statusConfig: Record<PaymentStatus, { label: string; badge: string; dot: string }> = {
  DRAFT: {
    label: 'Draft',
    badge:
      'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
    dot: 'bg-slate-400 dark:bg-slate-400'
  },
  LOCKED_IN_ESCROW: {
    label: 'Escrowed',
    badge:
      'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/70 dark:text-sky-300',
    dot: 'bg-sky-600 dark:bg-sky-400'
  },
  PENDING_APPROVAL: {
    label: 'Pending Approval',
    badge:
      'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/70 dark:text-amber-300',
    dot: 'bg-amber-600 dark:bg-amber-400'
  },
  SETTLING: {
    label: 'Settling',
    badge:
      'border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/70 dark:text-blue-300',
    dot: 'bg-blue-600 dark:bg-blue-400'
  },
  SETTLED: {
    label: 'Settled',
    badge:
      'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300',
    dot: 'bg-emerald-600 dark:bg-emerald-400'
  },
  REFUNDED: {
    label: 'Refunded',
    badge:
      'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
    dot: 'bg-slate-500 dark:bg-slate-400'
  },
  FAILED: {
    label: 'Failed',
    badge:
      'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/70 dark:text-rose-300',
    dot: 'bg-rose-600 dark:bg-rose-400'
  }
}

export function StatusBadge({
  status,
  className
}: {
  status: PaymentStatus
  className?: string
}): React.JSX.Element {
  const conf = statusConfig[status] ?? statusConfig.DRAFT
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium font-mono select-none tracking-tight whitespace-nowrap',
        conf.badge,
        className
      )}
    >
      <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full shrink-0', conf.dot)} />
      <span>{conf.label}</span>
    </span>
  )
}
