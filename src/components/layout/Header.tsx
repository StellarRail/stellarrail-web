'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, ChevronRight, Menu, Moon, Search, Sun } from 'lucide-react'
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
  new: 'New'
}

function Breadcrumbs(): React.JSX.Element {
  const pathname = usePathname()
  const parts = pathname.split('/').filter(Boolean).slice(0, 2)
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-sm">
        <li>
          <Link href="/" className="text-ink-secondary hover:text-ink">
            Home
          </Link>
        </li>
        {parts.map((p) => (
          <li key={p} className="flex items-center gap-1">
            <ChevronRight
              size={16}
              strokeWidth={1.5}
              aria-hidden="true"
              className="text-ink-secondary"
            />
            <span aria-current="page" className="font-medium text-ink">
              {crumbs[p] ?? p}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  )
}

const commands = [
  { href: '/', label: 'Go to Dashboard' },
  { href: '/payments', label: 'Go to Payments' },
  { href: '/payments/new', label: 'Create payment' },
  { href: '/approvals', label: 'Go to Approvals' },
  { href: '/admin/audit', label: 'Go to Audit Log' },
  { href: '/admin/limits', label: 'Go to Settings' }
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      <div aria-hidden="true" className="absolute inset-0 bg-ink/20" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative w-full max-w-md rounded-md border border-line bg-white"
      >
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
          placeholder="Type a command…"
          aria-label="Search commands"
          role="combobox"
          aria-expanded="true"
          aria-controls="cmd-list"
          aria-activedescendant={`cmd-${idx}`}
          className="h-10 w-full rounded-t-md border-b border-line bg-transparent px-4 text-sm outline-none placeholder:text-ink-secondary/70"
        />
        <ul
          id="cmd-list"
          role="listbox"
          aria-label="Commands"
          className="max-h-64 overflow-auto p-1"
        >
          {results.map((c, i) => (
            <li
              key={c.href}
              id={`cmd-${i}`}
              role="option"
              aria-selected={i === idx}
              onClick={() => go(c.href)}
              onMouseMove={() => setIdx(i)}
              className={cn(
                'cursor-pointer rounded-md px-3 py-2 text-sm',
                i === idx ? 'bg-line-hover text-ink' : 'text-ink-secondary'
              )}
            >
              {c.label}
            </li>
          ))}
          {results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-ink-secondary">No matches.</li>
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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-white px-4">
      <button
        type="button"
        aria-label="Open navigation"
        onClick={toggleSidebar}
        className="rounded-md p-2 text-ink-secondary hover:bg-line-hover hover:text-ink md:hidden"
      >
        <Menu size={20} strokeWidth={1.5} aria-hidden="true" />
      </button>
      <Breadcrumbs />
      <div className="ml-auto flex items-center gap-2">
        <span
          aria-label={`Network: ${network}`}
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wide',
            network === 'mainnet'
              ? 'bg-success/10 text-success-dark'
              : 'bg-warning/10 text-[#92400E]'
          )}
        >
          {network}
        </span>
        <button
          type="button"
          aria-label="Open command palette"
          onClick={() => setPalette(true)}
          className="flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm text-ink-secondary hover:bg-line-hover hover:text-ink"
        >
          <Search size={16} strokeWidth={1.5} aria-hidden="true" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden rounded border border-line bg-canvas px-1 font-mono text-xs sm:inline">
            ⌘K
          </kbd>
        </button>
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="rounded-md p-2 text-ink-secondary hover:bg-line-hover hover:text-ink"
        >
          <Bell size={16} strokeWidth={1.5} aria-hidden="true" />
        </Link>
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-md p-2 text-ink-secondary hover:bg-line-hover hover:text-ink"
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
