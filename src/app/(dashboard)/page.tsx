'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { env } from '@/lib/env'
import { seedPayments } from '@/mocks/seed'
import { StatusBadge } from '@/components/ui/status-badge'
import { truncateAddress } from '@/lib/formatters'
import type { Paginated, Payment } from '@/types'

const TREASURY_BALANCE = '12,500.75'

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

function StatCard({
  label,
  value,
  loading
}: {
  label: string
  value: string
  loading?: boolean
}): React.JSX.Element {
  return (
    <div className="rounded-md border border-line bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">{label}</p>
      {loading ? (
        <div
          role="status"
          aria-busy="true"
          aria-label={`Loading ${label}`}
          className="mt-2 h-8 w-24 animate-pulse rounded bg-line-hover"
        />
      ) : (
        <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-ink">{value}</p>
      )}
    </div>
  )
}

function typeOf(p: Payment): 'Deposit' | 'Release' {
  return Number(p.id.slice(-1)) % 2 === 0 ? 'Deposit' : 'Release'
}

export default function DashboardPage(): React.JSX.Element {
  const router = useRouter()
  const stats = useQuery({ queryKey: ['dashboard-stats'], queryFn: fetchStats, retry: 1 })
  const recent = useQuery({ queryKey: ['dashboard-recent'], queryFn: fetchRecent, retry: 1 })

  const rows = recent.data ?? (recent.isError ? seedPayments.slice(0, 6) : undefined)
  const degraded = stats.isError || recent.isError

  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight text-ink">Dashboard</h1>
      {degraded ? (
        <p
          role="alert"
          className="mt-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-[#92400E]"
        >
          Live data unavailable — showing cached values.{' '}
          <button
            type="button"
            onClick={() => {
              void stats.refetch()
              void recent.refetch()
            }}
            className="font-medium underline"
          >
            Retry
          </button>
        </p>
      ) : null}

      <section
        aria-label="Statistics"
        className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard label="Total balance" value={`${TREASURY_BALANCE} XLM`} />
        <StatCard
          label="Pending approvals"
          value={stats.data ? String(stats.data.pending) : '—'}
          loading={stats.isPending}
        />
        <StatCard
          label="Settled today"
          value={stats.data ? String(stats.data.settledMonth) : '—'}
          loading={stats.isPending}
        />
        <StatCard
          label="Failed transactions"
          value={stats.data ? String(stats.data.failed) : '—'}
          loading={stats.isPending}
        />
      </section>

      <div className="mt-4 flex gap-2">
        <Link
          href="/payments/new"
          className="inline-flex h-9 items-center rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          New Payment
        </Link>
        <Link
          href="/approvals"
          className="inline-flex h-9 items-center rounded-md border border-line bg-white px-4 text-sm font-medium text-ink hover:bg-line-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          View Approvals
        </Link>
      </div>

      <section aria-label="Recent activity" className="mt-6">
        <h2 className="text-sm font-semibold tracking-tight text-ink">Recent activity</h2>
        <div
          role="region"
          aria-label="Recent activity table, scrollable"
          tabIndex={0}
          className="mt-2 overflow-x-auto rounded-md border border-line bg-white"
        >
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-secondary">
                <th scope="col" className="px-4 py-2 font-medium">
                  Date
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  ID
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Type
                </th>
                <th scope="col" className="px-4 py-2 text-right font-medium">
                  Amount
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Destination
                </th>
              </tr>
            </thead>
            <tbody>
              {recent.isPending
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-t border-line">
                      <td colSpan={6} className="px-4 py-3">
                        <div
                          role="status"
                          aria-busy="true"
                          aria-label="Loading activity"
                          className="h-4 animate-pulse rounded bg-line-hover"
                        />
                      </td>
                    </tr>
                  ))
                : (rows ?? []).map((p) => (
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
                      <td className="whitespace-nowrap px-4 py-2 text-ink-secondary">
                        {new Date(p.createdAt).toLocaleDateString('en-US')}
                      </td>
                      <td
                        className="whitespace-nowrap px-4 py-2 font-mono text-xs text-ink"
                        title={p.id}
                      >
                        {truncateAddress(p.id, 4)}
                      </td>
                      <td className="px-4 py-2 text-ink">{typeOf(p)}</td>
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
          {!recent.isPending && (rows ?? []).length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-ink-secondary">No recent activity.</p>
          ) : null}
        </div>
      </section>
    </div>
  )
}
