'use client'
import { useState } from 'react'
import { Sliders, ShieldCheck, Check } from 'lucide-react'
import { RequireRole } from '@/components/auth/RequireRole'
import { toast } from 'sonner'

export default function LimitsPage(): React.JSX.Element {
  const [v, setV] = useState({ perTx: 10000, daily: 50000, require2: 25000 })
  const [saved, setSaved] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    toast.success('Spending limits & quorum thresholds updated')
  }

  return (
    <RequireRole roles={['admin']}>
      <div className="mx-auto max-w-xl space-y-6">
        <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            Spending Limits
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Define organizational transaction ceilings and dual-control multisig authorization
            rules.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono mb-1">
                Per-Transaction Cap (XLM)
              </label>
              <input
                type="number"
                value={v.perTx}
                onChange={(e) => {
                  setSaved(false)
                  setV({ ...v, perTx: Number(e.target.value) })
                }}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 font-mono text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
              <span className="text-[11px] text-slate-500">
                Individual payments exceeding this amount are automatically blocked.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono mb-1">
                Daily Aggregate Limit (XLM)
              </label>
              <input
                type="number"
                value={v.daily}
                onChange={(e) => {
                  setSaved(false)
                  setV({ ...v, daily: Number(e.target.value) })
                }}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 font-mono text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
              <span className="text-[11px] text-slate-500">
                Rolling 24-hour limit across all operators.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono mb-1">
                Require 2 Approvers Above (XLM)
              </label>
              <input
                type="number"
                value={v.require2}
                onChange={(e) => {
                  setSaved(false)
                  setV({ ...v, require2: Number(e.target.value) })
                }}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 font-mono text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
              <span className="text-[11px] text-slate-500">
                Transactions above this amount require strict 2-of-3 multisig quorum.
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="h-9 w-full rounded-md bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
              >
                Save (confirm)
              </button>
            </div>

            {saved ? (
              <div
                role="status"
                className="flex items-center gap-1.5 rounded bg-emerald-50 p-2 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              >
                <Check size={14} />
                <span>Saved</span>
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </RequireRole>
  )
}
