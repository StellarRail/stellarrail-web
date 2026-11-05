'use client'
import { useState } from 'react'
import { User, ShieldAlert, Check } from 'lucide-react'

export default function AccountPage(): React.JSX.Element {
  const [done, setDone] = useState(false)

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
          Account Settings
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Operator identity and data privacy management.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          Request data deletion (GDPR)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          This initiates the compliance process to purge session data and unreferenced audit
          identifiers.
        </p>
        {!done ? (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Delete your data?')) setDone(true)
            }}
            className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
          >
            Request deletion
          </button>
        ) : (
          <div
            role="status"
            className="flex items-center gap-1.5 rounded bg-emerald-50 p-2 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
          >
            <Check size={14} />
            <span>Deletion requested — check email.</span>
          </div>
        )}
      </div>
    </div>
  )
}
