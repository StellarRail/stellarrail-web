'use client'
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { stellarAddressSchema, amountXlmSchema } from '@/lib/validators'
import { createPayment } from '@/features/payments/api'

const schema = z.object({
  destination: stellarAddressSchema,
  amountXlm: amountXlmSchema,
  memo: z.string().max(28, 'Memo must be 28 characters or fewer').optional().or(z.literal('')),
  referenceId: z.string().min(3, 'Reference is required').max(64)
})

type Form = z.infer<typeof schema>

export function NewPaymentModal({
  open,
  onClose
}: {
  open: boolean
  onClose: () => void
}): React.JSX.Element | null {
  const queryClient = useQueryClient()
  const firstRef = useRef<HTMLInputElement>(null)
  const { register, handleSubmit, reset, formState } = useForm<Form>({
    resolver: zodResolver(schema),
    mode: 'onChange'
  })

  useEffect(() => {
    if (open) {
      reset()
      setTimeout(() => firstRef.current?.focus(), 0)
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

  if (!open) return null

  const onSubmit = async (v: Form): Promise<void> => {
    try {
      const p = await createPayment(v)
      await queryClient.invalidateQueries({ queryKey: ['payments'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard-recent'] })
      toast.success(`Payment ${p.referenceId} created`)
      onClose()
    } catch {
      toast.error('Could not create payment. Your draft was kept — try again.')
    }
  }

  const input =
    'h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-ink placeholder:text-ink-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'
  const err = 'mt-1 text-xs text-danger-dark'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-ink/20" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-payment-title"
        className="relative w-full max-w-md rounded-md border border-line bg-white p-4"
      >
        <h2 id="new-payment-title" className="text-base font-bold tracking-tight text-ink">
          New payment
        </h2>
        <form
          onSubmit={(e) => void handleSubmit(onSubmit)(e)}
          className="mt-4 space-y-3"
          noValidate
        >
          <div>
            <label htmlFor="np-destination" className="text-sm font-medium text-ink">
              Destination address
            </label>
            <input
              id="np-destination"
              ref={firstRef}
              {...register('destination')}
              placeholder="G…"
              autoComplete="off"
              spellCheck={false}
              aria-describedby="np-destination-err"
              aria-invalid={Boolean(formState.errors.destination)}
              className={`${input} font-mono`}
            />
            {formState.errors.destination ? (
              <p id="np-destination-err" role="alert" className={err}>
                {formState.errors.destination.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="np-amount" className="text-sm font-medium text-ink">
              Amount
            </label>
            <div className="flex items-center gap-2">
              <input
                id="np-amount"
                {...register('amountXlm')}
                inputMode="decimal"
                placeholder="0.00"
                aria-describedby="np-amount-err"
                aria-invalid={Boolean(formState.errors.amountXlm)}
                className={`${input} font-mono tabular-nums`}
              />
              <span className="text-sm text-ink-secondary">XLM</span>
            </div>
            {formState.errors.amountXlm ? (
              <p id="np-amount-err" role="alert" className={err}>
                {formState.errors.amountXlm.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="np-memo" className="text-sm font-medium text-ink">
              Memo <span className="font-normal text-ink-secondary">(optional)</span>
            </label>
            <input
              id="np-memo"
              {...register('memo')}
              placeholder="Invoice 1001"
              maxLength={28}
              aria-describedby="np-memo-err"
              className={input}
            />
            {formState.errors.memo ? (
              <p id="np-memo-err" role="alert" className={err}>
                {formState.errors.memo.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="np-reference" className="text-sm font-medium text-ink">
              Reference note
            </label>
            <textarea
              id="np-reference"
              {...register('referenceId')}
              rows={2}
              placeholder="REF-2024…"
              aria-describedby="np-reference-err"
              aria-invalid={Boolean(formState.errors.referenceId)}
              className={`${input} h-auto py-2 leading-6`}
            />
            {formState.errors.referenceId ? (
              <p id="np-reference-err" role="alert" className={err}>
                {formState.errors.referenceId.message}
              </p>
            ) : null}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-md border border-line px-4 text-sm font-medium text-ink hover:bg-line-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formState.isValid || formState.isSubmitting}
              className="h-9 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-40"
            >
              {formState.isSubmitting ? 'Submitting…' : 'Submit payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
