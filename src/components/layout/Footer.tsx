export function Footer(): React.JSX.Element {
  return (
    <footer className="border-t p-4 text-center text-xs text-slate-500">
      StellarRail · XLM-only · {new Date().getFullYear()}
    </footer>
  )
}
