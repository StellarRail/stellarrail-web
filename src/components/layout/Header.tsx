'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell,
  ChevronRight,
  Menu,
  Moon,
  Search,
  Sun,
  LayoutDashboard,
  ArrowLeftRight,
  PlusCircle,
  ShieldCheck,
  FileText,
  Sliders,
  Radio
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { env } from '@/lib/env'
import { useUiStore } from '@/stores/ui-store'
import { cn } from '@/lib/cn'

const crumbs: Record<string, string> = {
  payments: 'Payments',
  approvals: 'Approvals',
  admin: 'Admin',
  audit: 'Audit Log',
  users: 'Users',
  limits: 'Settings',
  network: 'Network',
  health: 'Health',
  account: 'Account',
  notifications: 'Notifications',
  new: 'New Payment'
}

function Breadcrumbs(): React.JSX.Element {
  const pathname = usePathname()
  const parts = pathname.split('/').filter(Boolean).slice(0, 2)
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-xs">
        <li>
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
          >
            StellarRail
          </Link>
        </li>
        {parts.map((p) => (
          <li key={p} className="flex items-center gap-1.5">
            <ChevronRight
              size={12}
              aria-hidden="true"
              className="text-slate-400 dark:text-slate-600"
            />
            <span
              aria-current="page"
              className="font-medium text-slate-900 dark:text-slate-100 capitalize"
            >
              {crumbs[p] ?? p}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  )
}

const commands = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, category: 'Navigation' },
  { href: '/payments', label: 'Payments Ledger', icon: ArrowLeftRight, category: 'Navigation' },
  { href: '/payments/new', label: 'Create new payment', icon: PlusCircle, category: 'Action' },
  { href: '/approvals', label: 'Approvals Queue', icon: ShieldCheck, category: 'Operations' },
  { href: '/notifications', label: 'Notifications', icon: Bell, category: 'Activity' },
  { href: '/admin/audit', label: 'Audit Log', icon: FileText, category: 'Compliance' },
  { href: '/admin/limits', label: 'Settings & Limits', icon: Sliders, category: 'Admin' }
]

function CommandPalette({
  open,
  onClose
}: {
  open: boolean
  onClose: () => void
}): React.JSX.Element | null {
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const results = commands.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()))

  useEffect(() => {
    if (open) {
      setQ('')
      setIdx(0)
      inputRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const go = (href: string): void => {
    onClose()
    router.push(href)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-slate-900 animate-item-reveal"
      >
        <div className="flex items-center gap-2.5 border-b border-slate-200 px-3.5 dark:border-slate-800">
          <Search size={16} className="text-slate-400 dark:text-slate-500" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setIdx(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setIdx((i) => Math.min(i + 1, results.length - 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setIdx((i) => Math.max(i - 1, 0))
              } else if (e.key === 'Enter') {
                const target = results[idx]
                if (target) go(target.href)
              }
            }}
            placeholder="Search commands or navigate..."
            aria-label="Search commands"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmd-list"
            aria-activedescendant={`cmd-${idx}`}
            className="h-12 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <kbd className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            ESC
          </kbd>
        </div>
        <ul
          id="cmd-list"
          role="listbox"
          aria-label="Commands"
          className="max-h-72 overflow-y-auto p-1.5"
        >
          {results.map((c, i) => {
            const Icon = c.icon
            const isSelected = i === idx
            return (
              <li
                key={c.href}
                id={`cmd-${i}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => go(c.href)}
                onMouseMove={() => setIdx(i)}
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors',
                  isSelected
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-medium'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    size={16}
                    className={
                      isSelected
                        ? 'text-sky-600 dark:text-sky-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }
                  />
                  <span>{c.label}</span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {c.category}
                </span>
              </li>
            )
          })}
          {results.length === 0 ? (
            <li className="px-3 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No matching commands.
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  )
}

export function Header(): React.JSX.Element {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const { theme, setTheme } = useTheme()
  const [palette, setPalette] = useState(false)
  const network = env.NEXT_PUBLIC_STELLAR_NETWORK

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/90">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={toggleSidebar}
          className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <Menu size={18} aria-hidden="true" />
        </button>
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Unmistakable Network Environment Badge */}
        <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs dark:border-slate-800 dark:bg-slate-900">
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              network === 'mainnet' ? 'bg-emerald-500' : 'bg-amber-500'
            )}
            aria-hidden="true"
          />
          <span
            aria-label={`Current network: ${network}`}
            className={cn(
              'font-mono text-[11px] font-semibold uppercase tracking-wider',
              network === 'mainnet'
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-amber-700 dark:text-amber-400'
            )}
          >
            {network}
          </span>
          <span className="hidden md:inline text-slate-300 dark:text-slate-700">|</span>
          <span className="hidden md:flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <Radio size={11} className="text-slate-400" />
            <span>Horizon Live (4.8s close)</span>
          </span>
        </div>

        {/* Command Search Button */}
        <button
          type="button"
          aria-label="Open command palette"
          onClick={() => setPalette(true)}
          className="flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-slate-100"
        >
          <Search size={14} aria-hidden="true" />
          <span className="hidden sm:inline font-sans">Search</span>
          <kbd className="hidden rounded border border-slate-200 bg-slate-100 px-1 font-mono text-[10px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 sm:inline">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Link */}
        <Link
          href="/notifications"
          aria-label="Notifications, 1 unread"
          className="relative rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <Bell size={16} aria-hidden="true" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-sky-600 dark:bg-sky-400" />
        </Link>

        {/* Theme Toggle */}
        <button
          type="button"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          {theme === 'dark' ? (
            <Sun size={16} aria-hidden="true" />
          ) : (
            <Moon size={16} aria-hidden="true" />
          )}
        </button>
      </div>

      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </header>
  )
}
