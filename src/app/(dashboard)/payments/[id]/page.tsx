'use client'
import { use, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Clock,
  Lock,
  Layers,
  FileText,
  AlertTriangle,
  QrCode
} from 'lucide-react'
import { seedPayments } from '@/mocks/seed'
import { AddressLine, TxLink, CopyButton } from '@/components/payments/address-helpers'
import { usePaymentStatus, useCountdown } from '@/hooks/hooks'
import { StatusBadge } from '@/components/ui/status-badge'
import { truncateAddress, explorerAccountUrl, explorerTxUrl } from '@/lib/formatters'
import { env } from '@/lib/env'
import { cn } from '@/lib/cn'

const QrModal = dynamic(() => import('@/components/payments/QrModal'), { ssr: false })

export default function PaymentDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}): React.JSX.Element {
  const { id } = use(params)
  const found = seedPayments.find((p) => p.id === id) ?? seedPayments[0]!
  const { status, live } = usePaymentStatus(found.id, found.status)
  const { label, state } = useCountdown(found.deadline)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const network = env.NEXT_PUBLIC_STELLAR_NETWORK

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1500)
  }

  // Lifecycle stage mapping
  const stages = [
    { key: 'DRAFT', label: 'Draft Created' },
    { key: 'LOCKED_IN_ESCROW', label: 'Locked in Escrow' },
    { key: 'PENDING_APPROVAL', label: 'Multisig Quorum' },
    { key: 'SETTLED', label: 'Ledger Settled' }
  ]

  const getStageIndex = (st: string) => {
    if (st === 'DRAFT') return 0
    if (st === 'LOCKED_IN_ESCROW') return 1
    if (st === 'PENDING_APPROVAL') return 2
    if (st === 'SETTLING' || st === 'SETTLED') return 3
    return 1
  }

  const currentStageIndex = getStageIndex(status)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/payments"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Back to Payments Ledger</span>
        </Link>
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">ID: {found.id}</span>
      </div>

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Audit Ledger Record
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            Payment {found.referenceId}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span
              className={cn(
                'inline-flex items-center gap-1 font-mono font-medium',
                live ? 'text-sky-700 dark:text-sky-400' : 'text-slate-600 dark:text-slate-400'
              )}
            >
              {live ? '● Live Telemetry' : '○ Terminal Ledger State'}
            </span>
            <span>·</span>
            <span>Created on {new Date(found.createdAt).toLocaleDateString()}</span>
            {found.deadline && status !== 'SETTLED' ? (
              <>
                <span>·</span>
                <span>
                  Escrow Expiry:{' '}
                  <span
                    className={cn(
                      'font-mono font-semibold',
                      state === 'soon'
                        ? 'text-amber-700 dark:text-amber-400'
                        : state === 'expired'
                          ? 'text-rose-700 dark:text-rose-400'
                          : 'text-slate-700 dark:text-slate-300'
                    )}
                  >
                    {label}
                  </span>{' '}
                  <span className="text-[11px] text-slate-500">(auto-refundable)</span>
                </span>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={status as never} className="text-xs px-3 py-1" />
          <QrModal address={found.destination} />
        </div>
      </div>

      {/* Consensus Lifecycle Progress Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono mb-3">
          Consensus &amp; Escrow Progression
        </h2>
        <ol className="grid grid-cols-2 sm:grid-cols-4 gap-2" aria-label="Lifecycle stages">
          {stages.map((st, idx) => {
            const isCompleted = idx <= currentStageIndex
            const isCurrent = idx === currentStageIndex
            return (
              <li
                key={st.key}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-md border p-2.5 text-xs font-mono transition-colors',
                  isCurrent
                    ? 'border-sky-600 bg-sky-50/70 font-semibold text-slate-900 dark:border-sky-500 dark:bg-slate-800 dark:text-white'
                    : isCompleted
                      ? 'border-emerald-300 bg-emerald-50/60 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-600'
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  )}
                >
                  {isCompleted ? '✓' : idx + 1}
                </span>
                <span className="truncate">{st.label}</span>
              </li>
            )
          })}
        </ol>
      </div>

      {/* Core Payment Details Grid */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono mb-4">
          Transaction Parameters
        </h2>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Amount */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Disbursement Amount
            </dt>
            <dd className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {found.amountXlm} <span className="text-xs font-medium text-slate-500">XLM</span>
            </dd>
          </div>

          {/* Status */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Current Ledger Status
            </dt>
            <dd className="mt-1">
              <StatusBadge status={status as never} />
            </dd>
          </div>

          {/* Destination Address (Full & Truncated) */}
          <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex items-center justify-between mb-1">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Destination Address (Stellar Public Key)
              </dt>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => copyToClipboard(found.destination, 'dest')}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  {copiedKey === 'dest' ? (
                    <>
                      <Check size={12} className="text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy Full Address</span>
                    </>
                  )}
                </button>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <a
                  href={explorerAccountUrl(network, found.destination)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-700 hover:underline dark:text-sky-400"
                >
                  <span>Stellar Explorer</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
            <dd className="font-mono text-xs text-slate-900 dark:text-slate-100 break-all select-all mt-1">
              {found.destination}
            </dd>
          </div>

          {/* Reference & Memo */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Internal Reference ID
            </dt>
            <dd className="mt-1 font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
              {found.referenceId}
            </dd>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Audit Memo
            </dt>
            <dd className="mt-1 text-xs text-slate-900 dark:text-slate-100">
              {found.memo ?? 'None attached'}
            </dd>
          </div>

          {/* Requester Identity */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Created By (Requester)
            </dt>
            <dd className="mt-1 text-xs font-medium text-slate-900 dark:text-slate-100">
              {found.requesterEmail ?? found.requesterId}
            </dd>
          </div>

          {/* Escrow Contract ID */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Escrow Contract ID
            </dt>
            <dd className="mt-1 font-mono text-xs text-slate-900 dark:text-slate-100 break-all">
              {found.escrowContractId ?? 'Not required (Direct payment)'}
            </dd>
          </div>

          {/* Lock Tx Hash */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Escrow Lock Tx Hash
            </dt>
            <dd className="mt-1 font-mono text-xs text-slate-900 dark:text-slate-100 break-all">
              {found.lockTxHash ? (
                <a
                  href={explorerTxUrl(network, found.lockTxHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-700 hover:underline dark:text-sky-400 inline-flex items-center gap-1"
                >
                  <span>{truncateAddress(found.lockTxHash, 10)}</span>
                  <ExternalLink size={11} />
                </a>
              ) : (
                '—'
              )}
            </dd>
          </div>

          {/* Settlement Tx Hash */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Ledger Settlement Tx Hash
            </dt>
            <dd className="mt-1 font-mono text-xs text-slate-900 dark:text-slate-100 break-all">
              {found.settleTxHash ? (
                <a
                  href={explorerTxUrl(network, found.settleTxHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 hover:underline dark:text-emerald-400 inline-flex items-center gap-1"
                >
                  <span>{truncateAddress(found.settleTxHash, 10)}</span>
                  <ExternalLink size={11} />
                </a>
              ) : (
                <span className="text-slate-400">Awaiting quorum release</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
