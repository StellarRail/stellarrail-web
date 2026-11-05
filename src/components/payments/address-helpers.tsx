'use client'
import { useState } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'
import { truncateAddress } from '@/lib/formatters'
import { env } from '@/lib/env'
import { explorerAccountUrl, explorerTxUrl } from '@/lib/formatters'

export function CopyButton({
  text,
  label = 'Copy'
}: {
  text: string
  label?: string
}): React.JSX.Element {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setDone(true)
          setTimeout(() => setDone(false), 1500)
        })
      }}
      className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
    >
      {done ? (
        <>
          <Check size={12} className="text-emerald-600" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy size={12} />
          <span>{label}</span>
        </>
      )}
    </button>
  )
}

export function AddressLine({ address }: { address: string }): React.JSX.Element {
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span title={address} className="font-mono">
        {truncateAddress(address)}
      </span>
      <CopyButton text={address} label="Copy address" />
      <a
        className="inline-flex items-center gap-1 text-sky-700 hover:underline dark:text-sky-400 font-medium"
        href={explorerAccountUrl(env.NEXT_PUBLIC_STELLAR_NETWORK, address)}
        target="_blank"
        rel="noreferrer"
      >
        <span>Explorer</span>
        <ExternalLink size={11} />
      </a>
    </span>
  )
}

export function TxLink({ hash }: { hash: string }): React.JSX.Element {
  return (
    <a
      className="inline-flex items-center gap-1 text-sky-700 hover:underline dark:text-sky-400 font-mono"
      href={explorerTxUrl(env.NEXT_PUBLIC_STELLAR_NETWORK, hash)}
      target="_blank"
      rel="noreferrer"
    >
      <span>{truncateAddress(hash, 8)}</span>
      <ExternalLink size={11} />
    </a>
  )
}
