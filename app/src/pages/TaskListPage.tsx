import { useState } from 'react'
import Button from '@/components/Button'
import Dialog from '@/components/Dialog'
import HandoffPanel from '@/components/HandoffPanel'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import RulesDialog from './list/RulesDialog'
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
  onAddRule: (taskId: string, text: string) => void
  onUpdateRule: (taskId: string, ruleId: string, text: string) => void
  onSetRuleFreeform: (taskId: string, ruleId: string, freeform: boolean) => void
  onRemoveRule: (taskId: string, ruleId: string) => void
  onRemoveTask: (taskId: string) => void
  onHistory: (task: Task) => void
}

// S1 내 작업: 등록한 작업과 예시 작업을 보여 주고 실행으로 이어 준다
export default function TaskListPage({
  tasks,
  demo,
  onCreate,
  onRun,
  onResetDemo,
  onAddRule,
  onUpdateRule,
  onSetRuleFreeform,
  onRemoveRule,
  onRemoveTask,
  onHistory,
}: TaskListPageProps) {
  const [handoffTask, setHandoffTask] = useState<Task | null>(null)
  const [rulesTaskId, setRulesTaskId] = useState<string | null>(null)
  // 규칙을 고칠 때마다 목록이 바로 바뀌도록 id로 최신 작업을 찾는다
  const rulesTask = [...tasks, demo].find((task) => task.id === rulesTaskId)
  useDocumentTitle('내 작업')
  const newestFirst = [...tasks].reverse()

  return (
    <PageContainer>
      <PageHeader
        title="내 작업"
        description="자주 쓰는 문서를 한 번 등록해 두면, 다음부터는 자료만 붙여 넣고 실행해요. AI가 쓴 글을 고치면 규칙으로 남겨 다음엔 덜 고치게 해요."
        actions={
          <>
            <Button
              data-tour="try-demo"
              icon="science"
              className="bg-surface-lowest shadow-sm hover:bg-surface"
              onClick={() => onRun(demo)}
            >
              예시로 체험해 보기
            </Button>
            <Button variant="primary" icon="add" className="bg-primary-container text-headline-sm hover:bg-primary" onClick={() => onCreate()}>
              새 작업 등록
            </Button>
          </>
        }
      />

      {newestFirst.length > 0 && <Overview tasks={tasks} />}

      {newestFirst.length === 0 ? (
        <EmptyTasks onTryDemo={() => onRun(demo)} onCreate={onCreate} />
      ) : (
        <section aria-label="등록한 작업" className="flex flex-col gap-3">
          {newestFirst.map((task) => (
            <TaskCard key={task.id} task={task} onRun={onRun} onHandoff={setHandoffTask} onRules={(t) => setRulesTaskId(t.id)} onHistory={onHistory} />
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
        <TaskCard task={demo} onRun={onRun} onHandoff={setHandoffTask} onRules={(t) => setRulesTaskId(t.id)} onHistory={onHistory} />
      </section>

      {rulesTask && (
        <RulesDialog
          task={rulesTask}
          onClose={() => setRulesTaskId(null)}
          onAdd={(text) => onAddRule(rulesTask.id, text)}
          onUpdate={(ruleId, text) => onUpdateRule(rulesTask.id, ruleId, text)}
          onSetFreeform={(ruleId, freeform) => onSetRuleFreeform(rulesTask.id, ruleId, freeform)}
          onRemove={(ruleId) => onRemoveRule(rulesTask.id, ruleId)}
          onRemoveTask={
            rulesTask.isDemo
              ? undefined
              : () => {
                  onRemoveTask(rulesTask.id)
                  setRulesTaskId(null)
                }
          }
        />
      )}

      {handoffTask && (
        <Dialog title="맡겨볼 만한 때" onClose={() => setHandoffTask(null)}>
          <HandoffPanel task={handoffTask} defaultOpen onClose={() => setHandoffTask(null)} />
        </Dialog>
      )}
    </PageContainer>
  )
}
