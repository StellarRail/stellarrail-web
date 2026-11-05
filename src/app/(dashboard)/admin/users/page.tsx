'use client'
import { useState } from 'react'
import { UserPlus, Shield, KeyRound, Check, X, RotateCcw } from 'lucide-react'
import { RequireRole } from '@/components/auth/RequireRole'
import { seedUsers } from '@/mocks/seed'
import type { Role } from '@/types'
import { toast } from 'sonner'

export default function UsersPage(): React.JSX.Element {
  const [users, setUsers] = useState(seedUsers)
  const [invite, setInvite] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<Role>('operator')

  const toggleRole = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextRole: Role =
            u.role === 'admin' ? 'approver' : u.role === 'approver' ? 'operator' : 'admin'
          toast.success(`Role for ${u.email} updated to ${nextRole}`)
          return { ...u, role: nextRole }
        }
        return u
      })
    )
  }

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail) return
    const newUser = {
      id: `user_${Date.now()}`,
      email: newEmail,
      role: newRole,
      mfaEnabled: true
    }
    setUsers((prev) => [...prev, newUser])
    toast.success(`Invitation dispatched to ${newEmail}`)
    setNewEmail('')
    setInvite(false)
  }

  return (
    <RequireRole roles={['admin']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              User Management
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Manage authorized operators, approvers, and institutional system administrators.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setInvite(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 self-start sm:self-auto"
          >
            <UserPlus size={14} />
            <span>Invite User</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-4 py-3 text-left">
                  Email
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  Authorized Role
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  MFA Status
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-medium text-xs text-slate-900 dark:text-slate-100">
                    {u.email}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-mono uppercase font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-emerald-700 dark:text-emerald-400 font-mono">
                    ● Enforced
                  </td>
                  <td className="px-4 py-3 text-right text-xs space-x-2">
                    <button
                      type="button"
                      onClick={() => toggleRole(u.id)}
                      className="text-sky-700 hover:underline dark:text-sky-400 font-medium"
                    >
                      Cycle Role
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.info(`MFA reset token sent to ${u.email}`)}
                      className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                    >
                      Reset MFA
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {invite ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Invite user"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
              onClick={() => setInvite(false)}
            />
            <form
              className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4 animate-item-reveal"
              onSubmit={handleInviteSubmit}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Invite Personnel
                </h2>
                <button
                  type="button"
                  onClick={() => setInvite(false)}
                  className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X size={16} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono mb-1">
                  Work Email
                </label>
                <input
                  aria-label="Email"
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="analyst@stellarrail.org"
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono mb-1">
                  Assigned Operational Role
                </label>
                <select
                  aria-label="Role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="operator">operator (creates requests)</option>
                  <option value="approver">approver (signs multisig)</option>
                  <option value="admin">admin (full institutional access)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setInvite(false)}
                  className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 rounded-md bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </div>
    </RequireRole>
  )
}
