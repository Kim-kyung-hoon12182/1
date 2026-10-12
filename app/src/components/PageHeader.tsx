import type { ReactNode } from 'react'
import Card from '@/components/Card'
import { cn } from '@/lib/cn'

type PageHeaderProps = {
  eyebrow?: ReactNode
  title: string
  description?: ReactNode
  /** 설명 아래에 붙는 부가 정보(최근 기록 등) */
  extra?: ReactNode
  /** 오른쪽 끝에 놓는 버튼이나 단계 표시 */
  actions?: ReactNode
  /** 흰 상자로 감쌀지 여부 */
  card?: boolean
  /** 상자 안쪽 여백. 화면 위쪽을 줄여야 할 때 md */
  cardPadding?: 'md' | 'lg'
  /** 상자 안쪽 아래에 놓는 안내 */
  children?: ReactNode
  className?: string
}

export default function PageHeader({
  eyebrow,
  title,
  description,
  extra,
  actions,
  card = false,
  cardPadding = 'lg',
  children,
  className,
}: PageHeaderProps) {
  const body = (
    <>
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="min-w-0 max-w-3xl space-y-1">
          {eyebrow}
          <h1 className="text-headline-lg tracking-tight">{title}</h1>
          {description && <p className="text-body-md leading-relaxed text-on-surface-variant">{description}</p>}
          {extra}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2 self-start lg:self-center">{actions}</div>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </>
  )

  return card ? (
    <Card as="section" padding={cardPadding} className={cn('mb-6', className)}>
      {body}
    </Card>
  ) : (
    <section className={cn('pb-6', className)}>{body}</section>
  )
}
