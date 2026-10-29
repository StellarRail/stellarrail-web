'use client'
import { use } from 'react'
import { seedPayments } from '@/mocks/seed'
import { AddressLine, TxLink, CopyButton } from '@/components/payments/address-helpers'
import { usePaymentStatus, useCountdown } from '@/hooks/hooks'
import dynamic from 'next/dynamic'
import { CheckCircle2, ShieldCheck, Clock, FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/cn'

const QrModal = dynamic(() => import('@/components/payments/QrModal'), { ssr: false })

export default function PaymentDetail({
  params
}: {
  params: Promise<{ id: string }>
}): React.JSX.Element {
  const { id } = use(params)
  const found = seedPayments.find((p) => p.id === id) ?? seedPayments[0]!
  const { status, live } = usePaymentStatus(found.id, found.status)
  const { label, state } = useCountdown(found.deadline)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/payments"
          className="tactile-btn flex items-center gap-1.5 text-xs text-slate-500 hover:text-ink dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft size={14} />
          <span>Back to payments</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line/60 pb-4 dark:border-white/10">
        <div>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Payment Audit Details
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink dark:text-white font-display">
            Payment {found.referenceId}
          </h1>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1 font-mono font-medium',
                live
                  ? 'text-sky-700 dark:text-stellar-400'
                  : 'text-emerald-700 dark:text-emerald-400'
              )}
            >
              {live ? '● Live' : '○ Settled'}
            </span>
            <span>·</span>
            <span>
              Expires:{' '}
              <span
                className={cn(
                  'font-mono font-semibold',
                  state === 'soon' ? 'text-amber-700 dark:text-amber-400' : ''
                )}
              >
                {label}
              </span>{' '}
              <span
                title="Auto-refund callable by anyone after expiry"
                className="text-slate-600 dark:text-slate-400"
              >
                (auto-refund after expiry)
              </span>
            </span>
          </p>
        </div>

        <div className="flex gap-2">
          <CopyButton text={found.destination} />
          <QrModal address={found.destination} />
        </div>
      </div>

      {/* Details Definition List */}
      <div className="rounded-xl border border-line/80 bg-white p-6 shadow-subtle dark:border-white/10 dark:bg-navy-900">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg border border-line/60 bg-slate-50/80 p-3 dark:border-white/5 dark:bg-navy-800/50">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Amount
            </dt>
            <dd className="mt-1 font-mono text-xl font-bold text-ink dark:text-white tabular-nums">
              {found.amountXlm}{' '}
              <span className="text-xs text-brand dark:text-stellar-400">XLM</span>
            </dd>
          </div>

          <div className="rounded-lg border border-line/60 bg-slate-50/80 p-3 dark:border-white/5 dark:bg-navy-800/50">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Status
            </dt>
            <dd className="mt-1 font-mono text-sm font-semibold text-ink dark:text-slate-100">
              {status}
            </dd>
          </div>

          <div className="sm:col-span-2 rounded-lg border border-line/60 bg-slate-50/80 p-3 dark:border-white/5 dark:bg-navy-800/50">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Destination
            </dt>
            <dd className="mt-1 font-mono text-xs text-ink dark:text-slate-200 break-all">
              <AddressLine address={found.destination} />
            </dd>
          </div>

          <div className="rounded-lg border border-line/60 bg-slate-50/80 p-3 dark:border-white/5 dark:bg-navy-800/50">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Memo
            </dt>
            <dd className="mt-1 font-mono text-xs text-ink dark:text-slate-200">
              {found.memo ?? '—'}
            </dd>
          </div>

          <div className="rounded-lg border border-line/60 bg-slate-50/80 p-3 dark:border-white/5 dark:bg-navy-800/50">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Escrow Contract
            </dt>
            <dd className="mt-1 font-mono text-xs text-ink dark:text-slate-200 break-all">
              {found.escrowContractId ?? '—'}
            </dd>
          </div>

          <div className="rounded-lg border border-line/60 bg-slate-50/80 p-3 dark:border-white/5 dark:bg-navy-800/50">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Lock Transaction Hash
            </dt>
            <dd className="mt-1 font-mono text-xs text-ink dark:text-slate-200 break-all">
              {found.lockTxHash ? <TxLink hash={found.lockTxHash} /> : '—'}
            </dd>
          </div>

          <div className="rounded-lg border border-line/60 bg-slate-50/80 p-3 dark:border-white/5 dark:bg-navy-800/50">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Settlement Hash
            </dt>
            <dd className="mt-1 font-mono text-xs text-ink dark:text-slate-200 break-all">
              {found.settleTxHash ? <TxLink hash={found.settleTxHash} /> : '—'}
            </dd>
          </div>
        </dl>

        {/* Milestone Timeline */}
        <div className="mt-6 pt-5 border-t border-line/60 dark:border-white/5">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Consensus Lifecycle
          </h3>
          <ol className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs" aria-label="Timeline">
            {['CREATED', 'LOCKED', 'PENDING', 'SETTLED'].map((s) => (
              <li
                key={s}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-300/40 bg-emerald-50/50 p-2 font-mono text-[11px] font-semibold text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-300"
              >
                <span>✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>

        {found.status === 'DRAFT' ? (
          <p className="mt-4 text-xs font-mono text-slate-500">
            Draft editable — <button className="underline hover:text-ink">Edit</button>{' '}
            <button className="underline hover:text-ink">Delete</button>
          </p>
        ) : (
          <p title="Only drafts can be edited" className="mt-4 text-xs font-mono text-slate-400">
            Locked (only DRAFT editable)
          </p>
        )}
      </div>
    </div>
  )
}
