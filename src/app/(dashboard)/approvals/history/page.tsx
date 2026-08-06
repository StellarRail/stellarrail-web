'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { seedPayments } from '@/mocks/seed'
import { toCsv } from '@/lib/formatters'

function Inner(): React.JSX.Element {
  const sp = useSearchParams()
  const router = useRouter()
  const tab = sp.get('tab') ?? 'pending'
  const filtered = seedPayments.filter((p) =>
    tab === 'pending'
      ? p.status === 'PENDING_APPROVAL'
      : tab === 'approved'
        ? p.status === 'SETTLED'
        : tab === 'rejected'
          ? p.status === 'REFUNDED'
          : true
  )
  const exportCsv = (): void => {
    const csv = toCsv(
      filtered.map((p) => ({ id: p.id, ref: p.referenceId, amount: p.amountXlm, status: p.status }))
    )
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'approvals.csv'
    a.click()
  }
  return (
    <div>
      <h1 className="text-2xl font-bold">Approval History</h1>
      <div className="mt-3 flex gap-2" role="tablist">
        {['pending', 'approved', 'rejected', 'all'].map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => router.push(`?tab=${t}`)}
            className={`rounded px-3 py-1 text-sm ${tab === t ? 'bg-navy-900 text-white' : 'border'}`}
          >
            {t}
          </button>
        ))}
        <button onClick={exportCsv} className="ml-auto rounded border px-3 py-1 text-sm">
          Export CSV
        </button>
      </div>
      <ul className="mt-3 space-y-1">
        {filtered.map((p) => (
          <li key={p.id} className="rounded border p-2 text-sm">
            {p.referenceId} · {p.amountXlm} XLM · {p.status}
          </li>
        ))}
      </ul>
    </div>
  )
}
export default function HistoryPage(): React.JSX.Element {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  )
}
