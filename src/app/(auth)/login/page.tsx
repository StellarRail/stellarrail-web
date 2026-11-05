'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Lock, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react'
import { loginSchema, type LoginInput } from '@/features/auth/schemas'
import { loginRequest } from '@/features/auth/api'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BrandMark } from '@/components/ui/BrandLogo'

export default function LoginPage(): React.JSX.Element {
  const router = useRouter()
  const search = useSearchParams()
  const [serverError, setServerError] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [caps, setCaps] = useState(false)

  const { register, handleSubmit, setValue, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (v: LoginInput): Promise<void> => {
    setServerError('')
    try {
      const r = await loginRequest(v.email, v.password)
      if (r.mfaRequired) {
        useAuthStore.getState().setMfaPending(true)
        router.push('/mfa')
      } else {
        router.push(search.get('next') ?? '/')
      }
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Invalid credentials')
    }
  }

  const fillQuick = (email: string) => {
    setValue('email', email, { shouldValidate: true })
    setValue('password', 'password123', { shouldValidate: true })
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 p-4 dark:bg-slate-950 transition-colors">
      <main className="w-full max-w-md animate-item-reveal space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <BrandMark size={36} className="mb-3" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Stellar Treasury Operations
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            Login
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
            Authenticate to manage institutional XLM reserves, multisig approvals, and settlement
            ledgers.
          </p>
        </div>

        {/* Card Form */}
        <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono mb-1.5"
              >
                Work Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="operator@stellarrail.org"
                autoComplete="email"
                aria-describedby={formState.errors.email ? 'email-err' : undefined}
                {...register('email')}
                className="font-mono text-xs"
              />
              {formState.errors.email ? (
                <p
                  id="email-err"
                  role="alert"
                  className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-mono"
                >
                  {formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono"
                >
                  Password
                </label>
                {caps ? (
                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">
                    Caps Lock is on
                  </span>
                ) : null}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  aria-describedby={formState.errors.password ? 'pw-err' : undefined}
                  onKeyUp={(e) => setCaps(e.getModifierState?.('CapsLock') ?? false)}
                  {...register('password')}
                  className="font-mono text-xs pr-10"
                />
                <button
                  type="button"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {formState.errors.password ? (
                <p
                  id="pw-err"
                  role="alert"
                  className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-mono"
                >
                  {formState.errors.password.message}
                </p>
              ) : null}
            </div>

            {serverError ? (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 p-2.5 text-xs text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
              >
                <AlertCircle size={14} className="shrink-0 text-rose-600" />
                <span>{serverError}</span>
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={formState.isSubmitting}
              className="w-full h-10 bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-sky-600 dark:text-white dark:hover:bg-sky-500"
            >
              <Lock size={14} className="mr-1.5" />
              <span>{formState.isSubmitting ? 'Verifying credentials…' : 'Sign in'}</span>
            </Button>
          </form>

          {/* Quick Demo Credential Selectors */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-2">
              Fast Demo Sign-in
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillQuick('operator@stellarrail.test')}
                className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-mono text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
              >
                Operator
              </button>
              <button
                type="button"
                onClick={() => fillQuick('approver@stellarrail.test')}
                className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-mono text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
              >
                Approver
              </button>
              <button
                type="button"
                onClick={() => fillQuick('admin@stellarrail.test')}
                className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-mono text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Security Assurance Footer */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-2">
          <span className="flex items-center gap-1">
            <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>TLS 1.3 Certified</span>
          </span>
          <span>Soroban Consensus v21</span>
        </div>
      </main>
    </div>
  )
}
