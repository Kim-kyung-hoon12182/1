import { useState } from 'react'
import { createDemoTask } from '@/data/sampleTasks'
import { loadDemo, loadTasks, saveDemo, saveTasks } from '@/lib/storage'
import type { Run, Task } from '@/types/task'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks())
  const [demo, setDemo] = useState<Task>(() => loadDemo() ?? createDemoTask())
  const [saveFailed, setSaveFailed] = useState(false)

  function addTask(task: Task) {
    const next = [...tasks, task]
    setTasks(next)
    setSaveFailed(!saveTasks(next))
  }

  function resetDemo() {
    const fresh = createDemoTask()
    setDemo(fresh)
    setSaveFailed(!saveDemo(fresh))
  }

  // 실행 기록 확정 (F-06). 체험용 작업의 기록은 실제 작업과 섞이지 않게 체험용 저장소에만 남긴다.
  function addRun(taskId: string, run: Run) {
    if (taskId === demo.id) {
      const next = { ...demo, runs: [...demo.runs, run] }
      setDemo(next)
      setSaveFailed(!saveDemo(next))
      return
    }
    const next = tasks.map((task) => (task.id === taskId ? { ...task, runs: [...task.runs, run] } : task))
    setTasks(next)
    setSaveFailed(!saveTasks(next))
  }

  const findTask = (id: string) => (id === demo.id ? demo : tasks.find((task) => task.id === id))

  return { tasks, demo, saveFailed, addTask, addRun, resetDemo, findTask }
}
