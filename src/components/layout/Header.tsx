'use client'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'
import { useUiStore } from '@/stores/ui-store'
import { env } from '@/lib/env'
import { useLogout } from '@/hooks/hooks'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { Bell, Menu, Moon, Sun } from 'lucide-react'

export function Header(): React.JSX.Element {
  const user = useAuthStore((s) => s.user)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const logout = useLogout()
  const { theme, setTheme } = useTheme()
  const network = env.NEXT_PUBLIC_STELLAR_NETWORK
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-white/80 px-4 backdrop-blur dark:bg-navy-950/80">
      <button
        aria-label="Toggle sidebar"
        onClick={toggleSidebar}
        className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <Menu size={20} />
      </button>
      <Link href="/" className="font-display text-lg font-bold">
        StellarRail
      </Link>
      <span
        aria-label={`Network: ${network}`}
        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${network === 'mainnet' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}
      >
        {network.toUpperCase()}
      </span>
      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Bell size={18} />
        </Link>
        <button
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {user ? (
          <>
            <span className="hidden text-sm sm:inline">{user.email}</span>
            <Button variant="outline" size="sm" onClick={() => void logout()}>
              Logout
            </Button>
          </>
        ) : (
          <Link href="/login" className="text-sm underline">
            Login
          </Link>
        )}
      </div>
    </header>
  )
}
