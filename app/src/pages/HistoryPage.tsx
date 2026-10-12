import { useState } from 'react'
import Button from '@/components/Button'
import Card from '@/components/Card'
import EmptyState from '@/components/EmptyState'
import Notice from '@/components/Notice'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { matchesFilter, summarize, toEntries, trendOf, type RunFilter } from '@/lib/history'
import { isHandoffReady } from '@/lib/streak'
import type { Task } from '@/types/task'
import RunRow from './history/RunRow'
import TrendBars from './history/TrendBars'

type HistoryPageProps = {
  tasks: Task[]
  demo: Task
  onGoToTasks: () => void
  onRemoveRun: (taskId: string, runId: string) => void
  /** 이 기록의 작업을 다시 실행 */
  onRunTask: (taskId: string) => void
  /** 처음에 이 작업의 이력만 보여 줄 때 */
  initialTaskId?: string
}

const FILTERS: { id: RunFilter; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'unedited', label: '안 고침' },
  { id: 'edited', label: '고침' },
  { id: 'notCopied', label: '복사 안 됨' },
]

const PAGE_SIZE = 20
const DEMO_SCOPE = 'demo'

// 실행 이력: 작업별 기록을 모아 보고, 회차마다 얼마나 고쳤는지 추이를 본다
export default function HistoryPage({ tasks, demo, onGoToTasks, onRemoveRun, onRunTask, initialTaskId }: HistoryPageProps) {
  const knownScope = initialTaskId && [...tasks, demo].some((task) => task.id === initialTaskId)
  const [scope, setScope] = useState(knownScope ? (initialTaskId as string) : 'all')
  const [filter, setFilter] = useState<RunFilter>('all')
  const [shown, setShown] = useState(PAGE_SIZE)
  useDocumentTitle('실행 이력')

  const scoped = scope === DEMO_SCOPE ? [demo] : scope === 'all' ? tasks : tasks.filter((task) => task.id === scope)
  const entries = toEntries(scoped)
  const visible = entries.filter(({ run }) => matchesFilter(run, filter))
  const stats = summarize(entries)
  const trendTasks = scoped.filter((task) => task.runs.length > 0)
  const readyCount = scoped.filter((task) => isHandoffReady(task.runs)).length

  return (
    <PageContainer>
      <PageHeader
        title="실행 이력"
        description="작업마다 결과를 고쳤는지 쌓인 기록이에요. 복사할 때 자동으로 남아요."
        actions={
          <label className="flex items-center gap-2 text-body-sm">
            <span className="text-secondary">보기</span>
            <select
              value={scope}
              onChange={(event) => {
                setScope(event.target.value)
                setShown(PAGE_SIZE)
              }}
              className="rounded-lg border border-outline-variant bg-surface-lowest px-3 py-2 text-body-sm"
            >
              <option value="all">내 작업 전체</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.name}
                </option>
              ))}
              <option value={DEMO_SCOPE}>체험용 예시</option>
            </select>
          </label>
        }
      />

      <Notice tone="info" icon="info" className="mb-4">
        "안 고침"은 결과를 바꾸지 않고 복사했다는 기록이에요. 결과가 정확하다는 뜻은 아니에요.
      </Notice>

      {entries.length === 0 ? (
        <EmptyState
          icon="history"
          title="아직 실행 기록이 없어요"
          actions={
            <Button variant="primary" onClick={onGoToTasks}>
              내 작업으로
            </Button>
          }
        >
          작업을 실행하고 [복사하고 끝내기]를 누르면 여기에 쌓여요.
        </EmptyState>
      ) : (
        <>
          <section aria-label="요약" className="mb-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: '실행 기록', value: stats.total, unit: '회' },
              { label: '안 고치고 복사', value: stats.unedited, unit: `회 (${stats.ratio}%)` },
              { label: '맡겨볼 만한 때', value: readyCount, unit: '개 작업' },
            ].map((tile) => (
              <Card key={tile.label} className="space-y-1">
                <p className="text-label-md text-secondary">{tile.label}</p>
                <p className="text-headline-lg">
                  {tile.value} <span className="text-body-sm text-on-surface-variant">{tile.unit}</span>
                </p>
              </Card>
            ))}
          </section>

          <section aria-label="추이" className="mb-6 space-y-2">
            <h2 className="text-headline-sm">회차마다 고친 줄 수</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {trendTasks.map((task) => (
                <Card key={task.id} className="space-y-2">
                  <p className="text-body-md font-semibold">{task.name}</p>
                  <TrendBars counts={trendOf(task.runs)} />
                  <p className="text-label-md text-on-surface-variant">오래된 기록이 왼쪽이에요. 막대가 없으면 안 고친 기록이에요.</p>
                </Card>
              ))}
            </div>
          </section>

          <div role="group" aria-label="보기 조건" className="mb-3 flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <Button
                key={item.id}
                size="sm"
                variant={filter === item.id ? 'primary' : 'tonal'}
                aria-pressed={filter === item.id}
                onClick={() => {
                  setFilter(item.id)
                  setShown(PAGE_SIZE)
                }}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="rounded-lg bg-surface-low p-4 text-body-sm text-on-surface-variant">이 조건에 맞는 기록이 없어요.</p>
          ) : (
            <ul className="space-y-3">
              {visible.slice(0, shown).map((entry) => (
                <RunRow
                  key={entry.run.id}
                  entry={entry}
                  onRemove={() => onRemoveRun(entry.taskId, entry.run.id)}
                  onRun={() => onRunTask(entry.taskId)}
                />
              ))}
            </ul>
          )}
          {visible.length > shown && (
            <div className="mt-4 flex justify-center">
              <Button onClick={() => setShown((count) => count + PAGE_SIZE)}>더 보기 ({visible.length - shown}개 남음)</Button>
            </div>
          )}
        </>
      )}
    </PageContainer>
  )
}
