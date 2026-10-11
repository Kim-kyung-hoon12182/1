import { useState } from 'react'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Card from '@/components/Card'
import { TextArea } from '@/components/Field'
import HandoffPanel from '@/components/HandoffPanel'
import Icon from '@/components/Icon'
import Notice from '@/components/Notice'
import RunChips from '@/components/RunChips'
import type { RunSession } from '@/hooks/useRunSession'
import { countStreak, HANDOFF_STREAK, isHandoffReady } from '@/lib/streak'
import type { Run, Task } from '@/types/task'

type FinishedCardProps = {
  task: Task
  run: Run
  session: RunSession
  onGoToTasks: () => void
}

// 이번 기록이 연속 안 고침에 들어갔는지, 왜 끊겼는지를 쉬운 말로 알려 준다.
// "안 고침"은 결과가 정확하다는 뜻이 아니다.
const describeStreak = (run: Run, streak: number) => {
  if (!run.copied) return '복사가 안 돼서 이번 기록은 연속 안 고침에 넣지 않아요.'
  if (run.edited) return '고친 내용이 있어서 연속 안 고침은 처음부터 다시 세요.'
  if (run.passState === 'quick_pass') return '확인할 곳을 보기 전에 빠르게 넘겨서 연속 안 고침에 넣지 않아요.'
  if (streak >= HANDOFF_STREAK) return `안 고친 기록이 연속 ${streak}번이에요.`
  return `안 고친 기록이 연속 ${streak}번이에요. ${HANDOFF_STREAK - streak}번 더 이어지면 맡겨볼 만한 때를 알려 줘요.`
}

// [복사하고 끝내기] 뒤에 보이는 카드. 기록한 결과와 다음 행동을 알려 준다 (S3-8, F-06).
export default function FinishedCard({ task, run, session, onGoToTasks }: FinishedCardProps) {
  const [handoffClosed, setHandoffClosed] = useState(false)
  const streak = countStreak(task.runs)
  const ready = isHandoffReady(task.runs)

  return (
    <>
      <Card as="section" className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary">
            <Icon name="task_alt" className="text-[22px]" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <h3 className="text-headline-sm">기록했어요 · {run.number}회차</h3>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge size="md" tone={run.edited ? 'flag' : 'muted'}>
                {run.edited ? '고침' : '안 고침'}
              </Badge>
              {run.passState === 'quick_pass' && <Badge size="md">빠르게 넘김</Badge>}
              {!run.copied && (
                <Badge size="md" tone="flagSoft" icon="warning">
                  복사 안 됨
                </Badge>
              )}
              <Badge size="md">확인할 곳 {run.flaggedCount}개</Badge>
              <span className="ml-1 text-label-sm text-on-surface-variant">최근 기록</span>
              <RunChips runs={task.runs} />
            </div>
            <p className="text-body-sm text-on-surface-variant">{describeStreak(run, streak)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button variant="primary" icon="replay" onClick={session.backToInput}>
            한 번 더 실행하기
          </Button>
          <Button icon="arrow_back" onClick={onGoToTasks}>
            내 작업으로
          </Button>
          <Button variant="ghost" icon="content_copy" onClick={session.copyText}>
            다시 복사
          </Button>
        </div>
        <p className="text-label-sm text-outline">기록한 뒤에는 이 결과를 고칠 수 없어요. 다시 실행하면 새 기록이 돼요.</p>
      </Card>

      {ready && !handoffClosed && (
        <Card as="section" bordered className="bg-gradient-to-r from-surface-low via-surface-lowest to-surface-low">
          <HandoffPanel task={task} onClose={() => setHandoffClosed(true)} />
        </Card>
      )}

      {session.copyState === 'done' && (
        <p role="status" className="text-body-sm font-semibold text-primary">
          복사했어요
        </p>
      )}
      {session.copyState === 'failed' && (
        <Card role="status">
          <Notice tone="flag" icon="warning">
            복사하지 못했어요. 기록은 남겼으니, 아래 글을 직접 복사해 주세요.
          </Notice>
          <TextArea
            ref={session.fallbackRef}
            tone="paper"
            readOnly
            value={session.finalText}
            aria-label="복사할 결과"
            className="mt-2 h-32 p-2 text-body-sm"
          />
        </Card>
      )}
    </>
  )
}
