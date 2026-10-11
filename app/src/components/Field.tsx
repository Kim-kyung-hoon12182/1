import type { ComponentPropsWithRef, ReactNode } from 'react'
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

type TextAreaProps = ComponentPropsWithRef<'textarea'> & { tone?: Tone }

export function TextArea({ tone = 'low', className, ...rest }: TextAreaProps) {
  return <textarea className={cn(BASE, 'resize-y p-3 leading-relaxed', TONES[tone], className)} {...rest} />
}
