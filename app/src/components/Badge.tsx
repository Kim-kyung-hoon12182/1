import type { ReactNode } from 'react'
import Icon from '@/components/Icon'
import { cn } from '@/lib/cn'

type BadgeTone = 'surface' | 'primary' | 'solid' | 'muted' | 'flag' | 'flagSoft'

type BadgeProps = {
  tone?: BadgeTone
  size?: 'sm' | 'md'
  pill?: boolean
  icon?: string
  title?: string
  className?: string
  children: ReactNode
}

const TONES: Record<BadgeTone, string> = {
  surface: 'bg-surface text-secondary',
  primary: 'bg-primary-fixed text-on-primary-fixed',
  solid: 'bg-primary text-on-primary',
  muted: 'bg-neutral-soft text-neutral-text',
  flag: 'bg-flag-tint text-flag-text',
  flagSoft: 'bg-flag-soft text-flag-text ring-1 ring-flag-line',
}

const SIZES = {
  sm: { box: 'px-2 py-0.5 text-label-sm', icon: 'text-[13px]' },
  md: { box: 'px-2.5 py-1 text-label-md', icon: 'text-[15px]' },
}

const isFlag = (tone: BadgeTone) => tone === 'flag' || tone === 'flagSoft'

export default function Badge({ tone = 'surface', size = 'sm', pill = false, icon, title, className, children }: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex shrink-0 items-center gap-1',
        pill ? 'rounded-full' : 'rounded',
        SIZES[size].box,
        TONES[tone],
        className,
      )}
    >
      {icon && <Icon name={icon} className={cn(SIZES[size].icon, isFlag(tone) && 'text-flag-icon')} />}
      {children}
    </span>
  )
}
