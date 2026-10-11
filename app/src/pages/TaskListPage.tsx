import { useState } from 'react'
import Button from '@/components/Button'
import Dialog from '@/components/Dialog'
import HandoffPanel from '@/components/HandoffPanel'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { SampleKey, Task } from '@/types/task'
import EmptyTasks from './list/EmptyTasks'
import Overview from './list/Overview'
import TaskCard from './list/TaskCard'

type TaskListPageProps = {
  tasks: Task[]
  demo: Task
  onCreate: (sampleKey?: SampleKey) => void
  onRun: (task: Task) => void
  onResetDemo: () => void
}

// S1 내 작업: 등록한 작업과 예시 작업을 보여 주고 실행으로 이어 준다
export default function TaskListPage({ tasks, demo, onCreate, onRun, onResetDemo }: TaskListPageProps) {
  const [handoffTask, setHandoffTask] = useState<Task | null>(null)
  useDocumentTitle('내 작업')
  const newestFirst = [...tasks].reverse()

  return (
    <PageContainer>
      <PageHeader
        title="내 작업"
        description="자주 쓰는 문서를 한 번 등록해 두면, 다음부터는 재료만 붙여 넣고 실행해요. 안 고치고 쓴 기록이 쌓이면 맡겨볼 만한 때를 알려 줘요."
        actions={
          <>
            <Button icon="science" className="bg-surface-lowest shadow-sm hover:bg-surface" onClick={() => onRun(demo)}>
              예시로 체험해 보기
            </Button>
            <Button variant="primary" icon="add" className="bg-primary-container text-headline-sm hover:bg-primary" onClick={() => onCreate()}>
              새 작업 등록
            </Button>
          </>
        }
      />

      <Overview tasks={tasks} />

      {newestFirst.length === 0 ? (
        <EmptyTasks onTryDemo={() => onRun(demo)} onCreate={onCreate} />
      ) : (
        <section aria-label="등록한 작업" className="flex flex-col gap-3">
          {newestFirst.map((task) => (
            <TaskCard key={task.id} task={task} onRun={onRun} onHandoff={setHandoffTask} />
          ))}
        </section>
      )}

      <section aria-label="예시" className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-headline-sm">예시</h2>
          <Button size="sm" variant="ghost" icon="restart_alt" onClick={onResetDemo}>
            체험 초기화
          </Button>
        </div>
        <TaskCard task={demo} onRun={onRun} onHandoff={setHandoffTask} />
      </section>

      {handoffTask && (
        <Dialog title="맡겨볼 만한 때" onClose={() => setHandoffTask(null)}>
          <HandoffPanel task={handoffTask} defaultOpen onClose={() => setHandoffTask(null)} />
        </Dialog>
      )}
    </PageContainer>
  )
}
