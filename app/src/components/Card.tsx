import { createElement, type HTMLAttributes, type Ref } from 'react'
import { cn } from '@/lib/cn'

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'section' | 'article' | 'aside' | 'li'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  elevation?: 'none' | 'sm' | 'md'
  bordered?: boolean
  ref?: Ref<HTMLElement>
}

const PADDING = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' }
const ELEVATION = { none: '', sm: 'shadow-sm', md: 'shadow-md' }

// 흰 바탕의 둥근 상자. 화면 어디서나 같은 모양으로 쓴다.
export default function Card({
  as = 'div',
  padding = 'md',
  elevation = 'sm',
  bordered = false,
  className,
  ...rest
}: CardProps) {
  return createElement(as, {
    className: cn(
      'rounded-xl bg-surface-lowest',
      PADDING[padding],
      ELEVATION[elevation],
      bordered && 'border border-outline-variant',
      className,
    ),
    ...rest,
  })
}
