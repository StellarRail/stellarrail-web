'use client'
import { use } from 'react'
import { seedPayments } from '@/mocks/seed'
import { AddressLine, TxLink, CopyButton } from '@/components/payments/address-helpers'
import { usePaymentStatus, useCountdown } from '@/hooks/hooks'
import dynamic from 'next/dynamic'

const QrModal = dynamic(() => import('@/components/payments/QrModal'), { ssr: false })

export default function PaymentDetail({
  params
}: {
  params: Promise<{ id: string }>
}): React.JSX.Element {
  const { id } = use(params)
  const found = seedPayments.find((p) => p.id === id) ?? seedPayments[0]!
  const { status, live } = usePaymentStatus(found.id, found.status)
  const { label, state } = useCountdown(found.deadline)
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Payment {found.referenceId}</h1>
      <p className="text-sm">
        {live ? '● Live' : '○ Settled'} · Expires:{' '}
        <span className={state === 'soon' ? 'text-amber-600' : ''}>{label}</span>{' '}
        <span title="Auto-refund callable by anyone after expiry">(auto-refund after expiry)</span>
      </p>
      <dl className="mt-4 space-y-2 rounded border p-4">
        <div>
          <dt>Amount</dt>
          <dd className="font-semibold">{found.amountXlm} XLM</dd>
        </div>
        <div>
          <dt>Destination</dt>
          <dd>
            <AddressLine address={found.destination} />
          </dd>
        </div>
        <div>
          <dt>Memo</dt>
          <dd>{found.memo ?? '—'}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{status}</dd>
        </div>
        <div>
          <dt>Escrow</dt>
          <dd>{found.escrowContractId ?? '—'}</dd>
        </div>
        <div>
          <dt>Lock hash</dt>
          <dd>{found.lockTxHash ? <TxLink hash={found.lockTxHash} /> : '—'}</dd>
        </div>
        <div>
          <dt>Settle hash</dt>
          <dd>{found.settleTxHash ? <TxLink hash={found.settleTxHash} /> : '—'}</dd>
        </div>
      </dl>
      <ol className="mt-4 space-y-1 text-sm" aria-label="Timeline">
        {['CREATED', 'LOCKED', 'PENDING', 'SETTLED'].map((s) => (
          <li key={s}>✓ {s}</li>
        ))}
      </ol>
      <div className="mt-4 flex gap-2">
        <CopyButton text={found.destination} />
        <QrModal address={found.destination} />
      </div>
      {found.status === 'DRAFT' ? (
        <p className="mt-3 text-sm">
          Draft editable — <button className="underline">Edit</button>{' '}
          <button className="underline">Delete</button>
        </p>
      ) : (
        <p title="Only drafts can be edited" className="mt-3 text-sm text-slate-500">
          Locked (only DRAFT editable)
        </p>
      )}
    </div>
  )
}
