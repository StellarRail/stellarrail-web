'use client'
import { create } from 'zustand'

interface UiState {
  sidebarOpen: boolean
  soundEnabled: boolean
  consentGiven: boolean
  degraded: boolean
  toggleSidebar: () => void
  setSidebar: (v: boolean) => void
  setSound: (v: boolean) => void
  setConsent: (v: boolean) => void
  setDegraded: (v: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  soundEnabled: false,
  consentGiven:
    typeof window !== 'undefined' ? window.localStorage.getItem('sr-consent') === 'yes' : false,
  degraded: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebar: (v) => set({ sidebarOpen: v }),
  setSound: (v) => set({ soundEnabled: v }),
  setConsent: (v) => {
    try {
      window.localStorage.setItem('sr-consent', v ? 'yes' : 'no')
    } catch {
      /* ignore */
    }
    set({ consentGiven: v })
  },
  setDegraded: (v) => set({ degraded: v })
}))
