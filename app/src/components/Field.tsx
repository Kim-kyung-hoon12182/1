import { useEffect, useRef, type ComponentPropsWithRef, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type FieldProps = {
  id: string
  label: ReactNode
  required?: boolean
  /** 선택 입력이면 "선택 사항" 같은 짧은 표시 */
  tag?: string
  hint?: ReactNode
  /** 오른쪽 끝 글자 수 등 */
  counter?: ReactNode
  children: ReactNode
}

// 질문 하나: 제목, 꼭 입력 표시, 글자 수, 안내 문구, 입력칸을 한 묶음으로 보여 준다.
export function Field({ id, label, required = false, tag, hint, counter, children }: FieldProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="flex items-center gap-1 text-headline-sm">
          {label}
          {required && (
            <span className="font-bold text-flag-icon" title="꼭 입력해 주세요">
              *
            </span>
          )}
        </label>
        {tag && <span className="rounded bg-surface-high px-1.5 py-0.5 text-label-sm text-on-surface-variant">{tag}</span>}
        {counter && <span className="text-label-sm text-on-surface-variant">{counter}</span>}
      </div>
      {hint && <p className="text-body-sm text-on-surface-variant">{hint}</p>}
      {children}
    </div>
  )
}

type Tone = 'low' | 'lowest' | 'paper'

const BASE = 'w-full rounded text-body-md outline-none placeholder:text-outline'

const TONES: Record<Tone, string> = {
  low: 'bg-surface-low focus:bg-surface-lowest focus:ring-2 focus:ring-primary/30',
  lowest: 'bg-surface-lowest focus:ring-2 focus:ring-primary',
  paper: 'rounded-lg bg-background ring-1 ring-outline-variant focus:ring-2 focus:ring-primary/40',
}

type TextInputProps = ComponentPropsWithRef<'input'> & { tone?: Tone }

export function TextInput({ tone = 'low', className, ...rest }: TextInputProps) {
  return <input className={cn(BASE, 'h-11 px-3', TONES[tone], className)} {...rest} />
}

type TextAreaProps = ComponentPropsWithRef<'textarea'> & {
  tone?: Tone
  /** 글이 길어지면 칸이 아래로 늘어난다(처음 높이는 rows). 길게 쓰는 칸에서 앞부분이 안 보이는 것을 막는다 */
  autoGrow?: boolean
}

export function TextArea({ tone = 'low', className, autoGrow = false, ref, onInput, ...rest }: TextAreaProps) {
  const inner = useRef<HTMLTextAreaElement | null>(null)
  const fit = () => {
    const element = inner.current
    if (!autoGrow || !element) return
    element.style.height = 'auto'
    element.style.height = `${element.scrollHeight}px`
  }
  // 값이 바깥에서 바뀌어도(value) 다시 맞춘다. 직접 입력(defaultValue)은 onInput이 맞춘다
  useEffect(fit, [rest.value, autoGrow])
  return (
    <textarea
      ref={(element) => {
        inner.current = element
        if (typeof ref === 'function') ref(element)
        else if (ref) ref.current = element
        if (element) fit()
      }}
      className={cn(BASE, autoGrow ? 'resize-none overflow-hidden' : 'resize-y', 'p-3 leading-relaxed', TONES[tone], className)}
      onInput={(event) => {
        fit()
        onInput?.(event)
      }}
      {...rest}
    />
  )
}
