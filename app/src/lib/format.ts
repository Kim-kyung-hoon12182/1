import type { Task } from '@/types/task'

const DAY = 24 * 60 * 60 * 1000

// 카드에 보여 줄 "최근 실행" 문구
export const describeLastRun = (task: Task, now = Date.now()) => {
  const last = task.runs[task.runs.length - 1]
  if (!last) return '아직 실행 전이에요'
  const days = Math.max(0, Math.floor((now - new Date(last.createdAt).getTime()) / DAY))
  return `최근 실행: ${days === 0 ? '오늘' : days === 1 ? '어제' : `${days}일 전`}`
}
