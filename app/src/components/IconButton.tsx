import type { ButtonHTMLAttributes } from 'react'
import Icon from '@/components/Icon'
import { cn } from '@/lib/cn'

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'title'> & {
  icon: string
  label: string
  danger?: boolean
}

// 글자 없이 아이콘만 있는 버튼. 화면 읽기 프로그램을 위해 label이 꼭 필요하다.
export default function IconButton({ icon, label, danger = false, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      title={label}
      aria-label={label}
      className={cn(
        'rounded-lg p-1.5 text-secondary transition-colors hover:bg-surface-low',
        danger ? 'hover:text-flag-icon' : 'hover:text-primary',
        className,
      )}
      {...rest}
    >
      <Icon name={icon} className="text-[18px]" />
    </button>
  )
}
