'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Inbox,
  ScrollText,
  Settings,
  LogOut,
  Layers,
  Sparkles
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useUiStore } from '@/stores/ui-store'
import { useLogout } from '@/hooks/hooks'
import { cn } from '@/lib/cn'
import type { Role } from '@/types'

const links: {
  href: string
  label: string
  roles: Role[]
  icon: typeof LayoutDashboard
  shortcut?: string
}[] = [
  {
    href: '/',
    label: 'Dashboard',
    roles: ['operator', 'approver', 'admin'],
    icon: LayoutDashboard,
    shortcut: '⌘1'
  },
  {
    href: '/payments',
    label: 'Payments',
    roles: ['operator', 'approver', 'admin'],
    icon: ArrowLeftRight,
    shortcut: '⌘2'
  },
  {
    href: '/approvals',
    label: 'Approvals',
    roles: ['approver', 'admin'],
    icon: Inbox,
    shortcut: '⌘3'
  },
  {
    href: '/admin/audit',
    label: 'Audit Log',
    roles: ['admin'],
    icon: ScrollText,
    shortcut: '⌘4'
  },
  {
    href: '/admin/limits',
    label: 'Settings',
    roles: ['admin'],
    icon: Settings,
    shortcut: '⌘5'
  }
]

function BrandLogo(): React.JSX.Element {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-white shadow-sm dark:bg-stellar-500 dark:text-navy-950">
        <svg
          width="18"
          height="18"
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
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-display text-sm font-bold tracking-tight text-ink dark:text-white">
            StellarRail
          </span>
          <span className="rounded border border-line bg-slate-100 px-1 py-0.2 font-mono text-[9px] font-semibold tracking-wider text-slate-500 dark:border-white/10 dark:bg-navy-800 dark:text-slate-400">
            PRO
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
          Institutional Rails
        </span>
      </div>
    </div>
  )
}

function Nav(): React.JSX.Element {
  const user = useAuthStore((s) => s.user)
  const role: Role = user?.role ?? 'operator'
  const pathname = usePathname()
  const visible = links.filter((l) => l.roles.includes(role))

  return (
    <nav aria-label="Primary" className="space-y-4">
      <div>
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
          Operations
        </p>
        <ul className="space-y-1">
          {visible.map((l) => {
            const active = pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href))
            const Icon = l.icon
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                  aria-label={l.label}
                  className={cn(
                    'tactile-btn relative flex h-9 items-center justify-between rounded-lg px-3 text-xs font-medium transition-all duration-150',
                    active
                      ? 'bg-navy-900 text-white shadow-sm dark:bg-white/10 dark:text-white font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      size={15}
                      strokeWidth={active ? 2 : 1.6}
                      aria-hidden="true"
                      className={cn(
                        active
                          ? 'text-white dark:text-stellar-400'
                          : 'text-slate-400 dark:text-slate-500'
                      )}
                    />
                    <span>{l.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {l.href === '/approvals' ? (
                      <span
                        data-testid="pending-badge"
                        className={cn(
                          'rounded-full px-1.5 py-0.2 text-[11px] font-mono font-bold tabular-nums',
                          active
                            ? 'bg-amber-400 text-navy-950'
                            : 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/40'
                        )}
                      >
                        4
                      </span>
                    ) : null}
                    {l.shortcut ? (
                      <span
                        className={cn(
                          'hidden text-[10px] font-mono tracking-tight group-hover:inline lg:inline',
                          active ? 'text-slate-300/60 dark:text-slate-400' : 'text-slate-400/60'
                        )}
                      >
                        {l.shortcut}
                      </span>
                    ) : null}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="pt-2">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
          Settlement Rail
        </p>
        <div className="rounded-lg border border-line/80 bg-slate-50/70 p-3 dark:border-white/5 dark:bg-navy-900/50">
          <div className="flex items-center justify-between text-xs font-medium text-ink dark:text-slate-200">
            <span className="flex items-center gap-1.5">
              <Layers size={13} className="text-brand dark:text-stellar-400" />
              <span>Multi-Sig Threshold</span>
            </span>
            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              2 / 3
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full rounded-full bg-emerald-500 w-2/3 transition-all duration-300" />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <span>Enforced</span>
            <span>Secured Escrow</span>
          </div>
        </div>
      </div>
    </nav>
  )
}

function UserFooter(): React.JSX.Element {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const router = useRouter()

  if (!user) {
    return (
      <div className="border-t border-line/80 p-3 dark:border-white/10">
        <Link
          href="/login"
          className="tactile-btn flex h-9 w-full items-center justify-center rounded-lg border border-line bg-white text-xs font-medium text-ink hover:bg-slate-50 dark:border-white/10 dark:bg-navy-900 dark:text-slate-200"
        >
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="border-t border-line/80 p-3 dark:border-white/10">
      <div className="flex items-center gap-2.5 rounded-lg border border-line/60 bg-slate-50/80 p-2 dark:border-white/5 dark:bg-navy-900/60">
        <div
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-navy-900 text-xs font-semibold text-white shadow-sm dark:bg-slate-200 dark:text-navy-950"
        >
          {user.email.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-ink dark:text-slate-200">{user.email}</p>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="font-mono text-[10px] capitalize text-slate-500 dark:text-slate-400">
              {user.role}
            </span>
          </div>
        </div>
        <button
          type="button"
          aria-label="Logout"
          title="Logout"
          onClick={() => {
            void logout().then(() => router.push('/login'))
          }}
          className="tactile-btn rounded-md p-1.5 text-slate-400 hover:bg-slate-200/80 hover:text-rose-600 dark:hover:bg-white/10 dark:hover:text-rose-400 transition-colors"
        >
          <LogOut size={15} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export function Sidebar(): React.JSX.Element {
  const open = useUiStore((s) => s.sidebarOpen)
  const setSidebar = useUiStore((s) => s.setSidebar)

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line/80 bg-white/95 dark:border-white/10 dark:bg-navy-950/95 backdrop-blur-md md:flex">
        <div className="flex h-14 items-center px-5 border-b border-line/80 dark:border-white/10">
          <Link href="/" className="focus-visible:outline-none" aria-label="StellarRail home">
            <BrandLogo />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <Nav />
        </div>
        <UserFooter />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            aria-hidden="true"
            className="fixed inset-0 bg-navy-950/50 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebar(false)}
          />
          <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-line bg-white shadow-2xl dark:border-white/10 dark:bg-navy-950">
            <div className="flex h-14 items-center justify-between px-5 border-b border-line/80 dark:border-white/10">
              <Link href="/" onClick={() => setSidebar(false)}>
                <BrandLogo />
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4" onClick={() => setSidebar(false)}>
              <Nav />
            </div>
            <UserFooter />
          </aside>
        </div>
      ) : null}
    </>
  )
}
