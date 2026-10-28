'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Plus,
  Filter,
  Calendar,
  Layers,
  Copy,
  Check
} from 'lucide-react'
import { env } from '@/lib/env'
import { seedPayments } from '@/mocks/seed'
import { StatusBadge } from '@/components/ui/status-badge'
import { truncateAddress } from '@/lib/formatters'
import { cn } from '@/lib/cn'
import type { Paginated, Payment, PaymentStatus } from '@/types'
import { NewPaymentModal } from '@/components/payments/new-payment-modal'

const PAGE_SIZE = 8

async function fetchPayments(): Promise<Payment[]> {
  const r = await fetch(`${env.NEXT_PUBLIC_API_URL}/payments?limit=100`)
  if (!r.ok) throw new Error('Failed to load payments')
  const j = (await r.json()) as Paginated<Payment>
  return j.data
}

type SortKey = 'createdAt' | 'amountXlm'
type SortDir = 'asc' | 'desc'

function inRange(p: Payment, range: string): boolean {
  if (range === 'all') return true
  const hours = range === '24h' ? 24 : range === '7d' ? 24 * 7 : 24 * 30
  return Date.now() - new Date(p.createdAt).getTime() <= hours * 3600_000
}

export default function PaymentsPage(): React.JSX.Element {
  const router = useRouter()
  const [status, setStatus] = useState<'' | PaymentStatus>('')
  const [range, setRange] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(0)
  const [modal, setModal] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const query = useQuery({ queryKey: ['payments'], queryFn: fetchPayments, retry: 1 })
  const all = query.data ?? (query.isError ? seedPayments : undefined)

  const rows = useMemo(() => {
    let r = (all ?? []).filter((p) => (!status || p.status === status) && inRange(p, range))
    r = [...r].sort((a, b) => {
      const av = sortKey === 'amountXlm' ? Number(a.amountXlm) : new Date(a.createdAt).getTime()
      const bv = sortKey === 'amountXlm' ? Number(b.amountXlm) : new Date(b.createdAt).getTime()
      return sortDir === 'asc' ? av - bv : bv - av
    })
    return r
  }, [all, status, range, sortKey, sortDir])

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const current = Math.min(page, pages - 1)
  const visible = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE)

  const toggleSort = (key: SortKey): void => {
    setPage(0)
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const copyHash = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(id).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const SortIcon = ({ k }: { k: SortKey }): React.JSX.Element => {
    if (sortKey !== k)
      return (
        <ArrowUpDown
          size={14}
          strokeWidth={1.5}
          aria-hidden="true"
          className="text-slate-400 dark:text-slate-500"
        />
      )
    return sortDir === 'asc' ? (
      <ArrowUp
        size={14}
        strokeWidth={2}
        aria-hidden="true"
        className="text-brand dark:text-stellar-400"
      />
    ) : (
      <ArrowDown
        size={14}
        strokeWidth={2}
        aria-hidden="true"
        className="text-brand dark:text-stellar-400"
      />
    )
  }

  const th =
    'px-4 py-2.5 text-left text-[11px] font-mono font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400'

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line/60 pb-4 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-ink dark:text-white font-display">
              Payments
            </h1>
            <span className="rounded-full border border-line bg-slate-100 px-2 py-0.2 font-mono text-[10px] font-semibold text-slate-600 dark:border-white/10 dark:bg-navy-800 dark:text-slate-300">
              {rows.length} Total
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Immutable settlement audit trail across testnet and mainnet rails.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModal(true)}
          className="tactile-btn inline-flex h-8 items-center gap-1.5 rounded-md bg-navy-900 px-3 text-xs font-semibold text-white shadow-subtle hover:bg-navy-800 dark:bg-stellar-500 dark:text-navy-950 dark:hover:bg-stellar-400 self-start sm:self-auto"
        >
          <Plus size={14} strokeWidth={2} aria-hidden="true" />
          <span>New Payment</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div
        role="search"
        aria-label="Filter payments"
        className="flex flex-wrap items-center gap-3 rounded-xl border border-line/80 bg-white p-3 shadow-subtle dark:border-white/10 dark:bg-navy-900"
      >
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mr-2">
          <Filter size={14} strokeWidth={1.5} />
          <span>Filters:</span>
        </div>

        <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <span className="font-mono text-[11px] text-slate-400">Status</span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as '' | PaymentStatus)
              setPage(0)
            }}
            className="h-8 rounded-md border border-line bg-slate-50 px-2.5 text-xs text-ink outline-none transition-colors hover:border-slate-300 dark:border-white/10 dark:bg-navy-800 dark:text-slate-200"
          >
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_APPROVAL">Pending approval</option>
            <option value="SETTLED">Settled</option>
            <option value="REFUNDED">Refunded</option>
            <option value="FAILED">Failed</option>
          </select>
        </label>

        <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <span className="font-mono text-[11px] text-slate-400">Timeframe</span>
          <select
            value={range}
            onChange={(e) => {
              setRange(e.target.value)
              setPage(0)
            }}
            className="h-8 rounded-md border border-line bg-slate-50 px-2.5 text-xs text-ink outline-none transition-colors hover:border-slate-300 dark:border-white/10 dark:bg-navy-800 dark:text-slate-200"
          >
            <option value="all">All time</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </label>

        <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <span className="font-mono text-[11px] text-slate-400">Asset</span>
          <select
            aria-label="Asset"
            disabled
            value="XLM"
            className="h-8 rounded-md border border-line/60 bg-slate-100/80 px-2 text-xs text-slate-400 dark:border-white/5 dark:bg-navy-800/40 dark:text-slate-500 cursor-not-allowed"
          >
            <option value="XLM">Stellar Lumens (XLM)</option>
          </select>
        </label>
      </div>

      {/* Table Container */}
      <div
        role="region"
        aria-label="Payments table, scrollable"
        tabIndex={0}
        className="overflow-x-auto rounded-xl border border-line/80 bg-white shadow-subtle dark:border-white/10 dark:bg-navy-900/90"
      >
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-50/90 dark:bg-navy-950/90 backdrop-blur-sm border-b border-line dark:border-white/10">
            <tr>
              <th scope="col" className={th}>
                Reference
              </th>
              <th
                scope="col"
                aria-sort={
                  sortKey === 'createdAt'
                    ? sortDir === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
                className={th}
              >
                <button
                  type="button"
                  onClick={() => toggleSort('createdAt')}
                  className="tactile-btn inline-flex items-center gap-1 uppercase hover:text-ink dark:hover:text-white"
                >
                  <span>Date</span> <SortIcon k="createdAt" />
                </button>
              </th>
              <th
                scope="col"
                aria-sort={
                  sortKey === 'amountXlm'
                    ? sortDir === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
                className={cn(th, 'text-right')}
              >
                <button
                  type="button"
                  onClick={() => toggleSort('amountXlm')}
                  className="tactile-btn inline-flex items-center gap-1 uppercase hover:text-ink dark:hover:text-white ml-auto"
                >
                  <span>Amount</span> <SortIcon k="amountXlm" />
                </button>
              </th>
              <th scope="col" className={th}>
                Status
              </th>
              <th scope="col" className={th}>
                Destination
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60 dark:divide-white/5">
            {query.isPending
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3">
                      <div
                        role="status"
                        aria-busy="true"
                        aria-label="Loading payments"
                        className="h-4 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800/80"
                      />
                    </td>
                  </tr>
                ))
              : visible.map((p) => (
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
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-ink dark:text-slate-100">
                      {p.referenceId}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
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
                      <div className="flex items-center gap-1.5">
                        <span>{truncateAddress(p.destination)}</span>
                        <button
                          type="button"
                          onClick={(e) => copyHash(p.destination, e)}
                          title="Copy destination address"
                          aria-label={`Copy address ${p.destination}`}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                          {copiedId === p.destination ? (
                            <Check size={12} className="text-emerald-500" />
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
        {!query.isPending && visible.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="font-mono text-xs text-slate-400 dark:text-slate-500">
              No payments match these filters.
            </p>
          </div>
        ) : null}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t border-line/60 pt-3 text-xs dark:border-white/10">
        <span aria-live="polite" className="font-mono text-slate-500 dark:text-slate-400">
          Page {current + 1} of {pages}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={current === 0}
            onClick={() => setPage((p) => p - 1)}
            aria-label="Previous page"
            className="tactile-btn h-8 rounded-md border border-line bg-white px-3 font-medium text-ink shadow-subtle hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-white/10 dark:bg-navy-900 dark:text-slate-200 dark:hover:bg-white/5"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={current >= pages - 1}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Next page"
            className="tactile-btn h-8 rounded-md border border-line bg-white px-3 font-medium text-ink shadow-subtle hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-white/10 dark:bg-navy-900 dark:text-slate-200 dark:hover:bg-white/5"
          >
            Next
          </button>
        </div>
      </div>

      <NewPaymentModal open={modal} onClose={() => setModal(false)} />
    </div>
  )
}
