import Link from 'next/link'
import { FileQuestion, ArrowLeft } from 'lucide-react'

export default function NotFound(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-md py-16 px-4 text-center">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <FileQuestion size={32} className="mx-auto text-slate-400 mb-3" />
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
          404 — Not found
        </h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          The requested ledger page or route does not exist.
        </p>
        <div className="mt-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            <ArrowLeft size={13} />
            <span>Go home</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
