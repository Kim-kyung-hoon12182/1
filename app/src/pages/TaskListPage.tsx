import Badge from '@/components/Badge'
import Button from '@/components/Button'
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
  useDocumentTitle('내 작업')
  const newestFirst = [...tasks].reverse()

  return (
    <PageContainer>
      <PageHeader
        eyebrow={
          <Badge icon="folder_special" className="text-primary">
            반복 작업 관리
          </Badge>
        }
        title="내 작업"
        description="자주 하는 문서 작업을 한 번 등록해 두면, 다음부터는 재료만 넣어 실행할 수 있어요. 고친 내용이 쌓이면 맡겨볼 만한 때를 알려드려요."
        actions={
          <>
            <Button icon="science" className="bg-surface-lowest shadow-sm hover:bg-surface" onClick={() => onRun(demo)}>
              예시로 체험해보기
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
            <TaskCard key={task.id} task={task} onRun={onRun} />
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
        <TaskCard task={demo} onRun={onRun} />
      </section>
    </PageContainer>
  )
}
