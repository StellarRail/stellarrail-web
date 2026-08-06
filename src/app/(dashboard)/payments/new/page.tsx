'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { paymentSchema } from '@/lib/validators'
import { checkBlocklist, createPayment } from '@/features/payments/api'
import { useDebounce, useAutosave, useOnline } from '@/hooks/hooks'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { STROOPS_PER_XLM } from '@/lib/formatters'
import { toast } from 'sonner'
import { isReadOnly } from '@/lib/flags'
import { z } from 'zod'

type Form = z.infer<typeof paymentSchema>

const BALANCE = 12500.75

export default function NewPaymentPage(): React.JSX.Element {
  const ro = typeof window !== 'undefined' ? isReadOnly() : false
  const online = useOnline()
  const [step, setStep] = useState(0)
  const [blockWarn, setBlockWarn] = useState('')
  const { register, handleSubmit, watch, setValue, formState } = useForm<Form>({
    resolver: zodResolver(paymentSchema),
    defaultValues: (() => {
      try {
        const raw = window.localStorage.getItem('sr-draft')
        if (raw) return JSON.parse(raw) as Form
      } catch {
        /* ignore */
      }
      return { destination: '', amountXlm: '', referenceId: '' }
    })()
  })
  const dest = watch('destination')
  const amount = watch('amountXlm')
  const debounced = useDebounce(dest, 500)
  useAutosave('sr-draft', watch(), 10000)

  const onCheckBlock = async (addr: string): Promise<void> => {
    if (addr.length !== 56) return
    const r = await checkBlocklist(addr).catch(() => ({
      blocked: false as boolean,
      reason: undefined as string | undefined
    }))
    setBlockWarn(r.blocked ? `Blocked address: ${r.reason ?? 'denied'}` : '')
  }
  if (debounced) void onCheckBlock(debounced)

  const onSubmit = async (v: Form): Promise<void> => {
    if (blockWarn) return
    setStep(1)
    try {
      const p = await createPayment(v)
      setStep(3)
      try {
        window.localStorage.removeItem('sr-draft')
      } catch {
        /* ignore */
      }
      toast.success(`Payment ${p.id} submitted — pending approval`)
    } catch {
      setStep(0)
      toast.error('Submission failed — draft saved')
    }
  }

  const useMax = (): void => {
    const max = Math.max(0, BALANCE - 1.5).toFixed(7)
    setValue('amountXlm', max)
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold">New Payment</h1>
      {!online ? <p className="text-sm text-amber-600">Offline — changes saved locally</p> : null}
      <ol aria-label="Submit progress" className="mt-4 flex gap-2 text-xs">
        {['Draft', 'Locked in escrow', 'Pending approval'].map((s, i) => (
          <li
            key={s}
            aria-current={step === i ? 'step' : undefined}
            className={`rounded px-2 py-1 ${step >= i ? 'bg-navy-900 text-white' : 'bg-slate-100'}`}
          >
            {s}
          </li>
        ))}
      </ol>
      {step === 3 ? (
        <p role="status" className="mt-3 text-green-700">
          Queued/confirmed — see My Requests.
        </p>
      ) : null}
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="mt-4 space-y-3">
        <div>
          <label htmlFor="destination">Destination (G…)</label>
          <Input id="destination" {...register('destination')} aria-describedby="dest-err" />
          {formState.errors.destination ? (
            <p id="dest-err" role="alert" className="text-sm text-red-600">
              {formState.errors.destination.message}{' '}
              <a
                className="underline"
                href="https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts"
              >
                Stellar docs
              </a>
            </p>
          ) : null}
          {blockWarn ? (
            <p role="alert" className="rounded bg-red-100 p-2 text-sm text-red-800">
              {blockWarn}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="amountXlm">
            Amount (XLM, max 7 decimals · 1 XLM = {STROOPS_PER_XLM.toLocaleString()} stroops)
          </label>
          <div className="flex gap-2">
            <Input
              id="amountXlm"
              inputMode="decimal"
              {...register('amountXlm')}
              aria-describedby="amt-err"
            />
            <button type="button" onClick={useMax} className="rounded border px-3">
              Max
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Balance {BALANCE} XLM · fee ~0.00001 XLM · reserve 1 XLM
          </p>
          {formState.errors.amountXlm ? (
            <p id="amt-err" role="alert" className="text-sm text-red-600">
              {formState.errors.amountXlm.message}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="memo">Memo (≤28 chars)</label>
          <Input id="memo" {...register('memo')} />
        </div>
        <div>
          <label htmlFor="referenceId">Reference ID</label>
          <Input id="referenceId" {...register('referenceId')} />
        </div>
        <Button type="submit" disabled={ro || Boolean(blockWarn)} className="min-h-[44px] w-full">
          {ro ? 'Read-only' : 'Submit payment'}
        </Button>
        <p className="text-xs">Amount entered: {amount || '—'}</p>
      </form>
    </div>
  )
}
