import Link from 'next/link'

export default function Home(): React.JSX.Element {
  return (
    <main id="main" className="mx-auto max-w-4xl p-8">
      <h1 className="font-display text-4xl font-bold">StellarRail</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        XLM-only payment operations for Operators, Approvers and Admins.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/login"
          className="rounded bg-navy-900 px-4 py-2 text-white dark:bg-stellar-500 dark:text-navy-950"
        >
          Login
        </Link>
        <Link href="/payments/new" className="rounded border px-4 py-2">
          New Payment
        </Link>
      </div>
      <section aria-label="Design primitives" className="mt-10 grid gap-3 sm:grid-cols-2">
        <div className="rounded border p-4">Operator dashboard · stats + recent</div>
        <div className="rounded border p-4">Approver queue · SLA countdown</div>
        <div className="rounded border p-4">Admin · users, limits, audit</div>
        <div className="rounded border p-4">Health · reconciliation status</div>
      </section>
    </main>
  )
}
