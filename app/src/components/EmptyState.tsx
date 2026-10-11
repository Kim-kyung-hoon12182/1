import type { ReactNode } from 'react'
import Card from '@/components/Card'
import Icon from '@/components/Icon'
import { cn } from '@/lib/cn'

type EmptyStateProps = {
  icon: string
  title: string
  children: ReactNode
  actions?: ReactNode
  className?: string
}

export default function EmptyState({ icon, title, children, actions, className }: EmptyStateProps) {
  return (
    <Card
      padding="lg"
      elevation="none"
      className={cn('flex flex-col items-center justify-center gap-2 border border-dashed border-outline-variant p-8 text-center', className)}
    >
      <Icon name={icon} className="text-[40px] text-outline" />
      <p className="text-headline-sm">{title}</p>
      <div className="max-w-md text-body-sm text-on-surface-variant">{children}</div>
      {actions && <div className="mt-2 flex flex-wrap items-center justify-center gap-2">{actions}</div>}
    </Card>
  )
}
