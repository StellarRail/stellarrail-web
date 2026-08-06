'use client'
import { useAuthStore } from '@/stores/auth-store'
import type { Role } from '@/types'

export function RequireRole({
  roles,
  children
}: {
  roles: Role[]
  children: React.ReactNode
}): React.JSX.Element {
  const user = useAuthStore((s) => s.user)
  if (!user) return <p>Please log in.</p>
  if (!roles.includes(user.role)) {
    return (
      <div role="alert" className="rounded border border-red-300 p-4">
        <h1 className="font-semibold">403 — Forbidden</h1>
        <p>You do not have access to this page.</p>
      </div>
    )
  }
  return <>{children}</>
}

export function canApprove(requesterId: string, currentUserId: string | undefined): boolean {
  if (!currentUserId) return false
  return requesterId !== currentUserId
}
