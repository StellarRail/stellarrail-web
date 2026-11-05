'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Plus,
  Filter,
  Search,
  Copy,
  Check,
  ExternalLink,
  RotateCw,
  AlertTriangle,
  X
} from 'lucide-react'
import { env } from '@/lib/env'
import { seedPayments } from '@/mocks/seed'
import { StatusBadge } from '@/components/ui/status-badge'
import { truncateAddress, explorerAccountUrl } from '@/lib/formatters'
import { cn } from '@/lib/cn'
import type { Paginated, Payment, PaymentStatus } from '@/types'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState<'' | PaymentStatus>('')
  const [range, setRange] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(0)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const query = useQuery({ queryKey: ['payments'], queryFn: fetchPayments, retry: 1 })
  const all = query.data ?? (query.isError ? seedPayments : undefined)
  const network = env.NEXT_PUBLIC_STELLAR_NETWORK

  const filteredRows = useMemo(() => {
    let r = all ?? []
    if (status) r = r.filter((p) => p.status === status)
    if (range !== 'all') r = r.filter((p) => inRange(p, range))
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      r = r.filter(
        (p) =>
          p.referenceId.toLowerCase().includes(q) ||
          p.destination.toLowerCase().includes(q) ||
          (p.memo && p.memo.toLowerCase().includes(q))
      )
    }

    return [...r].sort((a, b) => {
      const av = sortKey === 'amountXlm' ? Number(a.amountXlm) : new Date(a.createdAt).getTime()
      const bv = sortKey === 'amountXlm' ? Number(b.amountXlm) : new Date(b.createdAt).getTime()
      return sortDir === 'asc' ? av - bv : bv - av
    })
  }, [all, status, range, searchTerm, sortKey, sortDir])

  const pages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  const current = Math.min(page, pages - 1)
  const visible = filteredRows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE)

  const toggleSort = (key: SortKey): void => {
    setPage(0)
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const copyText = (text: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedId(text)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const resetFilters = () => {
    setSearchTerm('')
    setStatus('')
    setRange('all')
    setPage(0)
  }

  const hasActiveFilters = Boolean(searchTerm || status || range !== 'all')

  const SortIcon = ({ k }: { k: SortKey }): React.JSX.Element => {
    if (sortKey !== k)
      return <ArrowUpDown size={13} className="text-slate-400" aria-hidden="true" />
    return sortDir === 'asc' ? (
      <ArrowUp size={13} className="text-sky-600 dark:text-sky-400" aria-hidden="true" />
    ) : (
      <ArrowDown size={13} className="text-sky-600 dark:text-sky-400" aria-hidden="true" />
    )
  }

  const th =
    'px-4 py-3 text-left text-[11px] font-mono font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Payments
            </h1>
            <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.2 font-mono text-[10px] font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
              {filteredRows.length} {filteredRows.length === 1 ? 'Record' : 'Records'}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Immutable settlement audit trail across testnet and mainnet Horizon ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Refresh payments list"
          >
            <RotateCw
              size={13}
              className={query.isFetching ? 'animate-spin' : ''}
              aria-hidden="true"
            />
            <span>Refresh</span>
          </button>

          <Link
            href="/payments/new"
            className="flex h-8 items-center gap-1.5 rounded-md bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-sky-600 dark:text-white dark:hover:bg-sky-500"
          >
            <Plus size={14} aria-hidden="true" />
            <span>New Payment</span>
          </Link>
        </div>
      </div>

      {query.isError ? (
        <div
          role="alert"
          className="flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-600 shrink-0" aria-hidden="true" />
            <span>Live payments ledger unavailable — displaying cached records.</span>
          </div>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="font-semibold underline hover:text-amber-950 dark:hover:text-amber-200"
          >
            Retry
          </button>
        </div>
      ) : null}

      {/* Scannable & Sortable Filter Toolbar */}
      <div
        role="search"
        aria-label="Filter payments"
        className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(0)
            }}
            placeholder="Search by reference, destination address, or memo..."
            aria-label="Search payments"
            className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Status Filter */}
        <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">Status</span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as '' | PaymentStatus)
              setPage(0)
            }}
            className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="LOCKED_IN_ESCROW">Escrowed</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="SETTLING">Settling</option>
            <option value="SETTLED">Settled</option>
            <option value="REFUNDED">Refunded</option>
            <option value="FAILED">Failed</option>
          </select>
        </label>

        {/* Timeframe Filter */}
        <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">Period</span>
          <select
            value={range}
            onChange={(e) => {
              setRange(e.target.value)
              setPage(0)
            }}
            className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="all">All time</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </label>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <X size={13} aria-hidden="true" />
            <span>Clear filters</span>
          </button>
        ) : null}
      </div>

      {/* Ledger Table */}
      <div
        role="region"
        aria-label="Payments ledger table, scrollable"
        tabIndex={0}
        className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
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
                  className="inline-flex items-center gap-1 uppercase hover:text-slate-900 dark:hover:text-slate-100"
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
                  className="inline-flex items-center gap-1 uppercase hover:text-slate-900 dark:hover:text-slate-100 ml-auto"
                >
                  <span>Amount</span> <SortIcon k="amountXlm" />
                </button>
              </th>
              <th scope="col" className={th}>
                Status
              </th>
              <th scope="col" className={th}>
                Destination Address
              </th>
              <th scope="col" className={th}>
                Memo
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {query.isPending
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <div
                        role="status"
                        aria-busy="true"
                        aria-label="Loading payment records"
                        className="h-4 animate-pulse rounded bg-slate-200 dark:bg-slate-800"
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
                    aria-label={`Payment reference ${p.referenceId}`}
                    className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 focus-visible:outline-none focus-visible:bg-slate-50 dark:focus-visible:bg-slate-800/50"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span>{p.referenceId}</span>
                        <button
                          type="button"
                          onClick={(e) => copyText(p.referenceId, e)}
                          title="Copy reference note"
                          aria-label={`Copy reference note ${p.referenceId}`}
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
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
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
                          onClick={(e) => copyText(p.destination, e)}
                          title="Copy destination address"
                          aria-label={`Copy address ${p.destination}`}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                          {copiedId === p.destination ? (
                            <Check size={12} className="text-emerald-600" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                        <a
                          href={explorerAccountUrl(network, p.destination)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="View on Stellar Explorer"
                          aria-label={`View ${p.destination} on Stellar Explorer`}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 dark:text-slate-400 max-w-[140px] truncate">
                      {p.memo ?? '—'}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {!query.isPending && visible.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              No payments match your search criteria.
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 text-xs font-semibold text-sky-700 hover:underline dark:text-sky-400"
              >
                Reset all filters
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-xs dark:border-slate-800">
        <span aria-live="polite" className="font-mono text-slate-500 dark:text-slate-400">
          Page {current + 1} of {pages} ({filteredRows.length} total payments)
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={current === 0}
            onClick={() => setPage((p) => p - 1)}
            aria-label="Previous page"
            className="h-8 rounded-md border border-slate-200 bg-white px-3 font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={current >= pages - 1}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Next page"
            className="h-8 rounded-md border border-slate-200 bg-white px-3 font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
