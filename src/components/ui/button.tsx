import { cn } from '@/lib/cn'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-brand text-white hover:bg-brand-dark',
        secondary: 'bg-line-hover text-ink hover:bg-line',
        destructive: 'bg-danger text-white hover:bg-danger-dark',
        outline: 'border border-line bg-white text-ink hover:bg-line-hover',
        ghost: 'text-ink-secondary hover:bg-line-hover hover:text-ink'
      },
      size: { default: 'h-10', sm: 'h-9 px-3', lg: 'h-11 px-6' }
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
