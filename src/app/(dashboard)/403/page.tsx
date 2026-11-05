import Link from 'next/link'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

export default function ForbiddenDash(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-md py-12 text-center">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <ShieldAlert size={32} className="mx-auto text-amber-600 mb-3" />
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
          403 — Forbidden
        </h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Operator cannot visit admin pages. You do not have permission to access this resource.
        </p>
        <div className="mt-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            <ArrowLeft size={13} />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
