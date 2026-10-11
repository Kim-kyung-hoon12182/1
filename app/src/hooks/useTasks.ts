import { useState } from 'react'
import { createDemoTask } from '@/data/sampleTasks'
import { loadDemo, loadTasks, saveDemo, saveTasks } from '@/lib/storage'
import type { Task } from '@/types/task'

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

  const findTask = (id: string) => (id === demo.id ? demo : tasks.find((task) => task.id === id))

  return { tasks, demo, saveFailed, addTask, resetDemo, findTask }
}
