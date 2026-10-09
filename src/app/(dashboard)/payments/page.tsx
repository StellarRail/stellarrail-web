'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, ArrowUpDown, Plus } from 'lucide-react'
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

  const SortIcon = ({ k }: { k: SortKey }): React.JSX.Element => {
    if (sortKey !== k)
      return (
        <ArrowUpDown
          size={16}
          strokeWidth={1.5}
          aria-hidden="true"
          className="text-ink-secondary"
        />
      )
    return sortDir === 'asc' ? (
      <ArrowUp size={16} strokeWidth={1.5} aria-hidden="true" />
    ) : (
      <ArrowDown size={16} strokeWidth={1.5} aria-hidden="true" />
    )
  }

  const th = 'px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-ink-secondary'

  return (
    <div>
      <div className="flex items-center">
        <h1 className="text-xl font-bold tracking-tight text-ink">Payments</h1>
        <button
          type="button"
          onClick={() => setModal(true)}
          className="ml-auto inline-flex h-9 items-center gap-2 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
          New Payment
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="search" aria-label="Filter payments">
        <label className="flex items-center gap-2 text-sm text-ink-secondary">
          Status
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as '' | PaymentStatus)
              setPage(0)
            }}
            className="h-9 rounded-md border border-line bg-white px-2 text-sm text-ink"
          >
            <option value="">All</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_APPROVAL">Pending approval</option>
            <option value="SETTLED">Settled</option>
            <option value="REFUNDED">Refunded</option>
            <option value="FAILED">Failed</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-secondary">
          Date range
          <select
            value={range}
            onChange={(e) => {
              setRange(e.target.value)
              setPage(0)
            }}
            className="h-9 rounded-md border border-line bg-white px-2 text-sm text-ink"
          >
            <option value="all">All time</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-secondary">
          Asset
          <select
            aria-label="Asset"
            disabled
            value="XLM"
            className="h-9 rounded-md border border-line bg-line-hover px-2 text-sm text-ink-secondary"
          >
            <option value="XLM">XLM</option>
          </select>
        </label>
      </div>

      <div
        role="region"
        aria-label="Payments table, scrollable"
        tabIndex={0}
        className="mt-4 overflow-x-auto rounded-md border border-line bg-white"
      >
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-line">
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
                  className="inline-flex items-center gap-1 uppercase hover:text-ink"
                >
                  Date <SortIcon k="createdAt" />
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
                  className="inline-flex items-center gap-1 uppercase hover:text-ink"
                >
                  Amount <SortIcon k="amountXlm" />
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
          <tbody>
            {query.isPending
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-t border-line">
                    <td colSpan={5} className="px-4 py-3">
                      <div
                        role="status"
                        aria-busy="true"
                        aria-label="Loading payments"
                        className="h-4 animate-pulse rounded bg-line-hover"
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
                    className="cursor-pointer border-t border-line hover:bg-line-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                  >
                    <td className="px-4 py-2 font-medium text-ink">{p.referenceId}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-ink-secondary">
                      {new Date(p.createdAt).toLocaleDateString('en-US')}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-right font-mono tabular-nums text-ink">
                      {p.amountXlm} XLM
                    </td>
                    <td className="px-4 py-2">
                      <StatusBadge status={p.status} />
                    </td>
                    <td
                      className="whitespace-nowrap px-4 py-2 font-mono text-xs text-ink-secondary"
                      title={p.destination}
                    >
                      {truncateAddress(p.destination)}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!query.isPending && visible.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-ink-secondary">
            No payments match these filters.
          </p>
        ) : null}
      </div>

      <div className="mt-2 flex items-center justify-end gap-2 text-sm">
        <span aria-live="polite" className="text-ink-secondary">
          Page {current + 1} of {pages}
        </span>
        <button
          type="button"
          disabled={current === 0}
          onClick={() => setPage((p) => p - 1)}
          aria-label="Previous page"
          className="h-9 rounded-md border border-line px-3 text-ink hover:bg-line-hover disabled:opacity-40"
        >
          Prev
        </button>
        <button
          type="button"
          disabled={current >= pages - 1}
          onClick={() => setPage((p) => p + 1)}
          aria-label="Next page"
          className="h-9 rounded-md border border-line px-3 text-ink hover:bg-line-hover disabled:opacity-40"
        >
          Next
        </button>
      </div>
      <NewPaymentModal open={modal} onClose={() => setModal(false)} />
    </div>
  )
}
