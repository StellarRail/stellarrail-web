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
import { ShieldCheck, Info, CheckCircle2, Lock, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/cn'

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
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="border-b border-line/60 pb-4 dark:border-white/10">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-ink dark:text-white font-display">
            New Payment
          </h1>
          <span className="rounded-full border border-sky-300/60 bg-sky-50 px-2 py-0.2 font-mono text-[10px] font-semibold text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/60 dark:text-sky-300">
            Escrow Settlement
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Create and lock high-value XLM transactions in non-custodial smart contracts awaiting
          multisig consensus.
        </p>
      </div>

      {!online ? (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300/60 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-300">
          <Info size={14} className="shrink-0" />
          <p>Offline — changes saved locally to secure offline storage.</p>
        </div>
      ) : null}

      {/* Progress Stepper */}
      <div className="rounded-xl border border-line/80 bg-white p-4 shadow-subtle dark:border-white/10 dark:bg-navy-900">
        <ol aria-label="Submit progress" className="grid grid-cols-3 gap-2">
          {['Draft', 'Locked in escrow', 'Pending approval'].map((s, i) => {
            const isCompleted = step > i
            const isCurrent = step === i
            return (
              <li
                key={s}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-lg border p-2.5 transition-all text-xs font-mono',
                  isCurrent
                    ? 'border-brand/60 bg-slate-50 font-semibold text-ink dark:border-stellar-400/60 dark:bg-navy-800 dark:text-white'
                    : isCompleted
                      ? 'border-emerald-300/60 bg-emerald-50/50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-300'
                      : 'border-line/60 bg-white/60 text-slate-400 dark:border-white/5 dark:bg-navy-900/40'
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                        ? 'bg-navy-900 text-white dark:bg-stellar-500 dark:text-navy-950'
                        : 'bg-slate-200 text-slate-500 dark:bg-slate-800'
                  )}
                >
                  {isCompleted ? '✓' : i + 1}
                </span>
                <span className="truncate">{s}</span>
              </li>
            )
          })}
        </ol>

        {step === 3 ? (
          <div
            role="status"
            className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-300/60 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300"
          >
            <CheckCircle2 size={14} className="shrink-0" />
            <span>Queued/confirmed — see My Requests.</span>
          </div>
        ) : null}
      </div>

      {/* Main Payment Form */}
      <div className="rounded-xl border border-line/80 bg-white p-6 shadow-subtle dark:border-white/10 dark:bg-navy-900">
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="destination"
                className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono"
              >
                Destination (G…)
              </label>
              <a
                className="text-[11px] text-brand hover:underline dark:text-stellar-400"
                href="https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts"
                target="_blank"
                rel="noreferrer"
              >
                Stellar docs
              </a>
            </div>
            <Input
              id="destination"
              placeholder="e.g. GA2C5RF..."
              {...register('destination')}
              aria-describedby="dest-err"
              className="font-mono text-xs"
            />
            {formState.errors.destination ? (
              <p
                id="dest-err"
                role="alert"
                className="mt-1.5 text-xs text-rose-600 dark:text-rose-400"
              >
                {formState.errors.destination.message}
              </p>
            ) : null}
            {blockWarn ? (
              <div
                role="alert"
                className="mt-2 flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 p-2 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300"
              >
                <ShieldCheck size={14} className="shrink-0" />
                <span>{blockWarn}</span>
              </div>
            ) : null}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="amountXlm"
                className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono"
              >
                Amount (XLM)
              </label>
              <span className="font-mono text-[11px] text-slate-400">
                1 XLM = {STROOPS_PER_XLM.toLocaleString()} stroops
              </span>
            </div>
            <div className="flex gap-2">
              <Input
                id="amountXlm"
                inputMode="decimal"
                placeholder="0.0000000"
                {...register('amountXlm')}
                aria-describedby="amt-err"
                className="font-mono text-sm"
              />
              <button
                type="button"
                onClick={useMax}
                className="tactile-btn shrink-0 rounded-md border border-line bg-slate-100 px-3.5 text-xs font-mono font-semibold text-ink shadow-subtle hover:bg-slate-200 dark:border-white/10 dark:bg-navy-800 dark:text-slate-200 dark:hover:bg-navy-700"
              >
                Max
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span>Balance: {BALANCE} XLM</span>
              <span>Network fee ~0.00001 XLM</span>
            </div>
            {formState.errors.amountXlm ? (
              <p
                id="amt-err"
                role="alert"
                className="mt-1.5 text-xs text-rose-600 dark:text-rose-400"
              >
                {formState.errors.amountXlm.message}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="memo"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono mb-1.5"
              >
                Memo (≤28 chars)
              </label>
              <Input id="memo" placeholder="Optional audit memo" {...register('memo')} />
            </div>
            <div>
              <label
                htmlFor="referenceId"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono mb-1.5"
              >
                Reference ID
              </label>
              <Input
                id="referenceId"
                placeholder="e.g. REF-2026-XLM"
                {...register('referenceId')}
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={ro || Boolean(blockWarn)}
              className="tactile-btn min-h-[44px] w-full bg-navy-900 text-sm font-semibold text-white hover:bg-navy-800 dark:bg-stellar-500 dark:text-navy-950 dark:hover:bg-stellar-400"
            >
              <Lock size={15} className="mr-1.5" />
              <span>{ro ? 'Read-only' : 'Submit payment'}</span>
            </Button>
          </div>

          <div className="border-t border-line/60 pt-3 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Summary verification:</span>
            <span className="font-semibold text-ink dark:text-slate-200">
              Amount entered: {amount || '—'}
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}
