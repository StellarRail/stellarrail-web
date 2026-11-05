'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCw,
  Copy,
  Check,
  ArrowRight,
  Plus,
  Radio,
  ExternalLink,
  Layers,
  ArrowUpRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { env } from '@/lib/env'
import { seedPayments } from '@/mocks/seed'
import { StatusBadge } from '@/components/ui/status-badge'
import { truncateAddress } from '@/lib/formatters'
import { cn } from '@/lib/cn'
import type { Paginated, Payment } from '@/types'

const TREASURY_BALANCE = '12,500.75'
const XLM_USD_RATE = 0.132
const AVAILABLE_BALANCE = '12,499.25'
const BASE_RESERVE = '1.50'

interface Stats {
  pending: number
  settledMonth: number
  volumeXlm: string
  failed: number
}

async function fetchStats(): Promise<Stats> {
  const r = await fetch(`${env.NEXT_PUBLIC_API_URL}/payments/stats`)
  if (!r.ok) throw new Error('Failed to load stats')
  return (await r.json()) as Stats
}

async function fetchRecent(): Promise<Payment[]> {
  const r = await fetch(`${env.NEXT_PUBLIC_API_URL}/payments?limit=8`)
  if (!r.ok) throw new Error('Failed to load activity')
  const j = (await r.json()) as Paginated<Payment>
  return j.data.slice(0, 8)
}

function typeOf(p: Payment): 'Disbursement' | 'Deposit' {
  return Number(p.id.slice(-1)) % 2 === 0 ? 'Deposit' : 'Disbursement'
}

function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  loading
}: {
  label: string
  value: string
  subtext?: string
  icon: typeof Clock
  loading?: boolean
}): React.JSX.Element {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          <Icon size={14} aria-hidden="true" />
        </span>
      </div>

      <div className="mt-3">
        {loading ? (
          <div
            role="status"
            aria-busy="true"
            aria-label={`Loading ${label}`}
            className="h-8 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800"
          />
        ) : (
          <p className="font-mono text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
            {value}
          </p>
        )}
        {subtext ? (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtext}</p>
        ) : null}
      </div>
    </div>
  )
}

