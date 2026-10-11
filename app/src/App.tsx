import { useState } from 'react'
import AppHeader, { type Screen } from '@/components/AppHeader'
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

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        current={view.screen === 'run' ? 'run' : 'tasks'}
        runAvailable={lastRun !== null && findTask(lastRun.taskId) !== undefined}
        onNavigate={navigate}
        isSampleMode
      />
      {saveFailed && (
        <p role="alert" className="bg-orange-50 px-4 py-2 text-center text-body-sm text-orange-900">
          {STORAGE_FULL_MESSAGE}
        </p>
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
    </div>
  )
}
