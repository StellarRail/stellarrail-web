import { cn } from '@/lib/cn'
export function clsxMerge(...args: (string | false | null | undefined)[]): string {
  return args.filter(Boolean).join(' ')
}
export { cn }
