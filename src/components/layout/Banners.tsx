'use client'
import { useUiStore } from '@/stores/ui-store'
import { useOnline } from '@/hooks/hooks'
import { env } from '@/lib/env'
import { isReadOnly } from '@/lib/flags'

export function Banners(): React.JSX.Element {
  const degraded = useUiStore((s) => s.degraded)
  const online = useOnline()
  const ro = typeof window !== 'undefined' ? isReadOnly() : false
  return (
    <div aria-live="polite">
      {env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet' ? (
        <div
          role="alert"
          className="bg-red-600 px-4 py-2 text-center text-sm font-semibold text-white"
        >
          You are on MAINNET — real funds
        </div>
      ) : null}
      {env.NEXT_PUBLIC_MAINTENANCE ? (
        <div role="alert" className="bg-amber-400 px-4 py-2 text-center text-sm">
          Maintenance mode — read only
        </div>
      ) : null}
      {ro ? (
        <div className="bg-slate-800 px-4 py-1 text-center text-xs text-white">
          Read-only mode: mutating actions hidden
        </div>
      ) : null}
      {!online ? (
        <div className="bg-slate-600 px-4 py-1 text-center text-xs text-white">
          Offline — changes saved locally
        </div>
      ) : null}
      {degraded ? (
        <div className="bg-amber-200 px-4 py-1 text-center text-xs">
          Network degraded — retrying
        </div>
      ) : null}
    </div>
  )
}

export function ConsentBanner(): React.JSX.Element {
  const given = useUiStore((s) => s.consentGiven)
  const setConsent = useUiStore((s) => s.setConsent)
  if (given) return <></>
  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white p-3 dark:bg-navy-900"
    >
      <p className="text-sm">
        We use cookies for auth and analytics.{' '}
        <button className="underline" onClick={() => setConsent(true)}>
          Accept
        </button>
      </p>
    </div>
  )
}
