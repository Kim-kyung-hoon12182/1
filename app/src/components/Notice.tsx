import type { ReactNode } from 'react'
import Icon from '@/components/Icon'
import { cn } from '@/lib/cn'

type Tone = 'flag' | 'info' | 'primary'

type NoticeProps = {
  tone?: Tone
  icon?: string
  role?: 'status' | 'alert'
  className?: string
  children: ReactNode
}

const TONES: Record<Tone, { box: string; icon: string }> = {
  flag: { box: 'bg-flag-soft text-flag-ink', icon: 'text-flag-icon' },
  info: { box: 'bg-surface-low text-on-surface-variant', icon: 'text-primary' },
  primary: { box: 'bg-surface text-on-surface', icon: 'text-primary' },
}

export default function Notice({ tone = 'info', icon, role, className, children }: NoticeProps) {
  return (
    <div role={role} className={cn('flex items-start gap-2.5 rounded-lg p-3 text-body-sm', TONES[tone].box, className)}>
      {icon && <Icon name={icon} className={cn('mt-0.5 shrink-0 text-[20px]', TONES[tone].icon)} />}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
