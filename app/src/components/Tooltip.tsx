import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type TooltipProps = {
  content: ReactNode
  children: ReactNode
  className?: string
}

// 마우스를 올리면 뜨고, 터치에서는 누르면 열리고 닫히는 짧은 설명. 꼭 알아야 하는 내용은 여기에 두지 않는다.
// 포커스되는 요소가 아니라서 키보드 사용자는 같은 내용을 카드 안에서 본다(참고한 자료 등).
export default function Tooltip({ content, children, className }: TooltipProps) {
  const id = useId()
  const ref = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)

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

  return (
    <span
      ref={ref}
      className={cn('relative inline-flex shrink-0', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((value) => !value)}
      aria-describedby={open ? id : undefined}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          id={id}
          className="absolute right-0 top-full z-50 mt-1 w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-outline-variant bg-surface-lowest p-2.5 text-left text-label-md font-normal normal-case leading-snug text-on-surface shadow-lg"
        >
          {content}
        </span>
      )}
    </span>
  )
}
