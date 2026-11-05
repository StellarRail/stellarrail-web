'use client'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'
import type { Role } from '@/types'
import { ShieldAlert } from 'lucide-react'

export function RequireRole({
  roles,
  children
}: {
  roles: Role[]
  children: React.ReactNode
}): React.JSX.Element {
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900 shadow-sm max-w-md mx-auto my-12">
        <ShieldAlert size={28} className="mx-auto text-slate-400 mb-3" />
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Authentication Required
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Please log in.</p>
        <Link
          href="/login"
          className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
        >
          Sign in to your account
        </Link>
      </div>
    )
  }

  if (!roles.includes(user.role)) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-rose-300 bg-rose-50 p-6 text-center dark:border-rose-900 dark:bg-rose-950/40 max-w-md mx-auto my-12"
      >
        <ShieldAlert size={28} className="mx-auto text-rose-600 mb-2" />
        <h1 className="text-base font-bold text-rose-950 dark:text-rose-200">
          403 — Unauthorized Role
        </h1>
        <p className="mt-1 text-xs text-rose-800 dark:text-rose-300">
          Your current account role (<span className="font-mono font-semibold">{user.role}</span>)
          does not have sufficient permissions to view this administrative resource.
        </p>
      </div>
    )
  }

  return <>{children}</>
}

export function canApprove(requesterId: string, currentUserId: string | undefined): boolean {
  if (!currentUserId) return false
  return requesterId !== currentUserId
}
