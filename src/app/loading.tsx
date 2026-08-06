export default function Loading(): React.JSX.Element {
  return (
    <div aria-busy="true" className="space-y-2 p-4">
      <div className="h-8 animate-pulse rounded bg-slate-200" />
      <div className="h-40 animate-pulse rounded bg-slate-200" />
    </div>
  )
}
