import * as React from 'react'
import { cn } from '@/lib/cn'
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      aria-busy="true"
      className={cn('animate-pulse rounded-md bg-slate-200', className)}
      {...props}
    />
  )
}
