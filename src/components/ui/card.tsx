import * as React from 'react'
import { cn } from '@/lib/cn'
export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return <div className={cn('rounded-lg border shadow-sm', className)} {...props} />
}
