import * as React from 'react'
import { cn } from '@/lib/cn'
export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>): React.JSX.Element {
  return (
    <input
      className={cn('flex h-11 w-full rounded-md border px-3 py-2 text-sm', className)}
      {...props}
    />
  )
}
