'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { loginSchema, type LoginInput } from '@/features/auth/schemas'
import { loginRequest } from '@/features/auth/api'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-bold">Login</h1>
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="mt-4 space-y-3" noValidate>
        <div>
          <label htmlFor="email">Email</label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-describedby="email-err"
            {...register('email')}
          />
          {formState.errors.email ? (
            <p id="email-err" role="alert" className="text-sm text-red-600">
              {formState.errors.email.message}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <div className="flex gap-2">
            <Input
              id="password"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              aria-describedby="pw-err"
              onKeyUp={(e) => setCaps(e.getModifierState?.('CapsLock') ?? false)}
              {...register('password')}
            />
            <button
              type="button"
              aria-label={showPw ? 'Hide password' : 'Show password'}
              onClick={() => setShowPw((v) => !v)}
              className="rounded border px-3"
            >
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
          {caps ? <p className="text-xs text-amber-600">Caps Lock is on</p> : null}
          {formState.errors.password ? (
            <p id="pw-err" role="alert" className="text-sm text-red-600">
              {formState.errors.password.message}
            </p>
          ) : null}
        </div>
        {serverError ? (
          <p role="alert" className="text-sm text-red-600">
            {serverError}
          </p>
        ) : null}
        <Button type="submit" disabled={formState.isSubmitting} className="w-full">
          {formState.isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </main>
  )
}
