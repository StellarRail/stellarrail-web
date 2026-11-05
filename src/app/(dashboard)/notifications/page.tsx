'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Volume2,
  VolumeX,
  ExternalLink,
  Check,
  RotateCw
} from 'lucide-react'
import { useUiStore } from '@/stores/ui-store'
import { cn } from '@/lib/cn'

interface NotificationItem {
  id: string
  title: string
  description: string
  timestamp: string
  type: 'settlement' | 'approval' | 'security'
  unread: boolean
  link?: string
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Disbursement REF-2024004 Settled',
    description: 'Payment of 400.00 XLM successfully confirmed on Stellar Horizon ledger.',
    timestamp: '12 minutes ago',
    type: 'settlement',
    unread: true,
    link: '/payments/pay_004'
  },
  {
    id: 'notif_2',
    title: 'New Multisig Approval Required',
    description: 'Reference REF-2024007 (700.50 XLM) is awaiting your cryptographic signature.',
    timestamp: '45 minutes ago',
    type: 'approval',
    unread: true,
    link: '/approvals'
  },
  {
    id: 'notif_3',
    title: 'Escrow Lock Contract Confirmed',
    description:
      'Non-custodial smart escrow contract CC0003ESCROWTESTNET deployed with 90m timelock.',
    timestamp: '2 hours ago',
    type: 'settlement',
    unread: false,
    link: '/payments/pay_003'
  },
  {
    id: 'notif_4',
    title: 'Session Authenticated via MFA',
    description: 'Ed25519 cryptographic token exchange verified for operator session.',
    timestamp: '4 hours ago',
    type: 'security',
    unread: false
  }
]

export default function NotificationsPage(): React.JSX.Element {
  const [items, setItems] = useState<NotificationItem[]>(initialNotifications)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const sound = useUiStore((s) => s.soundEnabled)
  const setSound = useUiStore((s) => s.setSound)
  const [browserPermission, setBrowserPermission] = useState<string>(() => {
    return typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default'
  })

  const enableBrowser = async (): Promise<void> => {
    if ('Notification' in window) {
      const res = await Notification.requestPermission()
      setBrowserPermission(res)
    }
  }

  const markAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, unread: false })))
  }

  const markItemRead = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, unread: false } : item)))
  }

  const filteredItems = items.filter((it) => (filter === 'unread' ? it.unread : true))
  const unreadCount = items.filter((it) => it.unread).length

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Notifications
            </h1>
            {unreadCount > 0 ? (
              <span className="rounded-full bg-sky-100 px-2 py-0.5 font-mono text-[10px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                {unreadCount} Unread
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Realtime ledger activity, multisig quorum alerts, and operational notices.
          </p>
        </div>

        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={markAllRead}
            className="text-xs font-semibold text-sky-700 hover:underline dark:text-sky-400 self-start sm:self-auto"
          >
            Mark all as read
          </button>
        ) : null}
      </div>

      {/* Preferences Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-xs">
        {/* Filter Pills */}
        <div className="flex items-center rounded-md border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={cn(
              'rounded px-2.5 py-1 text-xs font-medium transition-colors',
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            All ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={cn(
              'rounded px-2.5 py-1 text-xs font-medium transition-colors',
              filter === 'unread'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Audio & Push Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={sound}
              onChange={(e) => setSound(e.target.checked)}
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span className="flex items-center gap-1">
              {sound ? <Volume2 size={13} /> : <VolumeX size={13} className="text-slate-400" />}
              <span>Sound alerts</span>
            </span>
          </label>

          {browserPermission !== 'granted' ? (
            <button
              type="button"
              onClick={() => void enableBrowser()}
              className="rounded border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Enable push alerts
            </button>
          ) : (
            <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
              ● Push active
            </span>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {filteredItems.length > 0 ? (
        <ul className="space-y-2.5" aria-label="Notifications list">
          {filteredItems.map((n) => {
            const Icon =
              n.type === 'settlement' ? CheckCircle2 : n.type === 'approval' ? Clock : ShieldAlert

            return (
              <li
                key={n.id}
                onClick={() => markItemRead(n.id)}
                className={cn(
                  'flex items-start gap-3 rounded-xl border p-4 transition-colors cursor-pointer',
                  n.unread
                    ? 'border-sky-200 bg-sky-50/40 dark:border-sky-900/60 dark:bg-sky-950/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/40'
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5',
                    n.type === 'settlement'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : n.type === 'approval'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                  )}
                >
                  <Icon size={16} aria-hidden="true" />
                </div>

                <div className="flex-1 min-w-0 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {n.title}
                    </p>
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">
                      {n.timestamp}
                    </span>
                  </div>
                  <p className="mt-0.5 text-slate-600 dark:text-slate-400 leading-relaxed">
                    {n.description}
                  </p>
                  {n.link ? (
                    <div className="mt-2">
                      <Link
                        href={n.link}
                        className="inline-flex items-center gap-1 font-semibold text-sky-700 hover:underline dark:text-sky-400 text-[11px]"
                      >
                        <span>View Details</span>
                        <ExternalLink size={10} aria-hidden="true" />
                      </Link>
                    </div>
                  ) : null}
                </div>

                {n.unread ? (
                  <span
                    aria-label="Unread"
                    className="h-2 w-2 rounded-full bg-sky-600 dark:bg-sky-400 shrink-0 mt-2"
                  />
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            No notifications in this view.
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            You are fully caught up with all treasury operations.
          </p>
        </div>
      )}
    </div>
  )
}
