export default function NotFound(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-md p-10 text-center">
      <h1 className="text-2xl font-bold">404 — Not found</h1>
      <p className="mt-2">The page you requested does not exist.</p>
      <a href="/" className="mt-4 inline-block underline">
        Go home
      </a>
    </main>
  )
}
