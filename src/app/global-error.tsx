'use client'
export default function GlobalError({
  error,
  reset
}: {
  error: Error
  reset: () => void
}): React.JSX.Element {
  return (
    <html lang="en">
      <body>
        <main className="p-10 text-center">
          <h1 className="text-2xl font-bold">Critical error</h1>
          <p>{error.message}</p>
          <button onClick={reset}>Retry</button>
        </main>
      </body>
    </html>
  )
}
