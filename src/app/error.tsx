'use client'
export default function Error({
  error,
  reset
}: {
  error: Error
  reset: () => void
}): React.JSX.Element {
  const id = Math.random().toString(36).slice(2, 8)
  return (
    <main className="mx-auto max-w-md p-10 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-sm">
        Report ID: {id} · {error.message}
      </p>
      <button onClick={reset} className="mt-4 rounded bg-navy-900 px-4 py-2 text-white">
        Retry
      </button>
    </main>
  )
}
