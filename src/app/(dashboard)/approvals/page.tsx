'use client'
import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { env } from '@/lib/env'
import { seedPayments } from '@/mocks/seed'
import { useAuthStore } from '@/stores/auth-store'
import { canApprove } from '@/components/auth/RequireRole'
import { approvePayment, rejectPayment } from '@/features/approvals/api'
import { useCountdown } from '@/hooks/hooks'
import { truncateAddress } from '@/lib/formatters'
import { cn } from '@/lib/cn'
import type { Paginated, Payment } from '@/types'

async function fetchPending(): Promise<Payment[]> {
  const r = await fetch(`${env.NEXT_PUBLIC_API_URL}/payments?status=PENDING_APPROVAL&limit=100`)
  if (!r.ok) throw new Error('Failed to load queue')
  const j = (await r.json()) as Paginated<Payment>
  return [...j.data].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

function Sla({ deadline }: { deadline?: string }): React.JSX.Element {
  const { label, state } = useCountdown(deadline)
  return (
    <span
      title="Settlements expire automatically — a refund can be triggered by anyone after expiry"
      className={cn(
        'whitespace-nowrap font-mono text-xs tabular-nums',
        state === 'soon'
          ? 'text-warning-dark'
          : state === 'expired'
            ? 'text-ink-secondary'
            : 'text-ink-secondary'
      )}
    >
      {label}
    </span>
  )
}

function ReviewSheet({
  payment,
  onClose
}: {
  payment: Payment
  onClose: () => void
}): React.JSX.Element {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [confirm, setConfirm] = useState<'approve' | 'reject' | null>(null)
  const [verified, setVerified] = useState(false)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const own = !canApprove(payment.requesterId, user?.id ?? 'user_approver_1')

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const refresh = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ['pending-queue'] })
  }

  const doApprove = async (): Promise<void> => {
    setBusy(true)
    try {
      await approvePayment(payment.id)
      await refresh()
      toast.success(`Payment ${payment.referenceId} approved`)
      onClose()
    } catch {
      toast.error('Approval failed. Nothing was submitted — try again.')
    } finally {
      setBusy(false)
    }
  }

  const doReject = async (): Promise<void> => {
    if (!reason) return
    setBusy(true)
    try {
      await rejectPayment(payment.id, reason)
      await refresh()
      toast.success(`Payment ${payment.referenceId} rejected and refunded`)
      onClose()
    } catch {
      toast.error('Rejection failed. Nothing was submitted — try again.')
    } finally {
      setBusy(false)
    }
  }

  const btn =
    'inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md border text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div className="fixed inset-0 z-50">
      <div aria-hidden="true" className="absolute inset-0 bg-ink/20" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-white"
      >
        <div className="border-b border-line p-4">
          <h2 id="review-title" className="text-base font-bold tracking-tight text-ink">
            Review {payment.referenceId}
          </h2>
          <p className="mt-1 font-mono text-2xl tabular-nums text-ink">{payment.amountXlm} XLM</p>
        </div>
        <dl className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-secondary">Destination</dt>
            <dd className="font-mono text-xs text-ink" title={payment.destination}>
              {payment.destination}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-secondary">Requester</dt>
            <dd className="text-ink">{payment.requesterEmail ?? payment.requesterId}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-secondary">
              Against spending limit
            </dt>
            <dd className="text-ink">8,000 / 10,000 XLM per transaction</dd>
          </div>
          {Number(payment.amountXlm) > 8000 ? (
            <p
              role="alert"
              className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-[#92400E]"
            >
              Large amount — verify destination out of band before approving.
            </p>
          ) : null}
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-secondary">
              Escrow lock proof
            </dt>
            <dd className="font-mono text-xs text-ink">
              {payment.lockTxHash ? truncateAddress(payment.lockTxHash, 8) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-secondary">Expires in</dt>
            <dd>
              <Sla deadline={payment.deadline} />
            </dd>
          </div>
          {own ? (
            <p
              role="alert"
              className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-danger-dark"
            >
              You cannot approve your own request. Separation of duties is enforced.
            </p>
          ) : null}
        </dl>
        <div className="space-y-2 border-t border-line p-4">
          {confirm === 'approve' ? (
            <div className="rounded-md border border-line p-3">
              <label htmlFor="verify-dest" className="flex items-center gap-2 text-sm text-ink">
                <input
                  id="verify-dest"
                  type="checkbox"
                  checked={verified}
                  onChange={(e) => setVerified(e.target.checked)}
                  className="h-4 w-4 accent-[#2563EB]"
                />
                I verified the destination address
              </label>
              <button
                type="button"
                disabled={!verified || busy || own}
                onClick={() => void doApprove()}
                className={cn(
                  btn,
                  'mt-2 w-full border-success text-success-dark hover:bg-success/10'
                )}
              >
                Confirm approval
              </button>
            </div>
          ) : null}
          {confirm === 'reject' ? (
            <div className="rounded-md border border-line p-3">
              <label htmlFor="reject-reason" className="text-sm font-medium text-ink">
                Reason{' '}
                <span aria-hidden="true" className="text-danger-dark">
                  *
                </span>
              </label>
              <select
                id="reject-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-line bg-white px-2 text-sm text-ink"
              >
                <option value="">Select a reason…</option>
                <option value="wrong-address">Wrong address</option>
                <option value="duplicate">Duplicate request</option>
                <option value="policy">Policy violation</option>
              </select>
              {!reason && confirm === 'reject' ? (
                <p role="alert" className="mt-1 text-xs text-danger-dark">
                  A reason is required — rejections trigger refunds.
                </p>
              ) : null}
              <button
                type="button"
                disabled={!reason || busy || own}
                onClick={() => void doReject()}
                className={cn(btn, 'mt-2 w-full border-danger text-danger-dark hover:bg-danger/10')}
              >
                Confirm rejection
              </button>
            </div>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={own || busy}
              title={own ? 'You cannot approve your own request' : undefined}
              onClick={() => setConfirm('approve')}
              className={cn(btn, 'border-success text-success-dark hover:bg-success/10')}
            >
              <Check size={16} strokeWidth={1.5} aria-hidden="true" />
              Approve
            </button>
            <button
              type="button"
              disabled={own || busy}
              title={own ? 'You cannot approve your own request' : undefined}
              onClick={() => setConfirm('reject')}
              className={cn(btn, 'border-danger text-danger-dark hover:bg-danger/10')}
            >
              <X size={16} strokeWidth={1.5} aria-hidden="true" />
              Reject
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-md border border-line px-4 text-sm font-medium text-ink hover:bg-line-hover"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ApprovalsPage(): React.JSX.Element {
  const [selected, setSelected] = useState<Payment | null>(null)
  const query = useQuery({
    queryKey: ['pending-queue'],
    queryFn: fetchPending,
    retry: 1,
    refetchInterval: 15_000
  })
  const rows =
    query.data ??
    (query.isError ? seedPayments.filter((p) => p.status === 'PENDING_APPROVAL') : undefined)

  return (
    <div>
      <div className="flex items-center">
        <h1 className="text-xl font-bold tracking-tight text-ink">Approvals</h1>
        <button
          type="button"
          onClick={() => void query.refetch()}
          className="ml-auto h-9 rounded-md border border-line px-3 text-sm font-medium text-ink hover:bg-line-hover"
        >
          Refresh
        </button>
      </div>
      {query.isError ? (
        <p
          role="alert"
          className="mt-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-[#92400E]"
        >
          Live queue unavailable — showing cached items.{' '}
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="font-medium underline"
          >
            Retry
          </button>
        </p>
      ) : null}

      {query.isPending ? (
        <div
          className="mt-4 space-y-2"
          role="status"
          aria-busy="true"
          aria-label="Loading approvals"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-md border border-line bg-white" />
          ))}
        </div>
      ) : rows && rows.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {rows.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-3 rounded-md border border-line bg-white p-4 sm:flex-row sm:items-center"
            >
              <button
                type="button"
                onClick={() => setSelected(p)}
                aria-label={`Review payment ${p.referenceId}`}
                className="flex flex-1 items-center gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-md"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink">{p.referenceId}</span>
                  <span className="block truncate text-xs text-ink-secondary">
                    {p.requesterEmail ?? p.requesterId} · {p.memo ?? 'No memo'}
                  </span>
                </span>
                <span className="font-mono text-sm tabular-nums text-ink">{p.amountXlm} XLM</span>
                <Sla deadline={p.deadline} />
              </button>
              <span className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelected(p)}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-success px-4 text-sm font-medium text-success-dark hover:bg-success/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <Check size={16} strokeWidth={1.5} aria-hidden="true" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(p)}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-danger px-4 text-sm font-medium text-danger-dark hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <X size={16} strokeWidth={1.5} aria-hidden="true" />
                  Reject
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-md border border-line bg-white px-4 py-8 text-center text-sm text-ink-secondary">
          All caught up. Nothing awaiting approval.
        </p>
      )}
      {selected ? <ReviewSheet payment={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  )
}
