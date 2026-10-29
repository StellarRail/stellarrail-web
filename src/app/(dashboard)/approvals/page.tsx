'use client'
import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Check,
  X,
  ShieldAlert,
  Clock,
  ArrowRight,
  RotateCw,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react'
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
        'inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-xs tabular-nums font-medium',
        state === 'soon'
          ? 'border border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300'
          : state === 'expired'
            ? 'border border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300'
            : 'border border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-navy-800 dark:text-slate-400'
      )}
    >
      <Clock size={11} />
      <span>{label}</span>
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
    'tactile-btn inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md border text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div className="fixed inset-0 z-50">
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line/80 bg-white shadow-2xl dark:border-white/10 dark:bg-navy-950 animate-item-reveal"
      >
        <div className="border-b border-line/80 p-5 dark:border-white/10">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Multisig Authorization
            </span>
            <button
              type="button"
              onClick={onClose}
              className="tactile-btn rounded p-1 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
          </div>
          <h2
            id="review-title"
            className="mt-2 text-base font-bold tracking-tight text-ink dark:text-white font-display"
          >
            Review {payment.referenceId}
          </h2>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-ink dark:text-slate-100">
            {payment.amountXlm}{' '}
            <span className="text-sm font-normal text-slate-600 dark:text-slate-400">XLM</span>
          </p>
        </div>

        <dl className="flex-1 space-y-4 overflow-y-auto p-5 text-sm">
          <div className="rounded-lg border border-line/60 bg-slate-50/80 p-3 dark:border-white/5 dark:bg-navy-900/60">
            <dt className="text-[10px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Destination
            </dt>
            <dd
              className="mt-1 font-mono text-xs font-medium text-ink dark:text-slate-200 break-all"
              title={payment.destination}
            >
              {payment.destination}
            </dd>
          </div>

          <div className="rounded-lg border border-line/60 bg-slate-50/80 p-3 dark:border-white/5 dark:bg-navy-900/60">
            <dt className="text-[10px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Requester
            </dt>
            <dd className="mt-1 text-xs font-medium text-ink dark:text-slate-200">
              {payment.requesterEmail ?? payment.requesterId}
            </dd>
          </div>

          <div className="rounded-lg border border-line/60 bg-slate-50/80 p-3 dark:border-white/5 dark:bg-navy-900/60">
            <dt className="text-[10px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Against spending limit
            </dt>
            <dd className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Within daily authorized policy threshold (&lt;50,000 XLM).
            </dd>
          </div>

          {own ? (
            <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              <ShieldAlert size={16} className="shrink-0 mt-0.5 text-amber-600" />
              <span>
                Dual-control policy enforcement: You created this request and cannot authorize your
                own settlement.
              </span>
            </div>
          ) : null}

          {confirm === 'reject' ? (
            <div className="space-y-2 rounded-lg border border-rose-300 bg-rose-50/60 p-3 dark:border-rose-900/60 dark:bg-rose-950/40">
              <label
                htmlFor="reject-reason"
                className="block text-xs font-semibold text-rose-900 dark:text-rose-200"
              >
                Reason for Rejection (Required)
              </label>
              <textarea
                id="reject-reason"
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State audit rationale..."
                className="w-full rounded border border-rose-300 p-2 text-xs outline-none dark:border-rose-800 dark:bg-navy-900"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!reason || busy}
                  onClick={() => void doReject()}
                  className="tactile-btn flex-1 rounded bg-rose-600 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-40"
                >
                  Confirm Rejection
                </button>
                <button
                  type="button"
                  onClick={() => setConfirm(null)}
                  className="tactile-btn rounded border border-rose-300 px-3 py-1.5 text-xs text-rose-800 hover:bg-rose-100 dark:text-rose-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </dl>

        <div className="border-t border-line/80 p-5 dark:border-white/10">
          <div className="flex gap-2">
            <button
              type="button"
              disabled={own || busy}
              title={own ? 'You cannot approve your own request' : undefined}
              onClick={() => void doApprove()}
              className={cn(
                btn,
                'border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-300'
              )}
            >
              <Check size={16} strokeWidth={2} aria-hidden="true" />
              Approve
            </button>
            <button
              type="button"
              disabled={own || busy}
              title={own ? 'You cannot approve your own request' : undefined}
              onClick={() => setConfirm('reject')}
              className={cn(
                btn,
                'border-rose-400 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300'
              )}
            >
              <X size={16} strokeWidth={2} aria-hidden="true" />
              Reject
            </button>
            <button
              type="button"
              onClick={onClose}
              className="tactile-btn h-9 rounded-md border border-line bg-white px-4 text-sm font-medium text-ink hover:bg-slate-50 dark:border-white/10 dark:bg-navy-900 dark:text-slate-200 dark:hover:bg-white/5"
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line/60 pb-4 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-ink dark:text-white font-display">
              Approvals
            </h1>
            <span className="rounded-full border border-amber-300/60 bg-amber-50 px-2 py-0.2 font-mono text-[10px] font-semibold text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-300">
              {rows?.length ?? 0} Pending Quorum
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Transactions awaiting cryptographic multisig sign-off before Horizon ledger submission.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void query.refetch()}
          className="tactile-btn flex h-8 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-xs font-medium text-ink shadow-subtle hover:bg-slate-50 dark:border-white/10 dark:bg-navy-900 dark:text-slate-200 dark:hover:bg-white/5 self-start sm:self-auto"
        >
          <RotateCw size={13} className={query.isFetching ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {query.isError ? (
        <p
          role="alert"
          className="flex items-center justify-between rounded-lg border border-amber-300/60 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-300"
        >
          <span>Live queue unavailable — showing cached items.</span>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="font-medium underline ml-2"
          >
            Retry
          </button>
        </p>
      ) : null}

      {query.isPending ? (
        <div
          className="mt-4 space-y-3"
          role="status"
          aria-busy="true"
          aria-label="Loading approvals"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl border border-line/60 bg-white dark:border-white/10 dark:bg-navy-900"
            />
          ))}
        </div>
      ) : rows && rows.length > 0 ? (
        <ul className="space-y-3">
          {rows.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-3 rounded-xl border border-line/80 bg-white p-4 shadow-subtle sm:flex-row sm:items-center dark:border-white/10 dark:bg-navy-900/90 hover:border-slate-300 dark:hover:border-white/20 transition-colors"
            >
              <button
                type="button"
                onClick={() => setSelected(p)}
                aria-label={`Review payment ${p.referenceId}`}
                className="tactile-btn flex flex-1 items-center gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-lg p-1"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                  <ShieldCheck size={18} strokeWidth={2} />
                </div>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-xs font-semibold text-ink dark:text-slate-100">
                    {p.referenceId}
                  </span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                    {p.requesterEmail ?? p.requesterId} · {p.memo ?? 'No audit memo'}
                  </span>
                </span>
                <span className="font-mono text-sm font-bold tabular-nums text-ink dark:text-white">
                  {p.amountXlm}{' '}
                  <span className="text-[10px] text-slate-600 dark:text-slate-400">XLM</span>
                </span>
                <Sla deadline={p.deadline} />
              </button>

              <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-line/60 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setSelected(p)}
                  className="tactile-btn inline-flex h-8 items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                >
                  <Check size={14} strokeWidth={2} aria-hidden="true" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(p)}
                  className="tactile-btn inline-flex h-8 items-center gap-1.5 rounded-md border border-rose-300 bg-rose-50 px-3 text-xs font-semibold text-rose-800 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300"
                >
                  <X size={14} strokeWidth={2} aria-hidden="true" />
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-line/80 bg-white px-4 py-12 text-center shadow-subtle dark:border-white/10 dark:bg-navy-900">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            All caught up. Nothing awaiting approval.
          </p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            New settlement requests requiring multisig sign-off will appear here in real-time.
          </p>
        </div>
      )}
      {selected ? <ReviewSheet payment={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  )
}
