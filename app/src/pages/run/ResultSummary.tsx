import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Card from '@/components/Card'
import type { RunSession } from '@/hooks/useRunSession'
import { countByStatus, countDeleted } from '@/lib/run'
import type { Task } from '@/types/task'
import StatusBar from './StatusBar'

// 결과 위쪽: 줄 상태 집계, 확인할 곳으로 이동, 그 아래 한 줄 상태 바(설명은 눌러서 여는 팝오버)
export default function ResultSummary({ session, task, onGoToTasks }: { session: RunSession; task: Task; onGoToTasks: () => void }) {
  const { lines, flagged, flaggedPosition } = session

  return (
    <>
      <Card elevation="md" padding="sm" className="space-y-2 lg:sticky lg:top-20 lg:z-20">
        <div className="flex flex-col justify-between gap-2 border-b border-outline-variant pb-2 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <Badge tone="solid" className="font-semibold">
              2·3단계
            </Badge>
            <h2 className="text-headline-sm">결과와 참고한 자료</h2>
          </div>
          {flagged.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="mr-1 text-label-md text-on-surface-variant">
                {flaggedPosition > 0 ? `확인할 곳 ${flaggedPosition} / ${flagged.length}` : `확인할 곳 ${flagged.length}개`}
              </span>
              <Button size="sm" data-tour="goto-first" onClick={() => session.goToFlagged('first')}>
                첫 번째로 이동
              </Button>
              <Button size="sm" onClick={() => session.goToFlagged('next')}>
                다음 확인할 곳
              </Button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge size="md">전체 {lines.length}줄</Badge>
          <Badge size="md" tone="muted" icon="link">
            참고한 곳 {countByStatus(lines, 'has_source')}줄
          </Badge>
          {countByStatus(lines, 'heading') > 0 && (
            <Badge size="md" icon="title">
              제목 {countByStatus(lines, 'heading')}줄
            </Badge>
          )}
          <Badge size="md" tone="flagSoft" icon="warning">
            근거 확인 필요 {countByStatus(lines, 'needs_check')}줄
          </Badge>
          <Badge size="md" tone="flag" icon="error">
            자료에 없음 {countByStatus(lines, 'not_in_input')}줄
          </Badge>
          {countDeleted(lines) > 0 && (
            <Badge size="md" icon="delete">
              삭제 {countDeleted(lines)}줄
            </Badge>
          )}
        </div>
      </Card>

      <StatusBar task={task} session={session} onGoToTasks={onGoToTasks} />
    </>
  )
}
