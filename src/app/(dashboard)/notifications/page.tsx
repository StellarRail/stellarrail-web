'use client'
import { useUiStore } from '@/stores/ui-store'
export default function NotificationsPage(): React.JSX.Element {
  const sound = useUiStore((s) => s.soundEnabled)
  const setSound = useUiStore((s) => s.setSound)
  const enableBrowser = (): void => {
    if ('Notification' in window) void Notification.requestPermission()
  }
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <ul className="mt-3 space-y-2">
        <li className="rounded border p-3 text-sm">Payment pay_004 settled ✓</li>
        <li className="rounded border p-3 text-sm">New pending request: REF-2024004</li>
      </ul>
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} /> Sound
        on new pending
      </label>
      <button onClick={enableBrowser} className="mt-2 rounded border px-3 py-1 text-sm">
        Enable browser notifications
      </button>
    </div>
  )
}
