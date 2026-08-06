'use client'
import { RequireRole } from '@/components/auth/RequireRole'
import { env } from '@/lib/env'
import { useState } from 'react'

export default function NetworkPage(): React.JSX.Element {
  const [net, setNet] = useState(env.NEXT_PUBLIC_STELLAR_NETWORK)
  return (
    <RequireRole roles={['admin']}>
      <h1 className="text-2xl font-bold">Network Endpoints</h1>
      <dl className="mt-3 rounded border p-4 text-sm">
        <div>Horizon: {env.NEXT_PUBLIC_HORIZON_URL}</div>
        <div>RPC: {env.NEXT_PUBLIC_SOROBAN_RPC_URL}</div>
        <div>Network: {net}</div>
      </dl>
      <button
        className="mt-3 rounded border px-3 py-2"
        onClick={() => {
          if (
            net === 'testnet' &&
            !window.confirm('You are switching to MAINNET — real funds. Continue?')
          )
            return
          setNet(net === 'testnet' ? 'mainnet' : 'testnet')
        }}
      >
        Switch to {net === 'testnet' ? 'MAINNET' : 'testnet'}
      </button>
    </RequireRole>
  )
}
