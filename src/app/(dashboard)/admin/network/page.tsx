'use client'
import { useState } from 'react'
import { Radio, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { RequireRole } from '@/components/auth/RequireRole'
import { env } from '@/lib/env'

export default function NetworkPage(): React.JSX.Element {
  const [net, setNet] = useState(env.NEXT_PUBLIC_STELLAR_NETWORK)

  const handleSwitch = () => {
    if (
      net === 'testnet' &&
      !window.confirm('You are switching to MAINNET — real funds will be transacted. Continue?')
    ) {
      return
    }
    setNet(net === 'testnet' ? 'mainnet' : 'testnet')
  }

  return (
    <RequireRole roles={['admin']}>
      <div className="mx-auto max-w-xl space-y-6">
        <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            Network Endpoints
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Configure Stellar Horizon and Soroban RPC telemetry connections.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <dl className="space-y-3 text-xs">
            <div className="flex flex-col gap-1 pb-3 border-b border-slate-200 dark:border-slate-800">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Stellar Horizon Node
              </dt>
              <dd className="font-mono text-slate-900 dark:text-slate-100 break-all">
                Horizon: {env.NEXT_PUBLIC_HORIZON_URL}
              </dd>
            </div>

            <div className="flex flex-col gap-1 pb-3 border-b border-slate-200 dark:border-slate-800">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Soroban Smart Contract RPC
              </dt>
              <dd className="font-mono text-slate-900 dark:text-slate-100 break-all">
                RPC: {env.NEXT_PUBLIC_SOROBAN_RPC_URL}
              </dd>
            </div>

            <div className="flex flex-col gap-1">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Active Operational Network
              </dt>
              <dd className="font-mono font-bold text-slate-900 dark:text-slate-100 uppercase">
                Network: {net}
              </dd>
            </div>
          </dl>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSwitch}
              className="h-9 w-full rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Switch to {net === 'testnet' ? 'MAINNET' : 'testnet'}
            </button>
          </div>
        </div>
      </div>
    </RequireRole>
  )
}
