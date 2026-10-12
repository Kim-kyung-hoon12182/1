import type { Run, Task } from '@/types/task'

export type HistoryEntry = { taskId: string; taskName: string; isDemo: boolean; run: Run }

export type RunFilter = 'all' | 'unedited' | 'edited' | 'notCopied'

// 모든 작업의 실행 기록을 한 줄로 모은다. 최근 것이 위.
export const toEntries = (tasks: Pick<Task, 'id' | 'name' | 'isDemo' | 'runs'>[]): HistoryEntry[] =>
  tasks
    .flatMap((task) => task.runs.map((run) => ({ taskId: task.id, taskName: task.name, isDemo: task.isDemo === true, run })))
    .sort((a, b) => new Date(b.run.createdAt).getTime() - new Date(a.run.createdAt).getTime())

// 앱 안에서 고쳤거나, 복사한 뒤 다른 곳에서 고쳤다고 답한 기록
export const wasEdited = (run: Pick<Run, 'edited' | 'editedAfter'>) => run.edited || run.editedAfter === 'yes'

export const matchesFilter = (run: Pick<Run, 'edited' | 'copied' | 'editedAfter'>, filter: RunFilter) =>
  filter === 'all' ||
  (filter === 'unedited' && !wasEdited(run) && run.copied) ||
  (filter === 'edited' && wasEdited(run)) ||
  (filter === 'notCopied' && !run.copied)

// 사용자가 고친 줄 수. 예시 기록처럼 줄이 저장되지 않은 기록은 고친 기록이면 1로 본다.
export const editedLineCount = (run: Pick<Run, 'edited' | 'lines'>) => {
  const count = run.lines.filter((line) => line.editedText !== undefined).length
  return run.edited ? Math.max(count, 1) : 0
}

// 자료 앞부분만 보여 준다
export const shortMaterial = (input: string, max = 30) => {
  const first = input.trim().split('\n')[0].trim()
  return first.length > max ? `${first.slice(0, max)}…` : first
}

export const summarize = (entries: Pick<HistoryEntry, 'run'>[]) => {
  const total = entries.length
  const unedited = entries.filter(({ run }) => !wasEdited(run) && run.copied).length
  return { total, unedited, ratio: total === 0 ? 0 : Math.round((unedited / total) * 100), notCopied: entries.filter(({ run }) => !run.copied).length }
}

// 회차별 고친 줄 수(오래된 것이 앞). "덜 고치게 됐는지"를 숫자로 보여 준다.
export const trendOf = (runsOldestFirst: Pick<Run, 'edited' | 'lines'>[], limit = 10) => runsOldestFirst.slice(-limit).map(editedLineCount)
