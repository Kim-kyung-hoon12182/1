import type { Task } from '@/types/task'

const TASKS_KEY = 'mitgo:tasks'
const DEMO_KEY = 'mitgo:demo'

export const STORAGE_FULL_MESSAGE = '저장 공간이 가득 찼어요. 오래된 실행 기록을 지워주세요.'

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export const loadTasks = (): Task[] => {
  const value = read(TASKS_KEY)
  return Array.isArray(value) ? (value as Task[]) : []
}

export const saveTasks = (tasks: Task[]) => write(TASKS_KEY, tasks)

export const loadDemo = (): Task | null => {
  const value = read(DEMO_KEY)
  return value && typeof value === 'object' ? (value as Task) : null
}

export const saveDemo = (task: Task) => write(DEMO_KEY, task)
