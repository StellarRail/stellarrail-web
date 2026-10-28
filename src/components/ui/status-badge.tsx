import { cn } from '@/lib/cn'
import type { PaymentStatus } from '@/types'

const styles: Record<PaymentStatus, { badge: string; dot: string }> = {
  DRAFT: {
    badge:
      'border-slate-300/80 bg-slate-100/90 text-slate-700 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-300',
    dot: 'bg-slate-400 dark:bg-slate-400'
  },
  LOCKED_IN_ESCROW: {
    badge:
      'border-sky-300/80 bg-sky-50 text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/60 dark:text-sky-300',
    dot: 'bg-sky-500 ring-1 ring-sky-300/50 dark:ring-sky-700/50'
  },
  PENDING_APPROVAL: {
    badge:
      'border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-300',
    dot: 'bg-amber-500 ring-1 ring-amber-300/50 dark:ring-amber-700/50'
  },
  SETTLING: {
    badge:
      'border-cyan-300/80 bg-cyan-50 text-cyan-800 dark:border-cyan-800/60 dark:bg-cyan-950/60 dark:text-cyan-300',
    dot: 'bg-cyan-500 ring-1 ring-cyan-300/50 dark:ring-cyan-700/50'
  },
  SETTLED: {
    badge:
      'border-emerald-300/80 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300',
    dot: 'bg-emerald-500 ring-1 ring-emerald-300/50 dark:ring-emerald-700/50'
  },
  REFUNDED: {
    badge:
      'border-slate-300/80 bg-slate-100/90 text-slate-700 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-300',
    dot: 'bg-slate-400 dark:bg-slate-500'
  },
  FAILED: {
    badge:
      'border-rose-300/80 bg-rose-50 text-rose-800 dark:border-rose-800/60 dark:bg-rose-950/60 dark:text-rose-300',
    dot: 'bg-rose-500 ring-1 ring-rose-300/50 dark:ring-rose-700/50'
  }
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
  const conf = styles[status] ?? styles.DRAFT
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[11px] font-medium tracking-tight select-none',
        conf.badge,
        className
      )}
    >
      <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full shrink-0', conf.dot)} />
      <span>{labels[status] ?? status}</span>
    </span>
  )
}
