'use client'
import { useState } from 'react'
import { RequireRole } from '@/components/auth/RequireRole'
import { seedAudit } from '@/mocks/seed'
import { toCsv } from '@/lib/formatters'
import { Download, Search, FileText, X } from 'lucide-react'

export default function AuditPage(): React.JSX.Element {
  const [actor, setActor] = useState('')
  const [detail, setDetail] = useState<(typeof seedAudit)[number] | null>(null)
  const rows = seedAudit.filter(
    (a) => !actor || a.actor.toLowerCase().includes(actor.toLowerCase())
  )

  const exportFile = (fmt: 'csv' | 'json'): void => {
    if (rows.length > 10000) {
      alert('Maximum 10,000 rows can be exported at once.')
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
    a.download = `stellarrail-audit-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}.${fmt}`
    a.click()
  }

  return (
    <RequireRole roles={['admin']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Audit Logs
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Immutable cryptographic compliance log of all treasury state transitions and operator
              commands.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportFile('csv')}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => exportFile('json')}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Download size={13} />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Search size={14} className="text-slate-400" />
          <input
            aria-label="Filter by actor"
            placeholder="Filter by actor email or identity..."
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 outline-none dark:text-slate-100"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-4 py-3 text-left">
                  Time (UTC)
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  Actor
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  Action
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  IP
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {rows.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                    {new Date(a.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-900 dark:text-slate-100">
                    {a.actor}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setDetail(a)}
                      className="font-mono text-sky-700 hover:underline dark:text-sky-400 font-semibold"
                    >
                      {a.action}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {a.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {detail ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Audit detail"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-item-reveal"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Audit detail</h2>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>
            <pre className="mt-4 flex-1 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
              {JSON.stringify(detail, null, 2)}
            </pre>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="h-8 rounded-md border border-slate-300 px-4 text-xs font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </RequireRole>
  )
}
