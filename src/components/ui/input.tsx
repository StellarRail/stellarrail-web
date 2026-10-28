import * as React from 'react'
import { cn } from '@/lib/cn'

export function Input({
  className,
  type,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>): React.JSX.Element {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-line bg-white/90 px-3 py-2 text-sm text-ink shadow-subtle transition-all duration-150',
        'placeholder:text-slate-400',
        'focus-visible:border-brand focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:border-white/10 dark:bg-navy-900/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:border-stellar-500 dark:focus-visible:ring-stellar-500/20',
        className
      )}
      {...props}
    />
  )
}
