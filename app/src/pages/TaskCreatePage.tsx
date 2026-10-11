import PageContainer from '@/components/PageContainer'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { useTaskDraft } from '@/hooks/useTaskDraft'
import type { SampleKey, Task } from '@/types/task'
import CreateHeader from './create/CreateHeader'
import QuestionsStep from './create/QuestionsStep'
import RulesStep from './create/RulesStep'

type TaskCreatePageProps = {
  initialSampleKey?: SampleKey
  onCancel: () => void
  onSaved: (task: Task) => void
}

// S2 새 작업 등록: 1단계 질문 답하기 → 2단계 규칙 확인·저장
export default function TaskCreatePage({ initialSampleKey, onCancel, onSaved }: TaskCreatePageProps) {
  const draft = useTaskDraft(initialSampleKey, onSaved)
  const inRules = draft.phase === 'rules'

  useDocumentTitle(inRules ? '규칙 확인·수정' : '새 작업 등록')
  useScrollToTop(draft.phase)

  return (
    <PageContainer>
      <CreateHeader phase={draft.phase} onBack={inRules ? () => draft.setPhase('questions') : onCancel} />
      {inRules ? <RulesStep draft={draft} /> : <QuestionsStep draft={draft} onCancel={onCancel} />}
    </PageContainer>
  )
}
