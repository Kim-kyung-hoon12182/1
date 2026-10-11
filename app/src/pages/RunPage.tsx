import { useState } from 'react'
import EmptyState from '@/components/EmptyState'
import PageContainer from '@/components/PageContainer'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useRunSession } from '@/hooks/useRunSession'
import type { Task } from '@/types/task'
import { READ_FIRST_NOTE } from './run/copy'
import CopyBar from './run/CopyBar'
import IntroGuide from './run/IntroGuide'
import ResultCard from './run/ResultCard'
import ResultSummary from './run/ResultSummary'
import RunHeader from './run/RunHeader'
import SourcePanel from './run/SourcePanel'

type RunPageProps = {
  task: Task
  prefillMaterial: boolean
}

// S3 실행·결과: 왼쪽에 재료, 오른쪽에 줄마다 짚은 재료와 확인할 곳
export default function RunPage({ task, prefillMaterial }: RunPageProps) {
  const session = useRunSession(task, prefillMaterial)
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
              <CopyBar session={session} />
            </>
          ) : (
            <EmptyState icon="article" title="아직 결과가 없어요" className="min-h-72 bg-surface-lowest">
              재료를 넣고 [실행하기]를 누르면 줄마다 짚은 재료와 확인할 곳이 여기에 나와요. 처음이라면 [예시 재료 불러오기]로 먼저 체험해 보세요.
              <p className="mt-3 text-label-sm text-outline">{READ_FIRST_NOTE}</p>
            </EmptyState>
          )}
        </section>
      </div>
    </PageContainer>
  )
}
