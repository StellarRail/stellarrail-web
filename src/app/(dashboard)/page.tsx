import Link from 'next/link'

async function getStats(): Promise<{
  pending: number
  settledMonth: number
  volumeXlm: string
  failed: number
}> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api'
    const r = await fetch(`${base}/payments/stats`, { cache: 'no-store' })
    if (r.ok) return (await r.json()) as never
  } catch {
    /* mock fallback */
  }
  return { pending: 4, settledMonth: 12, volumeXlm: '48250.5', failed: 1 }
}

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const stats = await getStats()
  return (
    <div>
      <h1 className="text-2xl font-bold">Operator Dashboard</h1>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded border p-4">
          <p className="text-xs">Pending</p>
          <p className="text-2xl font-bold">{stats.pending}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-xs">Settled this month</p>
          <p className="text-2xl font-bold">{stats.settledMonth}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-xs">Volume XLM</p>
          <p className="text-2xl font-bold">{stats.volumeXlm}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-xs">Failed</p>
          <p className="text-2xl font-bold">{stats.failed}</p>
        </div>
      </div>
      <div className="mt-6">
        <Link href="/payments" className="underline">
          View recent requests →
        </Link>
      </div>
      <div className="mt-4 rounded border p-4 text-sm text-slate-500">
        Empty state: no payments yet — create your first payment.
      </div>
    </div>
  )
}
