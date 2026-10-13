import { useEffect, useState } from 'react'
import EmptyState from '@/components/EmptyState'
import PageContainer from '@/components/PageContainer'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { SHOW_SOURCE_EVENT, useRunSession } from '@/hooks/useRunSession'
import type { Rule, Run, Task } from '@/types/task'
import { READ_FIRST_NOTE } from './run/copy'
import EditedAfterAsk from './run/EditedAfterAsk'
import LeaveWithEditsDialog from './run/LeaveWithEditsDialog'
import CopyBar from './run/CopyBar'
import FinishedCard from './run/FinishedCard'
import IntroGuide from './run/IntroGuide'
import ResultCard from './run/ResultCard'
import ResultSkeleton from './run/ResultSkeleton'
import ResultSummary from './run/ResultSummary'
import RunHeader from './run/RunHeader'
import SourcePanel from './run/SourcePanel'

type RunPageProps = {
  task: Task
  prefillMaterial: boolean
  onRecord: (run: Run) => void
  onAddRule: (rule: Rule) => void
  /** 지난 기록의 "복사한 뒤 더 고쳤나요" 답 */
  onAnswerEditedAfter: (runId: string, answer: 'yes' | 'no') => void
  /** 복사하지 않은 결과가 있는지(나갈 때 묻기 위해) */
  onUnfinishedChange: (unfinished: boolean) => void
  onGoToTasks: () => void
}

// S3 실행·결과: 왼쪽에 자료, 오른쪽에 줄마다 참고한 자료와 확인할 곳
export default function RunPage({ task, prefillMaterial, onRecord, onAddRule, onAnswerEditedAfter, onUnfinishedChange, onGoToTasks }: RunPageProps) {
  const session = useRunSession(task, prefillMaterial, onRecord)
  const hasResult = session.result !== null
  const [guideOpen, setGuideOpen] = useState(false)
  // 좁은 화면에서 결과가 나온 뒤의 자료 시트
  const [sourceSheetOpen, setSourceSheetOpen] = useState(false)
  // 고친 곳이 있는 결과를 복사하지 않고 떠나려 할 때의 확인 창
  const [leaveOpen, setLeaveOpen] = useState(false)
  const unfinished = session.result !== null && session.finished === null

  useEffect(() => {
    // 안내 중에는 시트를 열지 않는다. 시트가 아래 절반을 덮어서 안내가 가리키는 [고치기]가 가려지고 다음으로 못 넘어간다.
    const open = () => {
      if (!document.querySelector('[data-tour-ui]')) setSourceSheetOpen(true)
    }
    window.addEventListener(SHOW_SOURCE_EVENT, open)
    return () => window.removeEventListener(SHOW_SOURCE_EVENT, open)
  }, [])

  // 결과가 없어지면(자료 다시 입력) 시트도 닫는다
  useEffect(() => {
    if (!hasResult) setSourceSheetOpen(false)
  }, [hasResult])

  useEffect(() => {
    onUnfinishedChange(unfinished)
    return () => onUnfinishedChange(false)
  }, [unfinished])

  useDocumentTitle(task.name)

  // 새 실행을 시작하기 전에만, 체험용이 아닌 작업의 지난 기록에 대해 한 번 묻는다
  const lastRun = task.runs.at(-1)
  const askAfterEdit = !hasResult && !session.running && !task.isDemo && lastRun !== undefined && lastRun.copied && !lastRun.isSample && lastRun.editedAfter === undefined

  return (
    <PageContainer>
      <RunHeader
        task={task}
        session={session}
        onBack={() => (session.hasEdits && !session.finished ? setLeaveOpen(true) : session.backToInput())}
      />
      <IntroGuide currentStep={hasResult ? 3 : 1} open={guideOpen} onToggle={() => setGuideOpen((open) => !open)} />
      {askAfterEdit && lastRun && <EditedAfterAsk key={lastRun.id} run={lastRun} onAnswer={(answer) => onAnswerEditedAfter(lastRun.id, answer)} />}

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <SourcePanel task={task} session={session} sheet={hasResult ? (sourceSheetOpen ? 'open' : 'hidden') : undefined} onCloseSheet={() => setSourceSheetOpen(false)} />

        <section className="space-y-4 lg:col-span-7">
          {hasResult ? (
            <>
              <ResultSummary session={session} task={task} onGoToTasks={onGoToTasks} />
              <ul data-tour="result-list" className="space-y-4">
                {session.lines.map((_, index) => (
                  <ResultCard key={index} index={index} task={task} session={session} />
                ))}
              </ul>
              {session.finished ? (
                <FinishedCard
                  task={task}
                  run={session.finished}
                  session={session}
                  onGoToTasks={onGoToTasks}
                  onAddRule={onAddRule}
                />
              ) : (
                <CopyBar session={session} />
              )}
            </>
          ) : session.running ? (
            <ResultSkeleton />
          ) : (
            <EmptyState icon="article" title="아직 결과가 없어요" className="min-h-72 bg-surface-lowest">
              자료를 넣고 [실행하기]를 누르면 결과가 줄마다 나오고, 확인할 곳이 표시돼요. 처음이면 [예시 자료 넣기]로 먼저 해 보세요.
              <p className="mt-3 text-body-sm text-on-surface-variant">{READ_FIRST_NOTE}</p>
            </EmptyState>
          )}
        </section>
      </div>
      {leaveOpen && (
        <LeaveWithEditsDialog
          task={task}
          session={session}
          onAddRule={onAddRule}
          onCancel={() => setLeaveOpen(false)}
          onLeave={() => {
            setLeaveOpen(false)
            session.backToInputKeepingEdits()
          }}
        />
      )}
    </PageContainer>
  )
}
