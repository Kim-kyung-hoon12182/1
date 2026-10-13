import { cn } from '@/lib/cn'

type SpinnerProps = { className?: string }

// 시간이 걸리는 일을 기다리는 동안 돌아가는 표시. 뜻은 곁의 글이 말하므로 화면 읽기 프로그램에는 숨긴다.
export default function Spinner({ className }: SpinnerProps) {
  return <span aria-hidden className={cn('inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent motion-reduce:animate-pulse', className)} />
}
