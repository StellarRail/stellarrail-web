'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { paymentSchema } from '@/lib/validators'
import { checkBlocklist, createPayment } from '@/features/payments/api'
import { useDebounce, useAutosave, useOnline } from '@/hooks/hooks'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { STROOPS_PER_XLM, truncateAddress } from '@/lib/formatters'
import { toast } from 'sonner'
import { isReadOnly } from '@/lib/flags'
import { z } from 'zod'
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Info,
  Clock,
  Layers,
  Copy,
  Check
} from 'lucide-react'
import { cn } from '@/lib/cn'

type FormValues = z.infer<typeof paymentSchema>

const TREASURY_TOTAL = 12500.75
const BASE_RESERVE = 1.5
const AVAILABLE_LIQUIDITY = TREASURY_TOTAL - BASE_RESERVE
const ESTIMATED_FEE = 0.00001
const XLM_USD_RATE = 0.132

export default function NewPaymentPage(): React.JSX.Element {
  const router = useRouter()
  const ro = typeof window !== 'undefined' ? isReadOnly() : false
  const online = useOnline()
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2>(0) // 0: Form, 1: Review, 2: Success
  const [blockWarn, setBlockWarn] = useState('')
  const [createdPayment, setCreatedPayment] = useState<{ id: string; referenceId: string } | null>(
    null
  )
  const [copied, setCopied] = useState(false)

  const { register, handleSubmit, watch, setValue, formState, trigger } = useForm<FormValues>({
    resolver: zodResolver(paymentSchema),
    mode: 'onTouched',
    defaultValues: (() => {
      try {
        const raw = window.localStorage.getItem('sr-draft')
        if (raw) return JSON.parse(raw) as FormValues
      } catch {
        /* ignore */
      }
      return { destination: '', amountXlm: '', referenceId: '', memo: '' }
    })()
  })

  const formValues = watch()
  const dest = watch('destination')
  const amount = watch('amountXlm')
  const debouncedDest = useDebounce(dest, 500)
  useAutosave('sr-draft', formValues, 10000)

  // Real-time blocklist check
  const onCheckBlock = async (addr: string): Promise<void> => {
    if (addr.length !== 56) return
    const r = await checkBlocklist(addr).catch(() => ({
      blocked: false as boolean,
      reason: undefined as string | undefined
    }))
    setBlockWarn(r.blocked ? `Blocked address detected: ${r.reason ?? 'Sanctioned entity'}` : '')
  }

  if (debouncedDest) void onCheckBlock(debouncedDest)

  const setMaxAmount = (): void => {
    setValue('amountXlm', AVAILABLE_LIQUIDITY.toFixed(7), { shouldValidate: true })
  }

  const handleProceedToReview = async (): Promise<void> => {
    const valid = await trigger()
    if (valid && !blockWarn) {
      setCurrentStep(1)
    }
  }

  const handleFinalSubmit = async (): Promise<void> => {
    if (blockWarn || ro) return
    try {
      const p = await createPayment(formValues)
      setCreatedPayment({ id: p.id, referenceId: p.referenceId })
      setCurrentStep(2)
      try {
        window.localStorage.removeItem('sr-draft')
      } catch {
        /* ignore */
      }
      toast.success(`Payment ${p.referenceId} submitted to escrow`)
    } catch {
      toast.error('Submission failed. Your draft has been preserved.')
      setCurrentStep(0)
    }
  }

  const copyRef = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const amountNumber = Number(amount) || 0
  const usdValue = (amountNumber * XLM_USD_RATE).toFixed(2)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            New Payment
          </h1>
          <span className="rounded-full border border-sky-300 bg-sky-50 px-2 py-0.2 font-mono text-[10px] font-semibold text-sky-800 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300">
            Escrow Settlement
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Create and escrow XLM disbursements requiring 2-of-3 multisig authorization before
          release.
        </p>
      </div>

      {!online ? (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
        >
          <Info size={14} className="shrink-0" aria-hidden="true" />
          <span>Offline mode active: Input is preserved in secure local storage.</span>
        </div>
      ) : null}

      {/* Workflow Stepper */}
      <nav
        aria-label="Creation stages"
        className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <ol className="grid grid-cols-3 gap-2">
          {[
            { step: 0, label: '1. Payment Details' },
            { step: 1, label: '2. Review & Escrow' },
            { step: 2, label: '3. Quorum Queue' }
          ].map((s) => {
            const isCompleted = currentStep > s.step
            const isCurrent = currentStep === s.step
            return (
              <li
                key={s.step}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-md border p-2 text-xs font-mono transition-colors',
                  isCurrent
                    ? 'border-sky-600 bg-sky-50/70 font-semibold text-slate-900 dark:border-sky-500 dark:bg-slate-800 dark:text-white'
                    : isCompleted
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500'
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                        ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  )}
                >
                  {isCompleted ? '✓' : s.step + 1}
                </span>
                <span className="truncate">{s.label}</span>
              </li>
            )
          })}
        </ol>
      </nav>

      {/* STAGE 0: Payment Form */}
      {currentStep === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void handleProceedToReview()
            }}
            className="space-y-5"
            noValidate
          >
            {/* Destination Address */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="destination"
                  className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono"
                >
                  Destination Stellar Address
                </label>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Starts with G (56 chars)
                </span>
              </div>
              <Input
                id="destination"
                placeholder="e.g. GDQNY3PBOJOKYZSRMK2S7LHHN6G7IEZ7KZN7FMVJGY6L3QJ5FQ5K2C7A1"
                {...register('destination')}
                aria-describedby={
                  formState.errors.destination ? 'dest-err' : blockWarn ? 'dest-warn' : undefined
                }
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
                  id="dest-warn"
                  role="alert"
                  className="mt-2 flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 p-2 text-xs text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
                >
                  <AlertTriangle size={14} className="shrink-0 text-rose-600" />
                  <span>{blockWarn}</span>
                </div>
              ) : null}
            </div>

            {/* Amount (XLM) with Balance and Fee Context */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="amountXlm"
                  className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono"
                >
                  Disbursement Amount (XLM)
                </label>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  ≈ ${usdValue} USD
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  id="amountXlm"
                  inputMode="decimal"
                  placeholder="0.0000000"
                  {...register('amountXlm')}
                  aria-describedby="amt-context"
                  className="font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={setMaxAmount}
                  className="shrink-0 rounded-md border border-slate-300 bg-slate-100 px-3.5 text-xs font-mono font-semibold text-slate-800 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Max Available
                </button>
              </div>

              {/* Explicit Balance & Fee Communication */}
              <div
                id="amt-context"
                className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2"
              >
                <span>
                  Available Liquidity:{' '}
                  <strong className="font-mono text-slate-900 dark:text-slate-200">
                    {AVAILABLE_LIQUIDITY.toFixed(2)} XLM
                  </strong>{' '}
                  <span className="text-[11px] text-slate-500">
                    (1.5 XLM base reserve retained)
                  </span>
                </span>
                <span>
                  Network Fee:{' '}
                  <strong className="font-mono text-slate-900 dark:text-slate-200">
                    {ESTIMATED_FEE} XLM
                  </strong>
                </span>
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

            {/* Reference and Memo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="referenceId"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono mb-1.5"
                >
                  Reference ID (Required)
                </label>
                <Input
                  id="referenceId"
                  placeholder="e.g. REF-2026-XLM"
                  {...register('referenceId')}
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
                  htmlFor="memo"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono mb-1.5"
                >
                  Stellar Memo (Optional, ≤28 chars)
                </label>
                <Input
                  id="memo"
                  maxLength={28}
                  placeholder="Audit reference note"
                  {...register('memo')}
                  className="text-xs"
                />
                {formState.errors.memo ? (
                  <p role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                    {formState.errors.memo.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                disabled={ro || Boolean(blockWarn)}
                className="w-full h-10 bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-sky-600 dark:text-white dark:hover:bg-sky-500"
              >
                <span>Continue to Review</span>
                <ArrowRight size={15} className="ml-1.5" />
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* STAGE 1: Explicit Review Step */}
      {currentStep === 1 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Review Escrow Authorization
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Please inspect the payment parameters carefully before submitting to the multisig
              escrow queue.
            </p>
          </div>

          {/* Breakdown definition list */}
          <dl className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <dt className="font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                Disbursement Amount
              </dt>
              <dd className="font-mono text-base font-bold text-slate-900 dark:text-white tabular-nums">
                {formValues.amountXlm} XLM{' '}
                <span className="text-xs font-normal text-slate-500">(${usdValue} USD)</span>
              </dd>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <dt className="font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                Estimated Network Fee
              </dt>
              <dd className="font-mono font-medium text-slate-900 dark:text-slate-200">
                {ESTIMATED_FEE} XLM (100 stroops)
              </dd>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <dt className="font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                Reference ID
              </dt>
              <dd className="font-mono font-semibold text-slate-900 dark:text-slate-200">
                {formValues.referenceId}
              </dd>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <dt className="font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                Memo
              </dt>
              <dd className="font-mono text-slate-900 dark:text-slate-200">
                {formValues.memo || 'None specified'}
              </dd>
            </div>

            <div>
              <dt className="font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                Destination Public Key
              </dt>
              <dd className="font-mono text-[11px] text-slate-900 dark:text-slate-200 break-all bg-white p-2 rounded border border-slate-200 dark:border-slate-800 dark:bg-slate-800">
                {formValues.destination}
              </dd>
            </div>
          </dl>

          {/* Plain Language Escrow & Multisig Notice */}
          <div className="rounded-lg border border-sky-300 bg-sky-50 p-3.5 text-xs text-sky-950 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-sky-900 dark:text-sky-300">
              <Lock size={14} />
              <span>Escrow &amp; Multisig Mechanics</span>
            </div>
            <p className="text-sky-800 dark:text-sky-300 text-[11px] leading-relaxed">
              Upon submission, funds are locked into a non-custodial smart escrow contract. The
              transaction requires approval from <strong>2 of 3 authorized keys</strong> before
              ledger settlement. If quorum is not met within <strong>90 minutes</strong>, the
              contract unlocks an automatic refund back to the treasury reserve.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(0)}
              className="flex-1 h-10 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Back to Edit
            </button>
            <button
              type="button"
              onClick={() => void handleFinalSubmit()}
              className="flex-1 h-10 rounded-md bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
            >
              Confirm &amp; Lock in Escrow
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: Quorum Queue Confirmation */}
      {currentStep === 2 && createdPayment && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 size={24} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Payment Locked &amp; Queued for Quorum
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Reference {createdPayment.referenceId} has been successfully submitted to the 2-of-3
              multisig approvals queue.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60 inline-flex items-center gap-2 font-mono text-xs">
            <span>Payment ID: {createdPayment.id}</span>
            <button
              type="button"
              onClick={() => copyRef(createdPayment.id)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
            </button>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/approvals"
              className="w-full sm:w-auto h-9 px-4 rounded-md bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-sky-600 dark:text-white dark:hover:bg-sky-500 flex items-center justify-center gap-1.5"
            >
              <ShieldCheck size={14} />
              <span>Go to Approvals Queue</span>
            </Link>
            <Link
              href="/payments"
              className="w-full sm:w-auto h-9 px-4 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 flex items-center justify-center"
            >
              View Payments Ledger
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
