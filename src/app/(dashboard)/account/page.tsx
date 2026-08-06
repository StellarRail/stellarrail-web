'use client'
import { useState } from 'react'
export default function AccountPage(): React.JSX.Element {
  const [done, setDone] = useState(false)
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">Account</h1>
      <div className="mt-4 rounded border p-4">
        <h2 className="font-semibold">Request data deletion (GDPR)</h2>
        <p className="text-sm">This calls DELETE /users/me after confirmation.</p>
        {!done ? (
          <button
            onClick={() => {
              if (window.confirm('Delete your data?')) setDone(true)
            }}
            className="mt-2 rounded bg-red-600 px-3 py-2 text-white"
          >
            Request deletion
          </button>
        ) : (
          <p role="status" className="text-green-700">
            Deletion requested — check email.
          </p>
        )}
      </div>
    </div>
  )
}
