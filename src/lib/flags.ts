import { env } from '@/lib/env'

export const flags = {
  readOnlyMode:
    process.env.NEXT_PUBLIC_READONLY === 'true' ||
    (typeof document !== 'undefined' && document.cookie.includes('readOnlyMode=true')),
  enableMfa: process.env.NEXT_PUBLIC_ENABLE_MFA !== 'false',
  enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== 'false',
  maintenance: env.NEXT_PUBLIC_MAINTENANCE
}

export function isReadOnly(): boolean {
  if (typeof document !== 'undefined' && document.cookie.includes('readOnlyMode=true')) return true
  return process.env.NEXT_PUBLIC_READONLY === 'true'
}
