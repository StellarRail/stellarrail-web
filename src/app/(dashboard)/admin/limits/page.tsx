'use client'
import { useState } from 'react'
import { RequireRole } from '@/components/auth/RequireRole'

export default function LimitsPage(): React.JSX.Element {
  const [v, setV] = useState({ perTx: 10000, daily: 50000, require2: 25000 })
  const [saved, setSaved] = useState(false)
  return (
    <RequireRole roles={['admin']}>
      <h1 className="text-2xl font-bold">Spending Limits</h1>
      <form
        className="mt-3 max-w-sm space-y-2"
        onSubmit={(e) => {
          e.preventDefault()
          setSaved(true)
        }}
      >
        <label>
          Per-tx
          <input
            type="number"
            value={v.perTx}
            onChange={(e) => setV({ ...v, perTx: Number(e.target.value) })}
            className="w-full rounded border px-2 py-2"
          />
        </label>
        <label>
          Daily
          <input
            type="number"
            value={v.daily}
            onChange={(e) => setV({ ...v, daily: Number(e.target.value) })}
            className="w-full rounded border px-2 py-2"
          />
        </label>
        <label>
          Require 2 approvers above
          <input
            type="number"
            value={v.require2}
            onChange={(e) => setV({ ...v, require2: Number(e.target.value) })}
            className="w-full rounded border px-2 py-2"
          />
        </label>
        <button className="rounded bg-navy-900 px-3 py-2 text-white">Save (confirm)</button>
        {saved ? (
          <p role="status" className="text-green-700">
            Saved
          </p>
        ) : null}
      </form>
    </RequireRole>
  )
}
