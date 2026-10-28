import * as React from 'react'
import { cn } from '@/lib/cn'

export function Badge({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'secondary' | 'outline' | 'stellar'
}): React.JSX.Element {
  const variants = {
    default: 'border-transparent bg-navy-900 text-white dark:bg-slate-100 dark:text-navy-950',
    secondary:
      'border-transparent bg-slate-100 text-slate-800 dark:bg-navy-800 dark:text-slate-200',
    outline: 'border-line text-ink dark:border-white/10 dark:text-slate-300',
    stellar:
      'border-sky-300/60 bg-sky-50 text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/60 dark:text-sky-300'
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium tracking-tight',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
