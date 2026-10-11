import type { ReactNode } from 'react'
import Badge from '@/components/Badge'
import Icon from '@/components/Icon'

type PanelHeaderProps = {
  icon: string
  title: string
  /** 제목 앞에 붙는 단계 표시 (예: "1단계") */
  step?: string
  description?: string
  /** 오른쪽 끝 (글자 수 등) */
  aside?: ReactNode
}

export default function PanelHeader({ icon, title, step, description, aside }: PanelHeaderProps) {
  return (
    <div className="mb-3 flex items-start justify-between gap-2">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          {step && (
            <Badge tone="primary" className="font-semibold">
              {step}
            </Badge>
          )}
          <Icon name={icon} className="text-[20px] text-primary" />
          <h2 className="text-headline-sm">{title}</h2>
        </div>
        {description && <p className="text-label-sm text-on-surface-variant">{description}</p>}
      </div>
      {aside}
    </div>
  )
}
