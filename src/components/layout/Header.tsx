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
  Cpu
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
            className="text-ink-secondary hover:text-ink dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
          >
            Home
          </Link>
        </li>
        {parts.map((p) => (
          <li key={p} className="flex items-center gap-1.5">
            <ChevronRight
              size={13}
              strokeWidth={1.5}
              aria-hidden="true"
              className="text-slate-400 dark:text-slate-600"
            />
            <span
              aria-current="page"
              className="font-medium text-ink dark:text-slate-200 capitalize"
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
  { href: '/', label: 'Go to Dashboard', icon: LayoutDashboard, category: 'Navigation' },
  { href: '/payments', label: 'Go to Payments', icon: ArrowLeftRight, category: 'Navigation' },
  { href: '/payments/new', label: 'Create payment', icon: PlusCircle, category: 'Action' },
  { href: '/approvals', label: 'Go to Approvals', icon: ShieldCheck, category: 'Governance' },
  { href: '/admin/audit', label: 'Go to Audit Log', icon: FileText, category: 'Compliance' },
  { href: '/admin/limits', label: 'Go to Settings', icon: Sliders, category: 'Admin' }
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
        className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative w-full max-w-lg rounded-xl border border-line/80 bg-white shadow-2xl overflow-hidden dark:border-white/10 dark:bg-navy-900 animate-item-reveal"
      >
        <div className="flex items-center gap-2.5 border-b border-line px-3.5 dark:border-white/10">
          <Search size={16} strokeWidth={1.5} className="text-slate-400 dark:text-slate-500" />
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
            placeholder="Type a command or jump to page…"
            aria-label="Search commands"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmd-list"
            aria-activedescendant={`cmd-${idx}`}
            className="h-11 w-full bg-transparent text-sm text-ink outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <kbd className="rounded border border-line bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:border-white/10 dark:bg-navy-800 dark:text-slate-400">
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
                    ? 'bg-slate-100 text-ink dark:bg-white/10 dark:text-white font-medium'
                    : 'text-ink-secondary hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    size={16}
                    strokeWidth={1.5}
                    className={
                      isSelected
                        ? 'text-sky-700 dark:text-stellar-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }
                  />
                  <span>{c.label}</span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {c.category}
                </span>
              </li>
            )
          })}
          {results.length === 0 ? (
            <li className="px-3 py-8 text-center text-xs text-slate-600 dark:text-slate-400">
              No matching commands found.
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
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line/80 bg-white/95 px-4 sm:px-6 backdrop-blur-md transition-colors dark:border-white/10 dark:bg-navy-950/90">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={toggleSidebar}
          className="tactile-btn rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-950 md:hidden dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
        >
          <Menu size={18} strokeWidth={1.5} aria-hidden="true" />
        </button>
        <Breadcrumbs />
      </div>

      {/* Center/Right Stellar Telemetry and Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Stellar Consensus Network Telemetry Strip */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-line/80 bg-slate-50/80 px-2.5 py-1 text-xs dark:border-white/10 dark:bg-navy-900/60">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span
              aria-label={`Network: ${network}`}
              className={cn(
                'font-mono text-[10px] font-semibold uppercase tracking-wider',
                network === 'mainnet'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-amber-700 dark:text-amber-400'
              )}
            >
              {network}
            </span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <div className="flex items-center gap-1 text-[11px] font-mono tabular-nums text-slate-700 dark:text-slate-300">
            <Cpu size={12} strokeWidth={1.5} className="text-slate-500 dark:text-slate-400" />
            <span>Seq #52.1M</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="text-[11px] font-mono tabular-nums text-slate-600 dark:text-slate-400">
            4.8s Close
          </span>
        </div>

        {/* Fallback network badge for smaller viewports */}
        <span
          aria-label={`Network: ${network}`}
          className={cn(
            'lg:hidden rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider',
            network === 'mainnet'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300'
          )}
        >
          {network}
        </span>

        {/* Command Search Button */}
        <button
          type="button"
          aria-label="Open command palette"
          onClick={() => setPalette(true)}
          className="tactile-btn flex h-8 items-center gap-2 rounded-md border border-line/80 bg-white px-2.5 text-xs text-slate-600 shadow-subtle hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-navy-900/80 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-slate-100"
        >
          <Search size={14} strokeWidth={1.5} aria-hidden="true" />
          <span className="hidden sm:inline font-sans">Command</span>
          <kbd className="hidden rounded border border-line bg-slate-100 px-1 font-mono text-[10px] text-slate-700 dark:border-white/10 dark:bg-navy-800 dark:text-slate-300 sm:inline">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Link */}
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="tactile-btn relative rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
        >
          <Bell size={16} strokeWidth={1.5} aria-hidden="true" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-brand dark:bg-stellar-400" />
        </Link>

        {/* Theme Toggle */}
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="tactile-btn rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
        >
          {theme === 'dark' ? (
            <Sun size={16} strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <Moon size={16} strokeWidth={1.5} aria-hidden="true" />
          )}
        </button>
      </div>

      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </header>
  )
}
