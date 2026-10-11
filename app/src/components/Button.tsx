import type { ButtonHTMLAttributes } from 'react'
import Icon from '@/components/Icon'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'tonal' | 'soft' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  icon?: string
  iconEnd?: boolean
  fullWidth?: boolean
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary shadow-sm hover:bg-primary-container',
  tonal: 'bg-surface text-on-surface hover:bg-surface-high',
  soft: 'bg-surface-high text-primary hover:bg-surface',
  ghost: 'text-secondary hover:bg-surface',
}

const SIZES: Record<Size, { box: string; icon: string }> = {
  sm: { box: 'gap-1 rounded px-2.5 py-1 text-label-md', icon: 'text-[16px]' },
  md: { box: 'gap-1.5 rounded-lg px-3.5 py-2 text-body-sm font-semibold', icon: 'text-[18px]' },
  lg: { box: 'gap-2 rounded-lg px-6 py-3 text-headline-sm', icon: 'text-[20px]' },
}

export default function Button({
  variant = 'tonal',
  size = 'md',
  icon,
  iconEnd = false,
  fullWidth = false,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const iconNode = icon ? <Icon name={icon} className={SIZES[size].icon} /> : null
  return (
    <button
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-40',
        SIZES[size].box,
        VARIANTS[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {!iconEnd && iconNode}
      {children}
      {iconEnd && iconNode}
    </button>
  )
}
