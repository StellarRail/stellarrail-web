import Link from 'next/link'
import { seedPayments } from '@/mocks/seed'

export default function PaymentsPage({
  searchParams
}: {
  searchParams: Record<string, string | undefined>
}): React.JSX.Element {
  const status = searchParams.status ?? ''
  const q = searchParams.q ?? ''
  let data = seedPayments
  if (status) data = data.filter((p) => p.status === status)
  if (q) data = data.filter((p) => p.destination.includes(q) || p.referenceId.includes(q))
  return (
    <div>
      <h1 className="text-2xl font-bold">My Requests</h1>
      <form className="mt-3 flex flex-wrap gap-2" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search destination / reference"
          aria-label="Search"
          className="rounded border px-3 py-2"
        />
        <select
          name="status"
          defaultValue={status}
          aria-label="Filter by status"
          className="rounded border px-3 py-2"
        >
          <option value="">All</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING_APPROVAL">Pending</option>
          <option value="SETTLED">Settled</option>
          <option value="REFUNDED">Refunded</option>
          <option value="FAILED">Failed</option>
        </select>
        <button className="rounded bg-navy-900 px-3 py-2 text-white">Filter</button>
      </form>
      <div className="mt-4 overflow-x-auto rounded border">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="p-2 text-left">Reference</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-2">
                  <Link href={`/payments/${p.id}`} className="underline">
                    {p.referenceId}
                  </Link>
                </td>
                <td className="p-2">{p.amountXlm} XLM</td>
                <td className="p-2">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 ? (
        <p className="mt-4 text-sm">No payments match. Try clearing filters.</p>
      ) : null}
    </div>
  )
}
