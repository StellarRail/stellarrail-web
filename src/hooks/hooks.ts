'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { env } from '@/lib/env'

export function useSession(): {
  user: ReturnType<typeof useAuthStore.getState>['user']
  loading: boolean
} {
  const user = useAuthStore((s) => s.user)
  return { user, loading: false }
}

export function useRequireAuth(roles?: string[]): { authorized: boolean } {
  const user = useAuthStore((s) => s.user)
  const router = useRouter()
  useEffect(() => {
    if (!user) {
      const next = typeof window !== 'undefined' ? window.location.pathname : '/'
      router.replace(`/login?next=${encodeURIComponent(next)}`)
    } else if (roles && !roles.includes(user.role)) {
      router.replace('/403')
    }
  }, [user, router, roles])
  return { authorized: Boolean(user && (!roles || roles.includes(user.role))) }
}

export function useSilentRefresh(): void {
  const expiry = useAuthStore((s) => s.accessTokenExpiry)
  useEffect(() => {
    if (!expiry) return
    const ms = expiry - Date.now() - 60_000
    if (ms <= 0) {
      void fetch(`${env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      })
        .then(async (r) => {
          if (!r.ok) useAuthStore.getState().logout()
        })
        .catch(() => undefined)
      return
    }
    const t = setTimeout(() => {
      void fetch(`${env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      }).catch(() => undefined)
    }, ms)
    return () => clearTimeout(t)
  }, [expiry])
}

export function useCountdown(deadline?: string): {
  label: string
  state: 'ok' | 'soon' | 'expired'
} {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  if (!deadline) return { label: '—', state: 'ok' }
  const diff = new Date(deadline).getTime() - now
  if (diff <= 0) return { label: 'Expired', state: 'expired' }
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  const label = h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`
  return { label, state: diff < 3600000 ? 'soon' : 'ok' }
}

export function useDebounce<T>(value: T, delay = 400): T {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return v
}

export function usePaymentStatus(id: string, initial: string): { status: string; live: boolean } {
  const [status, setStatus] = useState(initial)
  const [live, setLive] = useState(true)
  const terminal = new Set(['SETTLED', 'REFUNDED', 'FAILED'])
  useEffect(() => {
    if (terminal.has(status)) {
      setLive(false)
      return
    }
    const wsUrl = env.NEXT_PUBLIC_WS_URL
    if (wsUrl) {
      try {
        const ws = new WebSocket(`${wsUrl}/payments/${id}`)
        ws.onmessage = (ev: MessageEvent) => {
          try {
            const d = JSON.parse(String(ev.data)) as { status?: string }
            if (d.status) setStatus(d.status)
          } catch {
            /* ignore */
          }
        }
        return () => ws.close()
      } catch {
        /* fall through to polling */
      }
    }
    const t = setInterval(async () => {
      try {
        const r = await fetch(`${env.NEXT_PUBLIC_API_URL}/payments/${id}`)
        if (r.ok) {
          const j = (await r.json()) as { status?: string }
          if (j.status) setStatus(j.status)
        }
      } catch {
        /* ignore */
      }
    }, 5000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, status])
  return { status, live }
}

export function useAutosave<T>(key: string, value: T, delay = 10000): void {
  const ref = useRef(value)
  ref.current = value
  useEffect(() => {
    const t = setInterval(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(ref.current))
      } catch {
        /* ignore */
      }
    }, delay)
    return () => clearInterval(t)
  }, [key, delay])
}

export function useOnline(): boolean {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)
  useEffect(() => {
    const on = (): void => setOnline(true)
    const off = (): void => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}

export function useLogout(): () => Promise<void> {
  const router = useRouter()
  return useCallback(async () => {
    try {
      await fetch(`${env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: 'POST' })
    } catch {
      /* ignore */
    }
    useAuthStore.getState().logout()
    router.replace('/login')
  }, [router])
}
