'use client'
import { useState } from 'react'
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
      aria-label={label}
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setDone(true)
          setTimeout(() => setDone(false), 1500)
        })
      }}
      className="rounded border px-2 py-1 text-xs"
    >
      {done ? 'Copied!' : label}
    </button>
  )
}

export function AddressLine({ address }: { address: string }): React.JSX.Element {
  return (
    <span className="flex items-center gap-2">
      <span title={address}>{truncateAddress(address)}</span>
      <CopyButton text={address} label="Copy address" />
      <a
        className="underline"
        href={explorerAccountUrl(env.NEXT_PUBLIC_STELLAR_NETWORK, address)}
        target="_blank"
        rel="noreferrer"
      >
        Explorer
      </a>
    </span>
  )
}

export function TxLink({ hash }: { hash: string }): React.JSX.Element {
  return (
    <a
      className="underline"
      href={explorerTxUrl(env.NEXT_PUBLIC_STELLAR_NETWORK, hash)}
      target="_blank"
      rel="noreferrer"
    >
      {truncateAddress(hash, 8)}
    </a>
  )
}
