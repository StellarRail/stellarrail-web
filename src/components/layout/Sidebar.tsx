'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ArrowLeftRight,
  ShieldCheck,
  Bell,
  ScrollText,
  Sliders,
  LogOut,
  Layers,
  ExternalLink
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useUiStore } from '@/stores/ui-store'
import { useLogout } from '@/hooks/hooks'
import { cn } from '@/lib/cn'
import { BrandMark } from '@/components/ui/BrandLogo'
import type { Role } from '@/types'

const primaryNav: {
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
    icon: ShieldCheck,
    shortcut: '⌘3'
  },
  {
    href: '/notifications',
    label: 'Notifications',
    roles: ['operator', 'approver', 'admin'],
    icon: Bell
  }
]

const complianceNav: {
  href: string
  label: string
  roles: Role[]
  icon: typeof ScrollText
  shortcut?: string
}[] = [
  {
    href: '/admin/audit',
    label: 'Audit Log',
    roles: ['admin'],
    icon: ScrollText,
    shortcut: '⌘4'
  },
  {
    href: '/admin/limits',
    label: 'Settings & Limits',
    roles: ['admin'],
    icon: Sliders,
    shortcut: '⌘5'
  }
]

function BrandLogo(): React.JSX.Element {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark size={28} className="shrink-0" />
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-display text-sm font-bold tracking-tight text-slate-900 dark:text-white">
            StellarRail
          </span>
          <span className="rounded border border-slate-200 bg-slate-100 px-1 py-0.2 font-mono text-[9px] font-semibold tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
            TREASURY
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
          XLM Settlement Rails
        </span>
      </div>
    </div>
  )
}

function Nav(): React.JSX.Element {
  const user = useAuthStore((s) => s.user)
  const role: Role = user?.role ?? 'operator'
  const pathname = usePathname()

  const visiblePrimary = primaryNav.filter((l) => l.roles.includes(role))
  const visibleCompliance = complianceNav.filter((l) => l.roles.includes(role))

  return (
    <nav aria-label="Primary navigation" className="space-y-5">
      <div>
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
          Operations
        </p>
        <ul className="space-y-0.5">
          {visiblePrimary.map((l) => {
            const active = pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href))
            const Icon = l.icon
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-9 items-center justify-between rounded-md px-3 text-xs font-medium transition-colors',
                    active
                      ? 'bg-slate-900 text-white font-semibold dark:bg-slate-800 dark:text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      size={15}
                      aria-hidden="true"
                      className={cn(
                        active
                          ? 'text-white dark:text-sky-400'
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
                          'rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold tabular-nums',
                          active
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                        )}
                      >
                        4
                      </span>
                    ) : null}
                    {l.href === '/notifications' ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-600 dark:bg-sky-400" />
                    ) : null}
                    {l.shortcut ? (
                      <span
                        className={cn(
                          'hidden font-mono text-[10px] lg:inline',
                          active ? 'text-slate-400' : 'text-slate-400'
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

      {visibleCompliance.length > 0 ? (
        <div>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
            Administration &amp; Audit
          </p>
          <ul className="space-y-0.5">
            {visibleCompliance.map((l) => {
              const active = pathname === l.href || pathname.startsWith(l.href)
              const Icon = l.icon
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex h-9 items-center justify-between rounded-md px-3 text-xs font-medium transition-colors',
                      active
                        ? 'bg-slate-900 text-white font-semibold dark:bg-slate-800 dark:text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        size={15}
                        aria-hidden="true"
                        className={cn(
                          active
                            ? 'text-white dark:text-sky-400'
                            : 'text-slate-400 dark:text-slate-500'
                        )}
                      />
                      <span>{l.label}</span>
                    </div>
                    {l.shortcut ? (
                      <span
                        className={cn(
                          'hidden font-mono text-[10px] lg:inline',
                          active ? 'text-slate-400' : 'text-slate-400'
                        )}
                      >
                        {l.shortcut}
                      </span>
                    ) : null}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      {/* Multisig Policy Status Card */}
      <div className="pt-2">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
          Governance Policy
        </p>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between text-xs font-medium text-slate-900 dark:text-slate-200">
            <span className="flex items-center gap-1.5">
              <Layers size={13} className="text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <span>Multi-Sig Threshold</span>
            </span>
            <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              2 / 3
            </span>
          </div>
          <div
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
            role="progressbar"
            aria-valuenow={67}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Multisig quorum status: 2 of 3 required signatures"
          >
            <div className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 w-2/3" />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <span>Enforced</span>
            <span>Non-Custodial Escrow</span>
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
      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <Link
          href="/login"
          className="flex h-9 w-full items-center justify-center rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        >
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="border-t border-slate-200 p-3 dark:border-slate-800">
      <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-900/60">
        <div
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-900 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
        >
          {user.email.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-slate-900 dark:text-slate-100">
            {user.email}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {user.role}
            </span>
          </div>
        </div>
        <button
          type="button"
          aria-label="Sign out of StellarRail"
          title="Sign out"
          onClick={() => {
            void logout().then(() => router.push('/login'))
          }}
          className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
        >
          <LogOut size={15} aria-hidden="true" />
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
      {/* Desktop Persistent Sidebar */}
      <aside
        aria-label="Sidebar navigation"
        className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 md:flex"
      >
        <div className="flex h-14 items-center px-5 border-b border-slate-200 dark:border-slate-800">
          <Link href="/" className="focus-visible:outline-none" aria-label="StellarRail Home">
            <BrandLogo />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <Nav />
        </div>
        <UserFooter />
      </aside>

      {/* Mobile Drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            aria-hidden="true"
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebar(false)}
          />
          <aside
            aria-label="Mobile navigation"
            className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex h-14 items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
              <Link href="/" onClick={() => setSidebar(false)} aria-label="StellarRail Home">
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
