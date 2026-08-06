'use client'
import { useState } from 'react'
import { RequireRole } from '@/components/auth/RequireRole'
import { seedAudit } from '@/mocks/seed'
import { toCsv } from '@/lib/formatters'

export default function AuditPage(): React.JSX.Element {
  const [actor, setActor] = useState('')
  const [detail, setDetail] = useState<(typeof seedAudit)[number] | null>(null)
  const rows = seedAudit.filter((a) => !actor || a.actor.includes(actor))
  const exportFile = (fmt: 'csv' | 'json'): void => {
    if (rows.length > 10000) {
      alert('Max 10k rows')
      return
    }
    const content =
      fmt === 'csv'
        ? toCsv(rows as unknown as Record<string, unknown>[])
        : JSON.stringify(rows, null, 2)
    const blob = new Blob([content], { type: fmt === 'csv' ? 'text/csv' : 'application/json' })
    const a = document.createElement('a')
    const d = new Date()
    const pad = (n: number): string => String(n).padStart(2, '0')
    a.href = URL.createObjectURL(blob)
    a.download = `audit-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.${fmt}`
    a.click()
  }
  return (
    <RequireRole roles={['admin']}>
      <h1 className="text-2xl font-bold">Audit Logs</h1>
      <div className="mt-3 flex gap-2">
        <input
          aria-label="Filter by actor"
          placeholder="actor"
          value={actor}
          onChange={(e) => setActor(e.target.value)}
          className="rounded border px-2 py-1"
        />
        <button onClick={() => exportFile('csv')} className="rounded border px-2 py-1">
          Export CSV
        </button>
        <button onClick={() => exportFile('json')} className="rounded border px-2 py-1">
          Export JSON
        </button>
      </div>
      <table className="mt-3 w-full text-sm">
        <thead>
          <tr>
            <th className="text-left">Time</th>
            <th className="text-left">Actor</th>
            <th className="text-left">Action</th>
            <th className="text-left">IP</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id} className="border-t">
              <td>{a.timestamp}</td>
              <td>{a.actor}</td>
              <td>
                <button className="underline" onClick={() => setDetail(a)}>
                  {a.action}
                </button>
              </td>
              <td>{a.ip}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {detail ? (
        <div
          role="dialog"
          aria-label="Audit detail"
          className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white p-4 shadow dark:bg-navy-900"
        >
          <h2 className="font-bold">Audit detail</h2>
          <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(detail, null, 2)}</pre>
          <button onClick={() => setDetail(null)} className="mt-2 rounded border px-2 py-1">
            Close
          </button>
        </div>
      ) : null}
    </RequireRole>
  )
}
