'use client'
import { RequireRole } from '@/components/auth/RequireRole'
import { seedUsers } from '@/mocks/seed'
import { useState } from 'react'

export default function UsersPage(): React.JSX.Element {
  const [users, setUsers] = useState(seedUsers)
  const [invite, setInvite] = useState(false)
  return (
    <RequireRole roles={['admin']}>
      <h1 className="text-2xl font-bold">Users</h1>
      <button
        onClick={() => setInvite(true)}
        className="mt-3 rounded bg-navy-900 px-3 py-2 text-white"
      >
        Invite user
      </button>
      <table className="mt-3 w-full text-sm">
        <thead>
          <tr>
            <th className="text-left">Email</th>
            <th className="text-left">Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td>{u.email}</td>
              <td>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">{u.role}</span>
              </td>
              <td className="space-x-2">
                <button
                  className="underline"
                  onClick={() =>
                    setUsers((xs) =>
                      xs.map((x) =>
                        x.id === u.id
                          ? ({ ...x, role: x.role === 'admin' ? 'operator' : 'admin' } as typeof x)
                          : x
                      )
                    )
                  }
                >
                  Change role
                </button>
                <button className="underline">Deactivate</button>
                <button className="underline">Reset MFA</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {invite ? (
        <div
          role="dialog"
          aria-label="Invite user"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <button
            aria-label="Close"
            className="absolute inset-0 bg-black/50"
            onClick={() => setInvite(false)}
          />
          <form
            className="relative rounded bg-white p-6 dark:bg-navy-900"
            onSubmit={(e) => {
              e.preventDefault()
              setInvite(false)
            }}
          >
            <h2 className="font-bold">Invite</h2>
            <input
              aria-label="Email"
              type="email"
              required
              placeholder="email"
              className="mt-2 rounded border px-2 py-2"
            />
            <select aria-label="Role" className="mt-2 rounded border px-2 py-2">
              <option>operator</option>
              <option>approver</option>
              <option>admin</option>
            </select>
            <button className="mt-2 rounded bg-navy-900 px-3 py-2 text-white">Send invite</button>
          </form>
        </div>
      ) : null}
    </RequireRole>
  )
}
