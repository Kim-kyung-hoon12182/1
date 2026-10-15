import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'low' | 'lowest'

type RuleTextAreaProps = {
  value: string
  onChange: (text: string) => void
  /** Enter를 누르면 부른다(규칙은 한 문장이라 줄바꿈 대신 확정으로 쓴다) */
  onSubmit?: () => void
  /** Esc를 누르면 부른다(고치기 취소). 부르면 창 전체가 닫히지 않도록 이벤트를 멈춘다 */
  onEscape?: () => void
  maxLength: number
  placeholder?: string
  id?: string
  'aria-label'?: string
  autoFocus?: boolean
  tone?: Tone
  className?: string
}

const TONES: Record<Tone, string> = {
  low: 'bg-surface-low focus:bg-surface-lowest focus:ring-2 focus:ring-primary/30',
  lowest: 'bg-surface-lowest focus:ring-2 focus:ring-primary',
}

// 규칙 한 문장을 쓰는 칸. 길어지면 아래로 늘어나서 앞부분이 가려지지 않는다.
// 줄바꿈은 넣지 못한다(규칙 안의 줄바꿈은 AI 요청에서 규칙이 여러 개로 갈라져 보인다). 붙여 넣은 줄바꿈은 공백으로 바꾼다.
export default function RuleTextArea({ value, onChange, onSubmit, onEscape, maxLength, placeholder, id, autoFocus, tone = 'low', className, ...rest }: RuleTextAreaProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    element.style.height = 'auto'
    element.style.height = `${element.scrollHeight}px`
  }, [value])

  const showCount = maxLength > 0 && value.length >= Math.min(150, maxLength * 0.75)

  return (
    <div className="relative min-w-0 flex-1">
      <textarea
        ref={ref}
        id={id}
        rows={2}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label={rest['aria-label']}
        onChange={(event) => onChange(event.target.value.replace(/\s*\n+\s*/g, ' '))}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && onEscape) {
            event.preventDefault()
            event.stopPropagation()
            onEscape()
            return
          }
          if (event.key !== 'Enter') return
          event.preventDefault()
          if (!event.nativeEvent.isComposing && !event.shiftKey) onSubmit?.()
        }}
        className={cn('w-full resize-none overflow-hidden rounded p-3 text-body-md leading-relaxed outline-none placeholder:text-outline', TONES[tone], className)}
      />
      {showCount && <span className="pointer-events-none absolute bottom-1.5 right-3 text-label-sm text-on-surface-variant">{value.length} / {maxLength}</span>}
    </div>
  )
}
