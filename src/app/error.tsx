'use client'
import { AlertTriangle, RotateCw } from 'lucide-react'

export default function ErrorPage({
  error,
  reset
}: {
  error: Error
  reset: () => void
}): React.JSX.Element {
  const id = Math.random().toString(36).slice(2, 8)

  return (
    <main className="mx-auto max-w-md py-16 px-4 text-center">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <AlertTriangle size={32} className="mx-auto text-amber-600 mb-3" />
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
          Something went wrong
        </h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
          Incident ID: {id} · {error.message}
        </p>
        <div className="mt-5">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            <RotateCw size={13} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    </main>
  )
}
