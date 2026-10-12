import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type PopoverProps = {
  /** 열고 닫는 버튼의 모양 */
  trigger: (props: { open: boolean; toggle: () => void; id: string }) => ReactNode
  label: string
  children: ReactNode
  className?: string
}

// 칩을 눌러 여는 작은 창. 바깥을 누르거나 Esc를 누르면 닫힌다. 화면 오른쪽 가까이에서 열면 오른쪽에 붙여서 열린다.
export default function Popover({ trigger, label, children, className }: PopoverProps) {
  const id = useId()
  const ref = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)
  const [alignRight, setAlignRight] = useState(false)

  useEffect(() => {
    if (!open) return
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !ref.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  const toggle = () => {
    const box = ref.current?.getBoundingClientRect()
    setAlignRight(box !== undefined && box.left + 352 > document.documentElement.clientWidth)
    setOpen((value) => !value)
  }

  return (
    <span ref={ref} className={cn('relative inline-flex', className)}>
      {trigger({ open, toggle, id })}
      {open && (
        <div
          id={id}
          role="dialog"
          aria-label={label}
          className={cn(
            'absolute top-full z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] rounded-xl border border-outline-variant bg-surface-lowest p-3 text-body-sm shadow-lg',
            alignRight ? 'right-0' : 'left-0',
          )}
        >
          {children}
        </div>
      )}
    </span>
  )
}
