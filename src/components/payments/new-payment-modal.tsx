'use client'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { X, Lock, ShieldCheck, AlertTriangle } from 'lucide-react'
import { stellarAddressSchema, amountXlmSchema } from '@/lib/validators'
import { createPayment, checkBlocklist } from '@/features/payments/api'
import { useDebounce } from '@/hooks/hooks'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const schema = z.object({
  destination: stellarAddressSchema,
  amountXlm: amountXlmSchema,
  memo: z.string().max(28, 'Memo must be 28 characters or fewer').optional().or(z.literal('')),
  referenceId: z.string().min(3, 'Reference ID is required (min 3 chars)').max(64)
})

type FormValues = z.infer<typeof schema>

const AVAILABLE_BALANCE = '12,499.25'

export function NewPaymentModal({
  open,
  onClose
}: {
  open: boolean
  onClose: () => void
}): React.JSX.Element | null {
  const queryClient = useQueryClient()
  const firstRef = useRef<HTMLInputElement | null>(null)
  const [blockWarn, setBlockWarn] = useState('')

  const { register, handleSubmit, reset, watch, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched'
  })

  const dest = watch('destination')
  const debouncedDest = useDebounce(dest, 500)

  useEffect(() => {
    if (open) {
      reset()
      setBlockWarn('')
      setTimeout(() => firstRef.current?.focus(), 50)
    }
  }, [open, reset])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (debouncedDest && debouncedDest.length === 56) {
      void checkBlocklist(debouncedDest)
        .then((r) => {
          setBlockWarn(r.blocked ? `Blocked address: ${r.reason ?? 'Sanctioned'}` : '')
        })
        .catch(() => {})
    }
  }, [debouncedDest])

  if (!open) return null

  const onSubmit = async (v: FormValues): Promise<void> => {
    if (blockWarn) return
    try {
      const p = await createPayment(v)
      await queryClient.invalidateQueries({ queryKey: ['payments'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard-recent'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success(`Payment ${p.referenceId} submitted to escrow queue`)
      onClose()
    } catch {
      toast.error('Could not submit payment. Please verify inputs and try again.')
    }
  }

  const { ref: destFormRef, ...destRest } = register('destination')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-payment-title"
        className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-item-reveal"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2
              id="modal-payment-title"
              className="text-base font-bold text-slate-900 dark:text-white"
            >
              New Payment
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Escrowed transfer awaiting 2-of-3 multisig quorum.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(onSubmit)(e)}
          className="mt-4 space-y-4"
          noValidate
        >
          <div>
            <label
              htmlFor="modal-destination"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono mb-1"
            >
              Destination Stellar Address
            </label>
            <Input
              id="modal-destination"
              {...destRest}
              ref={(el: HTMLInputElement | null) => {
                destFormRef(el)
                firstRef.current = el
              }}
              placeholder="G…"
              autoComplete="off"
              spellCheck={false}
              className="font-mono text-xs"
            />
            {formState.errors.destination ? (
              <p role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {formState.errors.destination.message}
              </p>
            ) : null}
            {blockWarn ? (
              <div
                role="alert"
                className="mt-1.5 flex items-center gap-1.5 rounded bg-rose-50 p-2 text-xs text-rose-900 dark:bg-rose-950 dark:text-rose-200"
              >
                <AlertTriangle size={13} className="shrink-0 text-rose-600" />
                <span>{blockWarn}</span>
              </div>
            ) : null}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="modal-amount"
                className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono"
              >
                Amount (XLM)
              </label>
              <span className="text-[11px] font-mono text-slate-500">
                Available: {AVAILABLE_BALANCE} XLM
              </span>
            </div>
            <div className="relative">
              <Input
                id="modal-amount"
                {...register('amountXlm')}
                inputMode="decimal"
                placeholder="0.0000000"
                className="font-mono text-sm pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-semibold text-slate-400">
                XLM
              </span>
            </div>
            {formState.errors.amountXlm ? (
              <p role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {formState.errors.amountXlm.message}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="modal-ref"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono mb-1"
              >
                Reference ID
              </label>
              <Input
                id="modal-ref"
                {...register('referenceId')}
                placeholder="REF-2026-XLM"
                className="font-mono text-xs"
              />
              {formState.errors.referenceId ? (
                <p role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                  {formState.errors.referenceId.message}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="modal-memo"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono mb-1"
              >
                Memo (Optional)
              </label>
              <Input
                id="modal-memo"
                {...register('memo')}
                placeholder="Max 28 chars"
                className="text-xs"
              />
              {formState.errors.memo ? (
                <p role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                  {formState.errors.memo.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-md border border-slate-300 bg-white px-3.5 text-xs font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={formState.isSubmitting || Boolean(blockWarn)}
              className="h-9 bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
            >
              <Lock size={13} className="mr-1.5" />
              <span>{formState.isSubmitting ? 'Submitting…' : 'Submit to Escrow'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
