'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, Inbox, ScrollText, Settings, LogOut } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useUiStore } from '@/stores/ui-store'
import { useLogout } from '@/hooks/hooks'
import { cn } from '@/lib/cn'
import type { Role } from '@/types'

const links: { href: string; label: string; roles: Role[]; icon: typeof LayoutDashboard }[] = [
  {
    href: '/',
    label: 'Dashboard',
    roles: ['operator', 'approver', 'admin'],
    icon: LayoutDashboard
  },
  {
    href: '/payments',
    label: 'Payments',
    roles: ['operator', 'approver', 'admin'],
    icon: ArrowLeftRight
  },
  { href: '/approvals', label: 'Approvals', roles: ['approver', 'admin'], icon: Inbox },
  { href: '/admin/audit', label: 'Audit Log', roles: ['admin'], icon: ScrollText },
  { href: '/admin/limits', label: 'Settings', roles: ['admin'], icon: Settings }
]

function Nav(): React.JSX.Element {
  const user = useAuthStore((s) => s.user)
  const role: Role = user?.role ?? 'operator'
  const pathname = usePathname()
  const visible = links.filter((l) => l.roles.includes(role))
  return (
    <nav aria-label="Primary">
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
                  'relative flex h-9 items-center gap-2 rounded-md px-3 text-sm text-ink-secondary hover:bg-line-hover hover:text-ink',
                  active && 'bg-line-hover font-medium text-ink'
                )}
              >
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-1 left-0 w-0.5 rounded bg-brand"
                  />
                ) : null}
                <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
                {l.label}
                {l.href === '/approvals' ? (
                  <span
                    data-testid="pending-badge"
                    className="ml-auto rounded-full bg-warning/10 px-1.5 text-xs font-medium text-warning-dark"
                  >
                    4
                  </span>
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function UserFooter(): React.JSX.Element {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const router = useRouter()
  if (!user) {
    return (
      <Link
        href="/login"
        className="flex h-9 items-center rounded-md px-3 text-sm text-ink-secondary hover:bg-line-hover"
      >
        Login
      </Link>
    )
  }
  return (
    <div className="flex items-center gap-2 border-t border-line px-3 py-2">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-line-hover text-xs font-semibold text-ink"
      >
        {user.email.slice(0, 1).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink">{user.email}</span>
        <span className="block text-xs capitalize text-ink-secondary">{user.role}</span>
      </span>
      <button
        type="button"
        aria-label="Logout"
        title="Logout"
        onClick={() => {
          void logout().then(() => router.push('/login'))
        }}
        className="rounded-md p-2 text-ink-secondary hover:bg-line-hover hover:text-ink"
      >
        <LogOut size={16} strokeWidth={1.5} aria-hidden="true" />
      </button>
    </div>
  )
}

export function Sidebar(): React.JSX.Element {
  const open = useUiStore((s) => s.sidebarOpen)
  const setSidebar = useUiStore((s) => s.setSidebar)
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line bg-white md:flex">
        <div className="flex h-14 items-center px-4">
          <Link
            href="/"
            className="text-base font-bold tracking-tight text-ink"
            aria-label="StellarRail home"
          >
            StellarRail
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <Nav />
        </div>
        <UserFooter />
      </aside>
      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-ink/20"
            onClick={() => setSidebar(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-60 flex-col border-r border-line bg-white">
            <div className="flex h-14 items-center px-4">
              <span className="text-base font-bold tracking-tight text-ink">StellarRail</span>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-2" onClick={() => setSidebar(false)}>
              <Nav />
            </div>
            <UserFooter />
          </aside>
        </div>
      ) : null}
    </>
  )
}
