import { useEffect, useState } from 'react'
import AppFooter from '@/components/AppFooter'
import AppHeader, { type Screen } from '@/components/AppHeader'
import Notice from '@/components/Notice'
import OnboardingDialog from '@/components/OnboardingDialog'
import TourOverlay from '@/components/TourOverlay'
import { useRoute } from '@/hooks/useRoute'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { useTasks } from '@/hooks/useTasks'
import { useTour } from '@/hooks/useTour'
import { STORAGE_FULL_MESSAGE } from '@/lib/storage'
import RunPage from '@/pages/RunPage'
import TaskCreatePage from '@/pages/TaskCreatePage'
import TaskListPage from '@/pages/TaskListPage'
import type { Task } from '@/types/task'

export default function App() {
  const { tasks, demo, saveFailed, addTask, addRun, resetDemo, findTask } = useTasks()
  const [view, go] = useRoute()
  const tour = useTour(view.screen)
  // 처음 오는 사람(저장한 작업도, 안내를 본 기록도 없음)에게만 첫 방문 안내(S0)를 보여 준다
  const [onboardingOpen, setOnboardingOpen] = useState(() => tour.status === null && tasks.length === 0)
  const [lastRun, setLastRun] = useState<{ taskId: string; prefill: boolean } | null>(null)

  const runTask = (task: Task, prefill: boolean, options: { replace?: boolean } = {}) => {
    const target = { taskId: task.id, prefill }
    setLastRun(target)
    go({ screen: 'run', ...target }, options)
  }

  const startTour = () => {
    setOnboardingOpen(false)
    // 체험용 작업을 처음 모양(1·2회차 안 고침)으로 되돌려, 마지막에 맡겨볼 만한 때를 보여 줄 수 있게 한다
    resetDemo()
    go({ screen: 'tasks' })
    tour.start()
  }

  const skipOnboarding = () => {
    setOnboardingOpen(false)
    tour.stop('skipped')
  }

  const navigate = (screen: Screen) => {
    if (screen === 'tasks') go({ screen: 'tasks' })
    if (screen === 'run' && lastRun) go({ screen: 'run', ...lastRun })
  }

  const runningTask = view.screen === 'run' ? findTask(view.taskId) : undefined
  // 새로고침으로 바로 실행 화면이 열린 경우에도 [작업 실행] 메뉴가 열려 있어야 한다
  const currentRun = view.screen === 'run' ? { taskId: view.taskId, prefill: view.prefill } : lastRun

  // 없는 작업의 주소(지운 기록, 잘못된 링크)는 내 작업으로 보낸다
  useEffect(() => {
    if (view.screen === 'run' && !findTask(view.taskId)) go({ screen: 'tasks' }, { replace: true })
  }, [view])

  useScrollToTop(
    view.screen,
    view.screen === 'run' ? `${view.taskId}-${view.prefill}` : view.screen === 'create' ? view.sampleKey : undefined,
  )

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        current={view.screen === 'run' ? 'run' : 'tasks'}
        runAvailable={currentRun !== null && findTask(currentRun.taskId) !== undefined}
        onNavigate={navigate}
        onStartTour={startTour}
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
          onCreate={(sampleKey) => go({ screen: 'create', sampleKey })}
          onRun={(task) => runTask(task, task.isDemo === true && !tour.running)}
          onResetDemo={resetDemo}
        />
      )}
      {view.screen === 'create' && (
        <TaskCreatePage
          key={view.sampleKey ?? 'blank'}
          initialSampleKey={view.sampleKey}
          onCancel={() => go({ screen: 'tasks' })}
          onSaved={(task) => {
            addTask(task)
            runTask(task, task.sampleKey !== undefined, { replace: true })
          }}
        />
      )}
      {view.screen === 'run' && runningTask && (
        <RunPage
          key={`${runningTask.id}-${view.prefill}`}
          task={runningTask}
          prefillMaterial={view.prefill}
          onRecord={(run) => addRun(runningTask.id, run)}
          onGoToTasks={() => go({ screen: 'tasks' })}
        />
      )}
      <AppFooter />
      {onboardingOpen && <OnboardingDialog onTour={startTour} onSkip={skipOnboarding} />}
      {tour.running && tour.index !== null && (
        <TourOverlay
          step={tour.step}
          atEnd={tour.atEnd}
          index={tour.index}
          total={tour.total}
          onSkip={() => tour.stop('skipped')}
          onNext={tour.next}
          onFinish={() => tour.stop('done')}
        />
      )}
    </div>
  )
}
