'use client'
import { AlertTriangle, WifiOff, ShieldAlert, Wrench } from 'lucide-react'
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
          className="flex items-center justify-center gap-2 border-b border-rose-800 bg-rose-950 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wider text-rose-200"
        >
          <ShieldAlert size={14} className="text-rose-400" aria-hidden="true" />
          <span>MAINNET ENVIRONMENT — Real XLM Funds &amp; Ledger Settling</span>
        </div>
      ) : null}

      {env.NEXT_PUBLIC_MAINTENANCE ? (
        <div
          role="alert"
          className="flex items-center justify-center gap-2 border-b border-amber-300 bg-amber-100 px-4 py-1.5 text-center text-xs font-medium text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
        >
          <Wrench size={13} className="text-amber-700 dark:text-amber-400" aria-hidden="true" />
          <span>Scheduled maintenance mode active — ledger writes are currently restricted.</span>
        </div>
      ) : null}

      {ro ? (
        <div className="flex items-center justify-center gap-2 border-b border-slate-700 bg-slate-900 px-4 py-1.5 text-center text-xs text-slate-200">
          <span>
            Read-only policy enabled: Mutating payment operations are disabled for this session.
          </span>
        </div>
      ) : null}

      {!online ? (
        <div
          role="alert"
          className="flex items-center justify-center gap-2 border-b border-slate-700 bg-slate-800 px-4 py-1.5 text-center text-xs font-medium text-white"
        >
          <WifiOff size={13} aria-hidden="true" />
          <span>Offline mode: Connection lost. Drafts are safely cached locally.</span>
        </div>
      ) : null}

      {degraded ? (
        <div
          role="alert"
          className="flex items-center justify-center gap-2 border-b border-amber-300 bg-amber-50 px-4 py-1.5 text-center text-xs font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
        >
          <AlertTriangle
            size={13}
            className="text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />
          <span>Horizon network latency elevated. Cached telemetry may be displayed.</span>
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
      aria-label="Security and cookie preferences"
      className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="text-xs text-slate-700 dark:text-slate-300">
        <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
          Cookie &amp; Security Preferences
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-3">
          StellarRail uses strictly necessary local session tokens and essential telemetry cookies.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setConsent(true)}
            className="rounded border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  )
}
