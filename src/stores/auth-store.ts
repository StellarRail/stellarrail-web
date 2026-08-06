'use client'
import { create } from 'zustand'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  accessTokenExpiry: number | null
  mfaPending: boolean
  setSession: (user: User, token: string, expiresInSec: number) => void
  setMfaPending: (v: boolean) => void
  updateUser: (u: Partial<User>) => void
  logout: () => void
}

const PROFILE_KEY = 'stellarrail:profile'

function loadProfile(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: typeof window !== 'undefined' ? loadProfile() : null,
  accessToken: null,
  accessTokenExpiry: null,
  mfaPending: false,
  setSession: (user, token, expiresInSec) => {
    try {
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(user))
    } catch {
      /* ignore */
    }
    set({
      user,
      accessToken: token,
      accessTokenExpiry: Date.now() + expiresInSec * 1000,
      mfaPending: false
    })
    // cross-tab sync
    try {
      window.localStorage.setItem('stellarrail:login-event', String(Date.now()))
    } catch {
      /* ignore */
    }
  },
  setMfaPending: (v) => set({ mfaPending: v }),
  updateUser: (u) =>
    set((s) => {
      const next = s.user ? { ...s.user, ...u } : s.user
      try {
        if (next) window.localStorage.setItem(PROFILE_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return { user: next }
    }),
  logout: () => {
    try {
      window.localStorage.removeItem(PROFILE_KEY)
      window.localStorage.setItem('stellarrail:logout-event', String(Date.now()))
      if ('BroadcastChannel' in window) {
        new BroadcastChannel('stellarrail-auth').postMessage({ type: 'logout' })
      }
    } catch {
      /* ignore */
    }
    set({ user: null, accessToken: null, accessTokenExpiry: null, mfaPending: false })
  }
}))

// Cross-tab logout listener (call once in layout)
export function initCrossTabLogout(onLogout: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined
  const onStorage = (e: StorageEvent): void => {
    if (e.key === 'stellarrail:logout-event') onLogout()
  }
  window.addEventListener('storage', onStorage)
  let bc: BroadcastChannel | null = null
  if ('BroadcastChannel' in window) {
    bc = new BroadcastChannel('stellarrail-auth')
    bc.onmessage = (ev: MessageEvent) => {
      if (ev.data?.type === 'logout') onLogout()
    }
  }
  return () => {
    window.removeEventListener('storage', onStorage)
    bc?.close()
  }
}
