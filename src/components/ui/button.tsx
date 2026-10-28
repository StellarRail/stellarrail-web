import { cn } from '@/lib/cn'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const buttonVariants = cva(
  'tactile-btn inline-flex items-center justify-center select-none rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-navy-950',
  {
    variants: {
      variant: {
        default:
          'bg-navy-900 text-white shadow-sm hover:bg-navy-800 dark:bg-slate-100 dark:text-navy-950 dark:hover:bg-white',
        brand:
          'bg-brand text-white shadow-sm hover:bg-brand-dark dark:bg-stellar-500 dark:text-navy-950 dark:hover:bg-stellar-400',
        secondary:
          'border border-line/60 bg-slate-100/80 text-ink hover:bg-slate-200/80 dark:border-white/10 dark:bg-navy-800/80 dark:text-slate-200 dark:hover:bg-navy-700',
        destructive:
          'bg-danger text-white shadow-sm hover:bg-danger-dark dark:bg-danger dark:hover:bg-danger-dark',
        outline:
          'border border-line bg-white/90 text-ink shadow-subtle hover:bg-line-hover dark:border-white/10 dark:bg-navy-900/90 dark:text-slate-200 dark:hover:bg-navy-800',
        ghost:
          'text-ink-secondary hover:bg-line-hover/60 hover:text-ink dark:hover:bg-white/5 dark:hover:text-slate-100'
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-5 text-sm'
      }
    },
    defaultVariants: { variant: 'default', size: 'default' }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps): React.JSX.Element {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
export { buttonVariants }
