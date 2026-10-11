import Badge from '@/components/Badge'
import type { Run } from '@/types/task'

type RunChipsProps = {
  runs: Pick<Run, 'edited' | 'passState' | 'copied'>[]
  /** 최근 몇 개까지 보여 줄지. 기본 5개 */
  limit?: number
}

// 최근 5회 기록. "안 고침"은 검토를 마쳤다는 뜻이 아니라 결과를 바꾸지 않았다는 뜻이다.
export default function RunChips({ runs, limit = 5 }: RunChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {runs.slice(-limit).map((run, index) => (
        <Badge key={index} tone={run.edited ? 'flag' : 'muted'}>
          {run.edited ? '고침' : '안 고침'}
          {run.passState === 'quick_pass' ? ' · 빠르게 넘김' : ''}
          {run.copied ? '' : ' · 복사 안 됨'}
        </Badge>
      ))}
    </div>
  )
}
