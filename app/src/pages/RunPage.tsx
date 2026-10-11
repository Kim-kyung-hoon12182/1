import { useState } from 'react'
import EmptyState from '@/components/EmptyState'
import PageContainer from '@/components/PageContainer'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useRunSession } from '@/hooks/useRunSession'
import type { Run, Task } from '@/types/task'
import { READ_FIRST_NOTE } from './run/copy'
import CopyBar from './run/CopyBar'
import FinishedCard from './run/FinishedCard'
import IntroGuide from './run/IntroGuide'
import ResultCard from './run/ResultCard'
import ResultSummary from './run/ResultSummary'
import RunHeader from './run/RunHeader'
import SourcePanel from './run/SourcePanel'

type RunPageProps = {
  task: Task
  prefillMaterial: boolean
  onRecord: (run: Run) => void
  onGoToTasks: () => void
}

// S3 실행·결과: 왼쪽에 자료, 오른쪽에 줄마다 참고한 자료와 확인할 곳
export default function RunPage({ task, prefillMaterial, onRecord, onGoToTasks }: RunPageProps) {
  const session = useRunSession(task, prefillMaterial, onRecord)
  const hasResult = session.result !== null
  const [guideOpen, setGuideOpen] = useState(false)

  useDocumentTitle(task.name)

  return (
    <PageContainer>
      <RunHeader task={task} session={session} />
      <IntroGuide currentStep={hasResult ? 3 : 1} open={guideOpen} onToggle={() => setGuideOpen((open) => !open)} />

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <SourcePanel task={task} session={session} />

        <section className="space-y-4 lg:col-span-7">
          {hasResult ? (
            <>
              <ResultSummary session={session} />
              <ul className="space-y-4">
                {session.lines.map((_, index) => (
                  <ResultCard key={index} index={index} task={task} session={session} />
                ))}
              </ul>
              {session.finished ? (
                <FinishedCard task={task} run={session.finished} session={session} onGoToTasks={onGoToTasks} />
              ) : (
                <CopyBar session={session} />
              )}
            </>
          ) : (
            <EmptyState icon="article" title="아직 결과가 없어요" className="min-h-72 bg-surface-lowest">
              자료를 넣고 [실행하기]를 누르면 결과가 줄마다 나오고, 확인할 곳이 표시돼요. 처음이면 [예시 자료 넣기]로 먼저 해 보세요.
              <p className="mt-3 text-body-sm text-on-surface-variant">{READ_FIRST_NOTE}</p>
            </EmptyState>
          )}
        </section>
      </div>
    </PageContainer>
  )
}
