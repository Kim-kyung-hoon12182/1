import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Icon from '@/components/Icon'
import RunChips from '@/components/RunChips'
import { describeLastRun } from '@/lib/format'
import { isHandoffReady } from '@/lib/streak'
import type { SampleKey, Task } from '@/types/task'

const TASK_ICONS: Record<SampleKey, string> = {
  report: 'trending_up',
  til: 'edit_note',
  summary: 'summarize',
  minutes: 'checklist',
}

const SHOWN_RULES = 3

type TaskCardProps = {
  task: Task
  onRun: (task: Task) => void
  /** "맡겨볼 만한 때예요"를 눌렀을 때 (S1-5) */
  onHandoff: (task: Task) => void
}

// 내 작업 한 줄 (S1-3): 이름, 규칙, 최근 기록, 상태, 실행하기
export default function TaskCard({ task, onRun, onHandoff }: TaskCardProps) {
  const ready = isHandoffReady(task.runs)
  const shownRules = task.rules.slice(0, SHOWN_RULES)
  const hiddenCount = task.rules.length - shownRules.length

  return (
    <Card
      as="article"
      padding="none"
      className="flex flex-col justify-between gap-4 p-5 transition-shadow hover:shadow-md lg:flex-row lg:items-center"
    >
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface-low text-primary">
          <Icon name={task.sampleKey ? TASK_ICONS[task.sampleKey] : 'description'} className="text-[24px]" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            {task.isDemo && (
              <Badge tone="primary" className="font-semibold">
                예시
              </Badge>
            )}
            <Badge>규칙 {task.rules.length}개</Badge>
            {ready && (
              <button
                type="button"
                title="다른 곳에 맡기는 방법 보기"
                onClick={() => onHandoff(task)}
                className="rounded transition-opacity hover:opacity-80"
              >
                <Badge tone="solid" icon="handshake" className="font-semibold">
                  맡겨볼 만한 때예요
                </Badge>
              </button>
            )}
            {task.handsOff && <Badge tone="muted">확인 생략 중</Badge>}
          </div>
          <h3 className="truncate text-headline-sm">{task.name}</h3>
          <p className="line-clamp-1 text-body-sm text-secondary">{task.answers.what}</p>
          {shownRules.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="shrink-0 text-label-sm text-outline">지키는 규칙:</span>
              {shownRules.map((rule) => (
                <Badge key={rule.id} className="bg-surface-low text-on-surface-variant">
                  {rule.text}
                </Badge>
              ))}
              {hiddenCount > 0 && <span className="text-label-sm text-outline">외 {hiddenCount}개</span>}
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
        <div className="flex flex-col gap-1 lg:items-end">
          <span className="text-label-sm text-secondary">{describeLastRun(task)}</span>
          {task.runs.length > 0 && <RunChips runs={task.runs} />}
        </div>
        <Button variant="primary" icon="play_arrow" className="text-headline-sm" onClick={() => onRun(task)}>
          실행하기
        </Button>
      </div>
    </Card>
  )
}
