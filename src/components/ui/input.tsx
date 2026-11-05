import * as React from 'react'
import { cn } from '@/lib/cn'

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, type, ...props }, ref) {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 transition-colors',
        'placeholder:text-slate-400',
        'focus-visible:border-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:border-sky-500',
        className
      )}
      {...props}
    />
  )
})