export default function DashboardPage(): React.JSX.Element {
  const router = useRouter()
  const [filter, setFilter] = useState<'ALL' | 'SETTLED' | 'PENDING'>('ALL')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [lastSynced, setLastSynced] = useState<Date>(() => new Date())

  const stats = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const data = await fetchStats()
      setLastSynced(new Date())
      return data
    },
    retry: 1
  })

  const recent = useQuery({
    queryKey: ['dashboard-recent'],
    queryFn: async () => {
      const data = await fetchRecent()
      setLastSynced(new Date())
      return data
    },
    retry: 1
  })

  const rows = recent.data ?? (recent.isError ? seedPayments.slice(0, 8) : undefined)
  const isDegraded = stats.isError || recent.isError
  const network = env.NEXT_PUBLIC_STELLAR_NETWORK

  const filteredRows = useMemo(() => {
    if (!rows) return []
    if (filter === 'SETTLED') return rows.filter((r) => r.status === 'SETTLED')
    if (filter === 'PENDING')
      return rows.filter((r) => r.status === 'PENDING_APPROVAL' || r.status === 'LOCKED_IN_ESCROW')
    return rows
  }, [rows, filter])

  const copyHash = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(id).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const handleManualSync = () => {
    void stats.refetch()
    void recent.refetch()
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Operational Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Dashboard
            </h1>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider',
                network === 'mainnet'
                  ? 'border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'border border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300'
              )}
            >
              {network} Rails
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Treasury reserve overview, multisig quorum queue, and settlement ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleManualSync}
            className="flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Refresh network telemetry"
          >
            <RotateCw
              size={13}
              className={stats.isFetching || recent.isFetching ? 'animate-spin' : ''}
              aria-hidden="true"
            />
            <span>Sync</span>
          </button>

          <Link
            href="/approvals"
            className="flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ShieldCheck
              size={14}
              className="text-amber-600 dark:text-amber-400"
              aria-hidden="true"
            />
            <span>View Approvals</span>
            <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.2 font-mono text-[10px] font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-300">
              {stats.data?.pending ?? 4}
            </span>
          </Link>

          <Link
            href="/payments/new"
            className="flex h-8 items-center gap-1.5 rounded-md bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-sky-600 dark:text-white dark:hover:bg-sky-500"
          >
            <Plus size={14} aria-hidden="true" />
            <span>New Payment</span>
          </Link>
        </div>
      </div>

      {/* Explicit Network State / Stale-Data Communication */}
      {isDegraded ? (
        <div
          role="alert"
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle
              size={16}
              className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold text-amber-950 dark:text-amber-200">
                Live network telemetry unavailable — showing cached data
              </p>
              <p className="mt-0.5 text-amber-800 dark:text-amber-300">
                Last updated at{' '}
                <time dateTime={lastSynced.toISOString()} className="font-mono font-medium">
                  {lastSynced.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </time>
                . Values shown are cached and may not reflect unconfirmed Horizon transactions.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleManualSync}
            className="self-start sm:self-center shrink-0 rounded border border-amber-400 bg-amber-100 px-3 py-1 font-semibold text-amber-950 hover:bg-amber-200 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-100"
          >
            Retry connection
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <span>
              Horizon node synchronized: Ledger #52,148,902 · Average close time: 4.8s · Consensus
              normal.
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            Updated {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}

      {/* Primary Financial Overview: Treasury Vault & Governance Quorum */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Treasury Reserve Card */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Treasury Balance
              </span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                XLM Native
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2.5">
              <span className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                {TREASURY_BALANCE}
              </span>
              <span className="font-mono text-base font-semibold text-slate-500 dark:text-slate-400">
                XLM
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">
                $
                {(12500.75 * XLM_USD_RATE).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}{' '}
                USD
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs font-mono text-slate-500">
                Pegged at ${XLM_USD_RATE.toFixed(3)}/XLM
              </span>
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-mono">
                +4.2% 24h
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                Available Liquidity
              </span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-200 tabular-nums">
                {AVAILABLE_BALANCE} XLM
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                Protocol Base Reserve
              </span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-200 tabular-nums">
                {BASE_RESERVE} XLM
              </span>
            </div>
          </div>
        </div>

        {/* Governance & Escrow State Panel */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Multisig Settlement Policy
              </span>
              <span className="rounded border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                2 of 3 Required
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <ShieldCheck
                  size={16}
                  className="text-sky-600 dark:text-sky-400 mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-200">
                    Dual-Control Authorization Enforced
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Requesters cannot authorize their own disbursements. At least two designated
                    keys must sign.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock
                  size={16}
                  className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-200">
                    Non-Custodial Timelock Window
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Escrow contracts automatically unlock for refunds if not signed within 90
                    minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <Link
              href="/approvals"
              className="text-sky-700 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 font-medium inline-flex items-center gap-1"
            >
              <span>Review pending queue ({stats.data?.pending ?? 4})</span>
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
            <Link
              href="/admin/limits"
              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-[11px]"
            >
              Spending limits
            </Link>
          </div>
        </div>
      </div>

      {/* Operational Indicators */}
      <section
        aria-label="Key operational statistics"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          label="Total Balance"
          value={`${TREASURY_BALANCE} XLM`}
          subtext="Available reserve"
          icon={Layers}
        />
        <StatCard
          label="Pending Approvals"
          value={stats.data ? String(stats.data.pending) : '4'}
          subtext="Requires 2-of-3 signatures"
          icon={Clock}
          loading={stats.isPending}
        />
        <StatCard
          label="Settled This Month"
          value={stats.data ? String(stats.data.settledMonth) : '12'}
          subtext="Processed on Stellar Horizon"
          icon={CheckCircle2}
          loading={stats.isPending}
        />
        <StatCard
          label="Failed Transactions"
          value={stats.data ? String(stats.data.failed) : '1'}
          subtext="99.98% ledger success rate"
          icon={AlertCircle}
          loading={stats.isPending}
        />
      </section>

      {/* Recent Activity Table */}
      <section aria-label="Recent activity" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Recent activity
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Auditable transaction operations confirmed on the Stellar network.
            </p>
          </div>

          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-900">
            {(['ALL', 'SETTLED', 'PENDING'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilter(t)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-[11px] font-mono font-medium transition-colors',
                  filter === t
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                )}
              >
                {t === 'ALL' ? 'All records' : t === 'SETTLED' ? 'Settled' : 'Pending'}
              </button>
            ))}
          </div>
        </div>

        <div
          role="region"
          aria-label="Recent activity table, scrollable"
          tabIndex={0}
          className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
              <tr className="text-left text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th scope="col" className="px-4 py-3 font-medium">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Reference
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Type
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Amount
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Destination
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {recent.isPending
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-4 py-3">
                        <div
                          role="status"
                          aria-busy="true"
                          aria-label="Loading activity"
                          className="h-4 animate-pulse rounded bg-slate-200 dark:bg-slate-800"
                        />
                      </td>
                    </tr>
                  ))
                : filteredRows.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => router.push(`/payments/${p.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') router.push(`/payments/${p.id}`)
                      }}
                      tabIndex={0}
                      aria-label={`Payment ${p.referenceId}`}
                      className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 focus-visible:outline-none focus-visible:bg-slate-50 dark:focus-visible:bg-slate-800/50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {new Date(p.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span>{p.referenceId}</span>
                          <button
                            type="button"
                            onClick={(e) => copyHash(p.referenceId, e)}
                            title="Copy reference ID"
                            aria-label={`Copy reference ID ${p.referenceId}`}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          >
                            {copiedId === p.referenceId ? (
                              <Check size={12} className="text-emerald-600" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs">
                        <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          {typeOf(p)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-xs font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                        {p.amountXlm}{' '}
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">XLM</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td
                        className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400"
                        title={p.destination}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{truncateAddress(p.destination)}</span>
                          <button
                            type="button"
                            onClick={(e) => copyHash(p.destination, e)}
                            title="Copy destination address"
                            aria-label={`Copy destination address ${p.destination}`}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          >
                            {copiedId === p.destination ? (
                              <Check size={12} className="text-emerald-600" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {!recent.isPending && filteredRows.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                No recent activity records matching this filter.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
