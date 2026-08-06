'use client'
import { useState } from 'react'
import { seedPayments } from '@/mocks/seed'
import { useAuthStore } from '@/stores/auth-store'
import { canApprove } from '@/components/auth/RequireRole'
import { approvePayment, rejectPayment } from '@/features/approvals/api'
import { useCountdown } from '@/hooks/hooks'
import { toast } from 'sonner'

function Row({
  p,
  onReview
}: {
  p: (typeof seedPayments)[number]
  onReview: () => void
}): React.JSX.Element {
  const { label, state } = useCountdown(p.deadline)
  return (
    <tr className="border-t">
      <td className="p-2">{p.requesterEmail}</td>
      <td className="p-2">{p.amountXlm}</td>
      <td className="p-2">{p.memo ?? '—'}</td>
      <td
        className={`p-2 ${state === 'soon' ? 'text-amber-600' : state === 'expired' ? 'text-slate-400' : ''}`}
      >
        {label}
      </td>
      <td className="p-2">
        <button onClick={onReview} className="rounded border px-2 py-1">
          Review
        </button>
      </td>
    </tr>
  )
}

export default function ApprovalsPage(): React.JSX.Element {
  const pending = seedPayments
    .filter((p) => p.status === 'PENDING_APPROVAL')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const user = useAuthStore((s) => s.user)
  const [selected, setSelected] = useState<(typeof pending)[number] | null>(null)
  const [confirm, setConfirm] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const own = selected ? !canApprove(selected.requesterId, user?.id ?? 'user_approver_1') : false

  const doApprove = async (): Promise<void> => {
    if (!selected) return
    setBusy(true)
    try {
      await approvePayment(selected.id)
      toast.success('Approved — settling')
      setConfirm(false)
      setSelected(null)
    } catch {
      toast.error('Approve failed')
    } finally {
      setBusy(false)
    }
  }
  const doReject = async (): Promise<void> => {
    if (!selected || !reason) return
    setBusy(true)
    try {
      await rejectPayment(selected.id, reason)
      toast.success('Rejected — refunded')
      setRejectOpen(false)
      setSelected(null)
    } catch {
      toast.error('Reject failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Pending Queue</h1>
      {pending.length === 0 ? (
        <p className="mt-6 text-center">🎉 All clear — nothing pending!</p>
      ) : (
        <>
          <div className="mt-2 overflow-x-auto rounded border md:hidden">
            {pending.map((p) => (
              <div key={p.id} className="border-b p-3">
                <p className="font-semibold">
                  {p.amountXlm} XLM · {p.referenceId}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => setSelected(p)}
                    className="min-h-[44px] flex-1 rounded bg-navy-900 text-white"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setSelected(p)
                      setRejectOpen(true)
                    }}
                    className="min-h-[44px] flex-1 rounded border"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 hidden overflow-x-auto rounded border md:block">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-left">Requester</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Memo</th>
                  <th className="p-2 text-left">SLA</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((p) => (
                  <Row key={p.id} p={p} onReview={() => setSelected(p)} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {selected ? (
        <div
          role="dialog"
          aria-label="Review payment"
          className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-auto bg-white p-6 shadow-xl dark:bg-navy-900"
        >
          <h2 className="text-lg font-bold">Review {selected.referenceId}</h2>
          <p className="text-sm">Amount {selected.amountXlm} XLM · limit 8,000 / 10,000 XLM</p>
          {Number(selected.amountXlm) > 8000 ? (
            <p role="alert" className="rounded bg-amber-100 p-2 text-sm">
              Risk: large amount
            </p>
          ) : null}
          <p className="text-sm">Escrow lock: {selected.lockTxHash?.slice(0, 12)}…</p>
          {own ? (
            <p role="alert" className="rounded bg-red-100 p-2 text-sm">
              You cannot approve your own request
            </p>
          ) : null}
          <div className="sticky bottom-0 mt-4 flex gap-2 bg-white py-2 dark:bg-navy-900">
            <button
              disabled={own || busy}
              title={own ? 'You cannot approve your own request' : undefined}
              onClick={() => setConfirm(true)}
              className="min-h-[44px] flex-1 rounded bg-navy-900 text-white disabled:opacity-40"
            >
              Approve
            </button>
            <button
              disabled={own || busy}
              title={own ? 'You cannot approve your own request' : undefined}
              onClick={() => setRejectOpen(true)}
              className="min-h-[44px] flex-1 rounded border disabled:opacity-40"
            >
              Reject
            </button>
            <button onClick={() => setSelected(null)} className="rounded px-3">
              Close
            </button>
          </div>
          {confirm ? (
            <div className="mt-3 rounded border p-3">
              <label>
                <input type="checkbox" id="verify" /> <span>I verified destination</span>
              </label>
              <button
                disabled={busy}
                onClick={() => void doApprove()}
                className="mt-2 w-full rounded bg-green-600 px-3 py-2 text-white disabled:opacity-50"
              >
                Confirm approve
              </button>
            </div>
          ) : null}
          {rejectOpen ? (
            <div className="mt-3 rounded border p-3">
              <label htmlFor="reason">Reason (required)</label>
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded border px-2 py-2"
              >
                <option value="">Select…</option>
                <option value="wrong-address">Wrong address</option>
                <option value="duplicate">Duplicate</option>
                <option value="policy">Policy</option>
              </select>
              <button
                disabled={!reason || busy}
                onClick={() => void doReject()}
                className="mt-2 w-full rounded bg-red-600 px-3 py-2 text-white disabled:opacity-50"
              >
                Confirm reject → refunded
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
