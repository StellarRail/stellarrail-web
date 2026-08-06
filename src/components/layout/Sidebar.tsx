'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useUiStore } from '@/stores/ui-store'
import type { Role } from '@/types'

const links: { href: string; label: string; roles: Role[] }[] = [
  { href: '/', label: 'Dashboard', roles: ['operator', 'approver', 'admin'] },
  { href: '/payments/new', label: 'New Payment', roles: ['operator', 'admin'] },
  { href: '/payments', label: 'My Requests', roles: ['operator', 'admin'] },
  { href: '/approvals', label: 'Pending Queue', roles: ['approver', 'admin'] },
  { href: '/approvals/history', label: 'Approval History', roles: ['approver', 'admin'] },
  { href: '/admin/users', label: 'Users', roles: ['admin'] },
  { href: '/admin/limits', label: 'Limits', roles: ['admin'] },
  { href: '/admin/network', label: 'Network', roles: ['admin'] },
  { href: '/admin/audit', label: 'Audit', roles: ['admin'] },
  { href: '/admin/health', label: 'Health', roles: ['admin'] }
]

export function Sidebar(): React.JSX.Element {
  const user = useAuthStore((s) => s.user)
  const role: Role = user?.role ?? 'operator'
  const open = useUiStore((s) => s.sidebarOpen)
  const pathname = usePathname()
  const visible = links.filter((l) => l.roles.includes(role))
  if (!open) return <></>
  return (
    <nav
      aria-label="Primary"
      className="w-56 shrink-0 border-r p-3 max-md:fixed max-md:z-40 max-md:h-full max-md:bg-white max-md:dark:bg-navy-950"
    >
      <ul className="space-y-1">
        {visible.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={pathname === l.href ? 'page' : undefined}
              className={`block rounded px-3 py-2 text-sm ${pathname === l.href ? 'bg-navy-900 text-white dark:bg-stellar-500 dark:text-navy-950' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              {l.label}
              {l.href === '/approvals' ? (
                <span
                  data-testid="pending-badge"
                  className="ml-2 rounded bg-amber-200 px-1 text-xs"
                >
                  4
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
