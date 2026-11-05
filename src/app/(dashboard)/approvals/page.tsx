'use client'
import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Check,
  X,
  ShieldAlert,
  Clock,
  RotateCw,
  AlertTriangle,
  ShieldCheck,
  Layers,
  ArrowRight,
  ExternalLink,
  Copy
} from 'lucide-react'
import { toast } from 'sonner'
import { env } from '@/lib/env'
import { seedPayments } from '@/mocks/seed'
import { useAuthStore } from '@/stores/auth-store'
import { canApprove } from '@/components/auth/RequireRole'
import { approvePayment, rejectPayment } from '@/features/approvals/api'
import { useCountdown } from '@/hooks/hooks'
import { truncateAddress, explorerAccountUrl } from '@/lib/formatters'
import { cn } from '@/lib/cn'
import type { Paginated, Payment } from '@/types'

async function fetchPending(): Promise<Payment[]> {
  const r = await fetch(`${env.NEXT_PUBLIC_API_URL}/payments?status=PENDING_APPROVAL&limit=100`)
  if (!r.ok) throw new Error('Failed to load queue')
  const j = (await r.json()) as Paginated<Payment>
  return [...j.data].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

function SlaBadge({ deadline }: { deadline?: string }): React.JSX.Element {
  const { label, state } = useCountdown(deadline)
  return (
    <span
      title="Non-custodial escrow timelock: auto-refund can be triggered after expiration"
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums',
        state === 'soon'
          ? 'border border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300'
          : state === 'expired'
            ? 'border border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300'
            : 'border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400'
      )}
    >
      <Clock size={11} aria-hidden="true" />
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
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const network = env.NEXT_PUBLIC_STELLAR_NETWORK

  // Dual-control enforcement
  const isSelf = !canApprove(payment.requesterId, user?.id ?? 'user_approver_1')

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const refresh = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ['pending-queue'] })
    await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    await queryClient.invalidateQueries({ queryKey: ['payments'] })
  }

  const doApprove = async (): Promise<void> => {
    setBusy(true)
    try {
      await approvePayment(payment.id)
      await refresh()
      toast.success(`Payment ${payment.referenceId} signed and settled`)
      onClose()
    } catch {
      toast.error('Approval submission failed. Transaction remains queued in escrow.')
    } finally {
      setBusy(false)
    }
  }

  const doReject = async (): Promise<void> => {
    if (!reason.trim()) return
    setBusy(true)
    try {
      await rejectPayment(payment.id, reason.trim())
      await refresh()
      toast.success(`Payment ${payment.referenceId} rejected and refunded`)
      onClose()
    } catch {
      toast.error('Rejection submission failed. Transaction remains unchanged.')
    } finally {
      setBusy(false)
    }
  }

  const copyDest = () => {
    navigator.clipboard.writeText(payment.destination).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-sheet-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-item-reveal"
      >
        {/* Header */}
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Multisig Authorization Quorum
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close review panel"
              className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
          </div>
          <h2
            id="review-sheet-title"
            className="mt-2 text-lg font-bold tracking-tight text-slate-900 dark:text-white font-display"
          >
            Review {payment.referenceId}
          </h2>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {payment.amountXlm}
            </span>
            <span className="font-mono text-sm font-semibold text-slate-500">XLM</span>
            <span className="text-xs text-slate-500">
              (≈ ${(Number(payment.amountXlm) * 0.132).toFixed(2)} USD)
            </span>
          </div>
        </div>

        {/* Body Details */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5 text-xs">
          {/* Multisig Signatures Progress */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Layers size={13} className="text-sky-600 dark:text-sky-400" />
                <span>Multisig Signature Quorum</span>
              </span>
              <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                1 / 2 Signatures Collected
              </span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
              role="progressbar"
              aria-valuenow={50}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="1 of 2 required signatures collected"
            >
              <div className="h-full rounded-full bg-amber-500 w-1/2" />
            </div>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              Requires 1 more signature from an authorized approver before Soroban contract releases
              funds.
            </p>
          </div>

          {/* Destination */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/60">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Destination Address
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyDest}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <a
                  href={explorerAccountUrl(network, payment.destination)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-700 hover:underline dark:text-sky-400 inline-flex items-center gap-1 text-[11px]"
                >
                  <span>Explorer</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
            <p className="font-mono text-[11px] text-slate-900 dark:text-slate-100 break-all bg-white p-2 rounded border border-slate-200 dark:border-slate-700 dark:bg-slate-900 select-all">
              {payment.destination}
            </p>
          </div>

          {/* Transaction Metadata */}
          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Requester
              </dt>
              <dd className="mt-1 font-medium text-slate-900 dark:text-slate-100 truncate">
                {payment.requesterEmail ?? payment.requesterId}
              </dd>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Policy Limit Check
              </dt>
              <dd className="mt-1 text-emerald-700 dark:text-emerald-400 font-medium">
                ✓ Within 50,000 XLM limit
              </dd>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Escrow Expiry
              </dt>
              <dd className="mt-1 font-mono text-slate-900 dark:text-slate-100">
                <SlaBadge deadline={payment.deadline} />
              </dd>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Audit Memo
              </dt>
              <dd className="mt-1 text-slate-900 dark:text-slate-100 truncate">
                {payment.memo ?? 'None'}
              </dd>
            </div>
          </dl>

          {/* Dual-Control Warning */}
          {isSelf ? (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
            >
              <ShieldAlert
                size={16}
                className="shrink-0 mt-0.5 text-amber-600"
                aria-hidden="true"
              />
              <div>
                <p className="font-semibold text-amber-950 dark:text-amber-100">
                  Dual-Control Policy Enforced
                </p>
                <p className="mt-0.5 text-amber-800 dark:text-amber-300 text-[11px]">
                  You created this transaction request. Under institutional security policy, you
                  cannot approve or release your own disbursements.
                </p>
              </div>
            </div>
          ) : null}

          {/* Rejection Rationale Input */}
          {confirm === 'reject' ? (
            <div className="space-y-2 rounded-lg border border-rose-300 bg-rose-50/70 p-3.5 dark:border-rose-900 dark:bg-rose-950/40">
              <label
                htmlFor="reject-rationale"
                className="block text-xs font-semibold text-rose-950 dark:text-rose-200"
              >
                Reason for Rejection (Audit Requirement)
              </label>
              <textarea
                id="reject-rationale"
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State the compliance or financial reason for rejecting this disbursement..."
                className="w-full rounded border border-rose-300 p-2 text-xs text-slate-900 outline-none dark:border-rose-800 dark:bg-slate-900 dark:text-slate-100"
              />
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  disabled={!reason.trim() || busy}
                  onClick={() => void doReject()}
                  className="flex-1 rounded bg-rose-600 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-40"
                >
                  Confirm Rejection &amp; Refund
                </button>
                <button
                  type="button"
                  onClick={() => setConfirm(null)}
                  className="rounded border border-rose-300 px-3 py-1.5 text-xs text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-200 p-5 dark:border-slate-800 flex items-center gap-2">
          <button
            type="button"
            disabled={isSelf || busy}
            title={isSelf ? 'Cannot authorize your own request' : undefined}
            onClick={() => void doApprove()}
            className="flex-1 h-9 rounded-md bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <Check size={15} aria-hidden="true" />
            <span>Approve &amp; Sign</span>
          </button>
          <button
            type="button"
            disabled={isSelf || busy}
            title={isSelf ? 'Cannot reject your own request' : undefined}
            onClick={() => setConfirm('reject')}
            className="h-9 px-3.5 rounded-md border border-rose-300 bg-rose-50 text-xs font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center justify-center gap-1.5"
          >
            <X size={15} aria-hidden="true" />
            <span>Reject</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-3.5 rounded-md border border-slate-300 bg-white text-xs font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Close
          </button>
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Approvals
            </h1>
            <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.2 font-mono text-[10px] font-semibold text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {rows?.length ?? 0} Awaiting Quorum
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Transactions awaiting cryptographic multisig sign-off before Horizon ledger submission.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void query.refetch()}
          className="flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 self-start sm:self-auto"
        >
          <RotateCw
            size={13}
            className={query.isFetching ? 'animate-spin' : ''}
            aria-hidden="true"
          />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Quorum Explanation Banner */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 flex items-start gap-3">
        <ShieldCheck
          size={18}
          className="text-sky-600 dark:text-sky-400 shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-200">
            Dual-Control Quorum Policy
          </p>
          <p className="mt-0.5 text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
            Every payment requires <strong>2 of 3 authorized cryptographic signatures</strong>{' '}
            before being broadcast to Stellar Horizon. Requesters are strictly barred from signing
            their own payment requests.
          </p>
        </div>
      </div>

      {query.isError ? (
        <div
          role="alert"
          className="flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
        >
          <span>Live approvals queue unavailable — displaying cached items.</span>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="font-semibold underline ml-2"
          >
            Retry
          </button>
        </div>
      ) : null}

      {/* Queue List */}
      {query.isPending ? (
        <div
          className="space-y-3"
          role="status"
          aria-busy="true"
          aria-label="Loading approvals queue"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      ) : rows && rows.length > 0 ? (
        <ul className="space-y-3" aria-label="Pending approvals list">
          {rows.map((p) => (
            <li
              key={p.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 transition-colors"
            >
              <button
                type="button"
                onClick={() => setSelected(p)}
                aria-label={`Review payment ${p.referenceId}`}
                className="flex flex-1 items-start sm:items-center gap-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded-lg p-1"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                  <ShieldCheck size={18} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                      {p.referenceId}
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.2 font-mono text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      1/2 Signed
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                    Requested by {p.requesterEmail ?? p.requesterId} · To{' '}
                    {truncateAddress(p.destination)}
                  </p>
                </div>
              </button>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="text-right">
                  <p className="font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                    {p.amountXlm}{' '}
                    <span className="text-[10px] text-slate-500 font-normal">XLM</span>
                  </p>
                  <SlaBadge deadline={p.deadline} />
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelected(p)}
                    className="h-8 rounded-md bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
                  >
                    Review &amp; Sign
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 mb-3">
            <Check size={20} />
          </div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            All caught up. No pending approvals in queue.
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            New disbursement requests requiring multisig quorum will appear here in real-time.
          </p>
        </div>
      )}

      {selected ? <ReviewSheet payment={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  )
}
