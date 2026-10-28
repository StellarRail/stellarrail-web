'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Lock, ShieldCheck, ArrowRight, ShieldAlert } from 'lucide-react'
import { loginSchema, type LoginInput } from '@/features/auth/schemas'
import { loginRequest } from '@/features/auth/api'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/cn'

export default function LoginPage(): React.JSX.Element {
  const router = useRouter()
  const search = useSearchParams()
  const [serverError, setServerError] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [caps, setCaps] = useState(false)
  const { register, handleSubmit, formState } = useForm<LoginInput>({
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

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center bg-canvas p-4 transition-colors dark:bg-navy-950">
      {/* Background Architectural Mesh Grid */}
      <div className="absolute inset-0 rail-pattern opacity-40 pointer-events-none" />

      <main className="relative z-10 w-full max-w-md animate-item-reveal">
        {/* Brand Terminal Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 text-white shadow-md dark:bg-stellar-500 dark:text-navy-950 mb-3">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Stellar Settlement Rails
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink dark:text-white font-display">
            Login
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Authorized personnel only. Sessions authenticated via Soroban multisig keys.
          </p>
        </div>

        {/* Auth Card Container */}
        <div className="rounded-2xl border border-line/80 bg-white p-7 shadow-subtle dark:border-white/10 dark:bg-navy-900/90 backdrop-blur-md">
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono mb-1.5"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="operator@stellarrail.org"
                autoComplete="email"
                aria-describedby="email-err"
                {...register('email')}
                className="font-mono text-xs"
              />
              {formState.errors.email ? (
                <p
                  id="email-err"
                  role="alert"
                  className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-mono"
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
              <div className="relative flex">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  aria-describedby="pw-err"
                  onKeyUp={(e) => setCaps(e.getModifierState?.('CapsLock') ?? false)}
                  {...register('password')}
                  className="font-mono text-xs pr-10"
                />
                <button
                  type="button"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPw((v) => !v)}
                  className="tactile-btn absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {formState.errors.password ? (
                <p
                  id="pw-err"
                  role="alert"
                  className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-mono"
                >
                  {formState.errors.password.message}
                </p>
              ) : null}
            </div>

            {serverError ? (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 p-2.5 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300"
              >
                <ShieldAlert size={14} className="shrink-0 text-rose-600" />
                <span>{serverError}</span>
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={formState.isSubmitting}
              className="tactile-btn min-h-[42px] w-full bg-navy-900 text-sm font-semibold text-white shadow-subtle hover:bg-navy-800 dark:bg-stellar-500 dark:text-navy-950 dark:hover:bg-stellar-400"
            >
              <Lock size={14} className="mr-1.5" />
              <span>{formState.isSubmitting ? 'Signing in…' : 'Sign in'}</span>
            </Button>
          </form>

          <div className="mt-6 border-t border-line/60 pt-4 dark:border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span>TLS 1.3 Strict</span>
            </span>
            <span>Ed25519 Handshake</span>
          </div>
        </div>
      </main>
    </div>
  )
}
