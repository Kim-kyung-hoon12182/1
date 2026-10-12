import Badge from '@/components/Badge'
import Button from '@/components/Button'
import PageHeader from '@/components/PageHeader'
import RunChips from '@/components/RunChips'
import type { RunSession } from '@/hooks/useRunSession'
import type { Task } from '@/types/task'

type RunHeaderProps = {
  task: Task
  session: RunSession
  /** [자료 다시 입력]을 눌렀을 때(고친 곳이 있으면 먼저 묻는다) */
  onBack: () => void
}

// 화면 맨 위. 실행 영역이 첫 화면 안에 들어오도록 낮게 유지한다.
export default function RunHeader({ task, session, onBack }: RunHeaderProps) {
  const hasResult = session.result !== null
  const flaggedCount = session.flagged.length

  return (
    <PageHeader
      card
      cardPadding="md"
      className="mb-4"
      title={task.name}
      description="결과에서 확인할 곳을 표시해 줘요."
      eyebrow={
        <div className="flex flex-wrap items-center gap-2">
          <Badge pill icon="folder_open" className="bg-surface-high text-on-surface-variant">
            {task.isDemo ? '예시 작업' : '내 작업'} · {session.finished?.number ?? task.runs.length + 1}회차
          </Badge>
          {hasResult && (
            <Badge pill tone={flaggedCount > 0 ? 'flag' : 'muted'} className="gap-1.5 font-semibold">
              {flaggedCount > 0 && <span className="h-2 w-2 rounded-full bg-flag-bar" />}
              확인할 곳 {flaggedCount}개
            </Badge>
          )}
          {hasResult && (
            <Badge pill tone="primary">
              {session.isSampleResult ? '예시 결과예요' : 'AI가 쓴 결과예요'}
            </Badge>
          )}
        </div>
      }
      extra={
        task.runs.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-label-sm text-on-surface-variant">
              {task.isDemo ? '예시 기록' : '최근 기록'}
            </span>
            <RunChips runs={task.runs} />
          </div>
        )
      }
      actions={
        hasResult && (
          <Button icon="restart_alt" onClick={onBack}>
            자료 다시 입력
          </Button>
        )
      }
    />
  )
}
