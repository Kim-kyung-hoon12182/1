import { useState } from 'react'
import AppFooter from '@/components/AppFooter'
import AppHeader, { type Screen } from '@/components/AppHeader'
import Notice from '@/components/Notice'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { useTasks } from '@/hooks/useTasks'
import { STORAGE_FULL_MESSAGE } from '@/lib/storage'
import RunPage from '@/pages/RunPage'
import TaskCreatePage from '@/pages/TaskCreatePage'
import TaskListPage from '@/pages/TaskListPage'
import type { SampleKey, Task } from '@/types/task'

type View =
  | { screen: 'tasks' }
  | { screen: 'create'; sampleKey?: SampleKey }
  | { screen: 'run'; taskId: string; prefill: boolean }

export default function App() {
  const { tasks, demo, saveFailed, addTask, resetDemo, findTask } = useTasks()
  const [view, setView] = useState<View>({ screen: 'tasks' })
  const [lastRun, setLastRun] = useState<{ taskId: string; prefill: boolean } | null>(null)

  const runTask = (task: Task, prefill: boolean) => {
    const target = { taskId: task.id, prefill }
    setLastRun(target)
    setView({ screen: 'run', ...target })
  }

  const navigate = (screen: Screen) => {
    if (screen === 'tasks') setView({ screen: 'tasks' })
    if (screen === 'run' && lastRun) setView({ screen: 'run', ...lastRun })
  }

  const runningTask = view.screen === 'run' ? findTask(view.taskId) : undefined

  useScrollToTop(
    view.screen,
    view.screen === 'run' ? `${view.taskId}-${view.prefill}` : view.screen === 'create' ? view.sampleKey : undefined,
  )

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        current={view.screen === 'run' ? 'run' : 'tasks'}
        runAvailable={lastRun !== null && findTask(lastRun.taskId) !== undefined}
        onNavigate={navigate}
        isSampleMode
      />
      {saveFailed && (
        <Notice tone="flag" icon="warning" role="alert" className="justify-center rounded-none">
          {STORAGE_FULL_MESSAGE}
        </Notice>
      )}
      {view.screen === 'tasks' && (
        <TaskListPage
          tasks={tasks}
          demo={demo}
          onCreate={(sampleKey) => setView({ screen: 'create', sampleKey })}
          onRun={(task) => runTask(task, task.isDemo === true)}
          onResetDemo={resetDemo}
        />
      )}
      {view.screen === 'create' && (
        <TaskCreatePage
          key={view.sampleKey ?? 'blank'}
          initialSampleKey={view.sampleKey}
          onCancel={() => setView({ screen: 'tasks' })}
          onSaved={(task) => {
            addTask(task)
            runTask(task, task.sampleKey !== undefined)
          }}
        />
      )}
      {view.screen === 'run' && runningTask && (
        <RunPage key={`${runningTask.id}-${view.prefill}`} task={runningTask} prefillMaterial={view.prefill} />
      )}
      <AppFooter />
    </div>
  )
}
