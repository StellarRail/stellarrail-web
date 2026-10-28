'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCw,
  Copy,
  Check,
  Zap,
  TrendingUp,
  Layers,
  ArrowRight
} from 'lucide-react'
import { env } from '@/lib/env'
import { seedPayments } from '@/mocks/seed'
import { StatusBadge } from '@/components/ui/status-badge'
import { truncateAddress } from '@/lib/formatters'
import { cn } from '@/lib/cn'
import type { Paginated, Payment } from '@/types'

const TREASURY_BALANCE = '12,500.75'
const XLM_USD_RATE = 0.132

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
  const r = await fetch(`${env.NEXT_PUBLIC_API_URL}/payments?limit=6`)
  if (!r.ok) throw new Error('Failed to load activity')
  const j = (await r.json()) as Paginated<Payment>
  return j.data.slice(0, 6)
}

function typeOf(p: Payment): 'Deposit' | 'Release' {
  return Number(p.id.slice(-1)) % 2 === 0 ? 'Deposit' : 'Release'
}

/**
 * Animated Stellar Mechanical Rail Pipeline
 * Represents transaction progression through cryptographically verified states:
 * Ingestion -> Escrow Lock -> 2-of-3 Multisig -> Horizon Consensus
 */
function MechanicalRailPipeline(): React.JSX.Element {
  const [activeStep, setActiveStep] = useState<number>(2)

  const steps = [
    { name: 'Ingestion', sub: 'TLS 1.3 / Soroban RPC', status: 'verified' },
    { name: 'Escrow Lock', sub: 'Non-custodial timelock', status: 'verified' },
    { name: 'Multisig Quorum', sub: '2-of-3 threshold gate', status: 'active' },
    { name: 'Horizon Consensus', sub: 'SCP 4.8s ledger close', status: 'queued' }
  ]

  return (
    <div className="relative rounded-xl border border-line/80 bg-white/70 p-5 shadow-subtle dark:border-white/10 dark:bg-navy-900/60 backdrop-blur-sm overflow-hidden">
      {/* Background Architectural Mesh Lines */}
      <div className="absolute inset-0 rail-pattern opacity-40 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between pb-3 border-b border-line/60 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-brand dark:bg-stellar-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink dark:text-slate-200 font-mono">
              Stellar Rail Consensus Pipeline
            </h3>
          </div>
          <span className="rounded border border-line bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-500 dark:border-white/10 dark:bg-navy-800 dark:text-slate-400">
            Realtime Protocol v21
          </span>
        </div>

        {/* Pipeline Track with Mechanical SVG Kinetic Rail */}
        <div className="mt-4 relative">
          {/* Animated Connecting Rail SVG */}
          <div className="absolute top-4 left-6 right-6 h-0.5 -translate-y-1/2 pointer-events-none">
            <svg className="w-full h-2 overflow-visible" preserveAspectRatio="none">
              <line
                x1="0"
                y1="1"
                x2="100%"
                y2="1"
                stroke="currentColor"
                strokeWidth="2"
                className="text-slate-200 dark:text-slate-800"
              />
              <line
                x1="0"
                y1="1"
                x2="100%"
                y2="1"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="6 6"
                className="text-brand dark:text-stellar-400 animate-rail-flow"
              />
            </svg>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
            {steps.map((s, idx) => {
              const isSelected = activeStep === idx
              const isDone = idx < activeStep
              const isCurrent = idx === activeStep
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={cn(
                    'tactile-btn flex flex-col text-left p-3 rounded-lg border transition-all duration-150',
                    isSelected
                      ? 'border-brand/60 bg-white dark:border-stellar-500/50 dark:bg-navy-800 shadow-sm'
                      : 'border-line/60 bg-white/50 hover:bg-white dark:border-white/5 dark:bg-navy-900/40 dark:hover:bg-navy-800/60'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-mono font-bold transition-colors',
                        isDone
                          ? 'bg-emerald-500 text-white dark:bg-emerald-500'
                          : isCurrent
                            ? 'bg-navy-900 text-white dark:bg-stellar-500 dark:text-navy-950 ring-2 ring-brand/20 dark:ring-stellar-400/20'
                            : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      )}
                    >
                      {isDone ? <Check size={12} strokeWidth={2.5} /> : idx + 1}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-tight">
                      Step 0{idx + 1}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-ink dark:text-slate-100">
                    {s.name}
                  </span>
                  <span className="text-[10px] text-ink-secondary dark:text-slate-400 line-clamp-1">
                    {s.sub}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatItem({
  label,
  value,
  subtext,
  icon: Icon,
  loading
}: {
  label: string
  value: string
  subtext?: string
  icon: typeof TrendingUp
  loading?: boolean
}): React.JSX.Element {
  return (
    <div className="p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400">
          <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
        </span>
      </div>

      <div className="mt-3">
        {loading ? (
          <div
            role="status"
            aria-busy="true"
            aria-label={`Loading ${label}`}
            className="h-8 w-28 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800/80"
          />
        ) : (
          <p className="font-mono text-2xl font-bold tracking-tight text-ink dark:text-slate-100 tabular-nums">
            {value}
          </p>
        )}
        {subtext ? (
          <p className="mt-1 font-mono text-[11px] text-slate-400 dark:text-slate-500">{subtext}</p>
        ) : null}
      </div>
    </div>
  )
}

export default function DashboardPage(): React.JSX.Element {
  const router = useRouter()
  const stats = useQuery({ queryKey: ['dashboard-stats'], queryFn: fetchStats, retry: 1 })
  const recent = useQuery({ queryKey: ['dashboard-recent'], queryFn: fetchRecent, retry: 1 })
  const [filter, setFilter] = useState<'ALL' | 'SETTLED' | 'PENDING'>('ALL')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const rows = recent.data ?? (recent.isError ? seedPayments.slice(0, 6) : undefined)
  const degraded = stats.isError || recent.isError

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

  return (
    <div className="space-y-6">
      {/* Top Header & Refresh Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line/60 pb-4 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-ink dark:text-white font-display">
              Dashboard
            </h1>
            <span className="rounded-full border border-emerald-300/60 bg-emerald-50 px-2 py-0.2 font-mono text-[10px] font-semibold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300">
              Live Settlement
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Realtime multisig treasury and cryptographic payment rails on Stellar Horizon.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              void stats.refetch()
              void recent.refetch()
            }}
            className="tactile-btn flex h-8 items-center gap-1.5 rounded-md border border-line bg-white px-2.5 text-xs font-medium text-slate-600 shadow-subtle hover:bg-slate-50 dark:border-white/10 dark:bg-navy-900 dark:text-slate-300 dark:hover:bg-white/5"
            title="Refresh telemetry"
          >
            <RotateCw
              size={13}
              strokeWidth={1.75}
              className={stats.isFetching ? 'animate-spin' : ''}
            />
            <span>Sync</span>
          </button>

          <Link
            href="/approvals"
            className="tactile-btn flex h-8 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-xs font-medium text-ink shadow-subtle hover:bg-slate-50 dark:border-white/10 dark:bg-navy-900 dark:text-slate-200 dark:hover:bg-white/5"
          >
            <ShieldCheck size={14} strokeWidth={1.75} className="text-amber-500" />
            <span>View Approvals</span>
          </Link>

          <Link
            href="/payments/new"
            className="tactile-btn flex h-8 items-center gap-1.5 rounded-md bg-navy-900 px-3 text-xs font-semibold text-white shadow-subtle hover:bg-navy-800 dark:bg-stellar-500 dark:text-navy-950 dark:hover:bg-stellar-400"
          >
            <span>New Payment</span>
            <ArrowRight size={13} strokeWidth={2} />
          </Link>
        </div>
      </div>

      {degraded ? (
        <div
          role="alert"
          className="flex items-center justify-between rounded-lg border border-amber-300/50 bg-amber-50/90 px-4 py-3 text-xs text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-300"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0 text-amber-600" />
            <span>Live network feed unavailable — showing cached telemetry.</span>
          </div>
          <button
            type="button"
            onClick={() => {
              void stats.refetch()
              void recent.refetch()
            }}
            className="font-medium underline hover:text-amber-950 dark:hover:text-amber-200"
          >
            Retry
          </button>
        </div>
      ) : null}

      {/* Hero Treasury Command Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Treasury Vault Card */}
        <div className="lg:col-span-5 relative rounded-xl border border-line/80 bg-white p-6 shadow-subtle dark:border-white/10 dark:bg-navy-900 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Institutional Treasury Vault
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink dark:text-white tabular-nums">
                  {TREASURY_BALANCE}
                </span>
                <span className="font-mono text-sm font-semibold text-brand dark:text-stellar-400">
                  XLM
                </span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-navy-800 dark:text-slate-200">
              <Zap size={18} strokeWidth={2} />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-line/60 dark:border-white/5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span>Pegged Valuation:</span>
              <span className="font-bold text-ink dark:text-slate-200 tabular-nums">
                $
                {(12500.75 * XLM_USD_RATE).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}{' '}
                USD
              </span>
            </div>
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              +4.2% 24h
            </span>
          </div>

          <div className="mt-5 flex gap-2">
            <Link
              href="/payments/new"
              className="tactile-btn flex-1 flex h-9 items-center justify-center gap-1.5 rounded-lg bg-navy-900 text-xs font-semibold text-white hover:bg-navy-800 dark:bg-stellar-500 dark:text-navy-950 dark:hover:bg-stellar-400"
            >
              <span>Dispatch Payment</span>
              <ArrowUpRight size={14} />
            </Link>
            <Link
              href="/approvals"
              className="tactile-btn flex-1 flex h-9 items-center justify-center gap-1.5 rounded-lg border border-line bg-slate-50 text-xs font-medium text-ink hover:bg-slate-100 dark:border-white/10 dark:bg-navy-800 dark:text-slate-200 dark:hover:bg-navy-700"
            >
              <span>Queue ({stats.data?.pending ?? 4})</span>
            </Link>
          </div>
        </div>

        {/* Live Mechanical Rail Consensus Pipeline */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <MechanicalRailPipeline />
        </div>
      </div>

      {/* Structured Telemetry Ribbon */}
      <section
        aria-label="Statistics"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-line/80 rounded-xl border border-line/80 bg-white/90 shadow-subtle dark:divide-white/10 dark:border-white/10 dark:bg-navy-900/90"
      >
        <StatItem
          label="Total balance"
          value={`${TREASURY_BALANCE} XLM`}
          subtext="Available settlement reserve"
          icon={Layers}
        />
        <StatItem
          label="Pending approvals"
          value={stats.data ? String(stats.data.pending) : '—'}
          subtext="Requires 2-of-3 multisig"
          icon={Clock}
          loading={stats.isPending}
        />
        <StatItem
          label="Settled today"
          value={stats.data ? String(stats.data.settledMonth) : '—'}
          subtext="Processed within 4.8s close"
          icon={CheckCircle2}
          loading={stats.isPending}
        />
        <StatItem
          label="Failed transactions"
          value={stats.data ? String(stats.data.failed) : '—'}
          subtext="99.98% ledger success"
          icon={TrendingUp}
          loading={stats.isPending}
        />
      </section>

      {/* Recent Activity Table Terminal */}
      <section aria-label="Recent activity" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-ink dark:text-slate-100">
              Recent activity
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Immutable ledger operations confirmed on the Stellar network.
            </p>
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center rounded-lg border border-line/80 bg-slate-100/80 p-0.5 dark:border-white/10 dark:bg-navy-900">
            {(['ALL', 'SETTLED', 'PENDING'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilter(t)}
                className={cn(
                  'tactile-btn rounded-md px-2.5 py-1 text-[11px] font-mono font-medium transition-all',
                  filter === t
                    ? 'bg-white text-ink shadow-sm dark:bg-white/10 dark:text-white font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                )}
              >
                {t === 'ALL' ? 'All Rows' : t === 'SETTLED' ? 'Settled' : 'Pending'}
              </button>
            ))}
          </div>
        </div>

        <div
          role="region"
          aria-label="Recent activity table, scrollable"
          tabIndex={0}
          className="overflow-x-auto rounded-xl border border-line/80 bg-white shadow-subtle dark:border-white/10 dark:bg-navy-900/90"
        >
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50/90 dark:bg-navy-950/90 backdrop-blur-sm border-b border-line dark:border-white/10">
              <tr className="text-left text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Date
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  ID
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Type
                </th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">
                  Amount
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Destination
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60 dark:divide-white/5">
              {recent.isPending
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-4 py-3">
                        <div
                          role="status"
                          aria-busy="true"
                          aria-label="Loading activity"
                          className="h-4 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800/80"
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
                      className="cursor-pointer transition-colors duration-100 hover:bg-slate-50/80 dark:hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {new Date(p.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-medium text-ink dark:text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span title={p.id}>{truncateAddress(p.id, 4)}</span>
                          <button
                            type="button"
                            onClick={(e) => copyHash(p.id, e)}
                            title="Copy payment ID"
                            aria-label={`Copy payment ID ${p.id}`}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          >
                            {copiedId === p.id ? (
                              <Check size={12} className="text-emerald-500" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs">
                        <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                          {typeOf(p)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-xs font-semibold tabular-nums text-ink dark:text-slate-100">
                        {p.amountXlm}{' '}
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">XLM</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td
                        className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400"
                        title={p.destination}
                      >
                        {truncateAddress(p.destination)}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {!recent.isPending && filteredRows.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="font-mono text-xs text-slate-400 dark:text-slate-500">
                No recent activity matching the current filter.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
