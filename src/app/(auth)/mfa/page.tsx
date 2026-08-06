'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { mfaRequest } from '@/features/auth/api'
import { useAuthStore } from '@/stores/auth-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function MfaPage(): React.JSX.Element {
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [cooldown, setCooldown] = useState(0)
  const router = useRouter()
  useEffect(() => {
    if (code.length === 6) {
      void (async () => {
        try {
          const r = await mfaRequest(code)
          useAuthStore.getState().setSession(r.user, r.accessToken, r.expiresIn)
          const role = r.user.role
          router.push(role === 'admin' ? '/admin/users' : role === 'approver' ? '/approvals' : '/')
        } catch (e) {
          const n = attempts + 1
          setAttempts(n)
          setErr(e instanceof Error ? e.message : 'Invalid code')
          if (n >= 3) setErr('Too many attempts — account locked for 5 minutes')
          else setCooldown(30)
        }
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [cooldown])
  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-bold">Two-factor authentication</h1>
      <p className="mt-1 text-sm">Enter the 6-digit code from your authenticator app.</p>
      <Input
        aria-label="6-digit code"
        inputMode="numeric"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
      />
      {err ? (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {err}
        </p>
      ) : null}
      <p className="mt-2 text-xs">Attempts: {attempts}/3</p>
      <Button disabled={cooldown > 0} className="mt-3" onClick={() => setCooldown(30)}>
        {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
      </Button>
      <p className="mt-2 text-sm">
        <a href="/login" className="underline">
          Use a backup code
        </a>
      </p>
    </main>
  )
}
