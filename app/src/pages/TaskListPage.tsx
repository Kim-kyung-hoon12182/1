import Icon from '@/components/Icon'
import RunChips from '@/components/RunChips'
import { SAMPLES, SAMPLE_KEYS } from '@/data/sampleTasks'
import { isHandoffReady } from '@/lib/streak'
import type { SampleKey, Task } from '@/types/task'

type TaskListPageProps = {
  tasks: Task[]
  demo: Task
  onCreate: (sampleKey?: SampleKey) => void
  onRun: (task: Task) => void
  onResetDemo: () => void
}

const TASK_ICONS: Record<SampleKey, string> = {
  report: 'trending_up',
  til: 'edit_note',
  summary: 'summarize',
  minutes: 'checklist',
}

const DAY = 24 * 60 * 60 * 1000

const formatLastRun = (task: Task) => {
  const last = task.runs[task.runs.length - 1]
  if (!last) return '아직 실행 전이에요'
  const days = Math.max(0, Math.floor((Date.now() - new Date(last.createdAt).getTime()) / DAY))
  return `최근 실행: ${days === 0 ? '오늘' : days === 1 ? '어제' : `${days}일 전`}`
}

function TaskCard({ task, onRun }: { task: Task; onRun: (task: Task) => void }) {
  const ready = isHandoffReady(task.runs)
  const shownRules = task.rules.slice(0, 3)
  return (
    <article className="flex flex-col justify-between gap-4 rounded-xl bg-surface-lowest p-5 shadow-sm transition-shadow hover:shadow-md lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface-low text-primary">
          <Icon name={task.sampleKey ? TASK_ICONS[task.sampleKey] : 'description'} className="text-[24px]" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            {task.isDemo && (
              <span className="rounded bg-primary-fixed px-2 py-0.5 text-label-sm font-semibold text-on-primary-fixed">
                예시
              </span>
            )}
            <span className="rounded bg-surface px-2 py-0.5 text-label-sm text-secondary">규칙 {task.rules.length}개</span>
            {ready && (
              <span className="rounded bg-primary px-2 py-0.5 text-label-sm font-semibold text-on-primary">
                맡겨볼 만한 때예요
              </span>
            )}
            {task.handsOff && (
              <span className="rounded bg-slate-100 px-2 py-0.5 text-label-sm text-slate-600">확인 생략 중</span>
            )}
          </div>
          <h3 className="truncate text-headline-sm">{task.name}</h3>
          <p className="line-clamp-1 text-body-sm text-secondary">{task.answers.what}</p>
          {shownRules.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="shrink-0 text-label-sm text-outline">지키는 규칙:</span>
              {shownRules.map((rule) => (
                <span key={rule.id} className="rounded bg-surface-low px-2 py-0.5 text-label-sm text-on-surface-variant">
                  {rule.text}
                </span>
              ))}
              {task.rules.length > shownRules.length && (
                <span className="text-label-sm text-outline">외 {task.rules.length - shownRules.length}개</span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
        <div className="flex flex-col gap-1 lg:items-end">
          <span className="text-label-sm text-secondary">{formatLastRun(task)}</span>
          {task.runs.length > 0 && <RunChips runs={task.runs} />}
        </div>
        <button
          type="button"
          onClick={() => onRun(task)}
          className="inline-flex items-center gap-1 rounded-lg bg-primary px-3.5 py-2 text-headline-sm text-on-primary shadow-sm hover:bg-primary-container"
        >
          <Icon name="play_arrow" className="text-[17px]" />
          실행하기
        </button>
      </div>
    </article>
  )
}

export default function TaskListPage({ tasks, demo, onCreate, onRun, onResetDemo }: TaskListPageProps) {
  const runCount = tasks.reduce((sum, task) => sum + task.runs.length, 0)
  const readyCount = tasks.filter((task) => isHandoffReady(task.runs)).length
  const myTasks = [...tasks].reverse()

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-16 sm:px-8">
      <section className="flex flex-col justify-between gap-4 pb-6 lg:flex-row lg:items-end">
        <div className="flex max-w-3xl flex-col gap-1">
          <span className="inline-flex w-fit items-center gap-1.5 rounded bg-surface px-2 py-0.5 text-label-sm text-primary">
            <Icon name="folder_special" className="text-[13px]" />
            반복 작업 관리
          </span>
          <h1 className="mt-1 text-headline-lg tracking-tight">내 작업</h1>
          <p className="text-body-md leading-relaxed text-secondary">
            자주 하는 문서 작업을 한 번 등록해 두면, 다음부터는 재료만 넣어 실행할 수 있어요. 고친 내용이 쌓이면 맡겨볼 만한 때를 알려드려요.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onRun(demo)}
            className="inline-flex items-center gap-1 rounded-lg bg-surface-lowest px-3.5 py-2 text-body-sm shadow-sm hover:bg-surface"
          >
            <Icon name="science" className="text-[18px] text-outline" />
            예시로 체험해보기
          </button>
          <button
            type="button"
            onClick={() => onCreate()}
            className="inline-flex items-center gap-1 rounded-lg bg-primary-container px-4 py-2 text-headline-sm text-on-primary shadow-sm hover:bg-primary"
          >
            <Icon name="add" className="text-[18px]" />새 작업 등록
          </button>
        </div>
      </section>

      <section className="mb-6 grid gap-3 lg:grid-cols-12">
        <div className="relative flex items-start gap-3 overflow-hidden rounded-xl bg-surface-lowest p-4 shadow-sm lg:col-span-8">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5" />
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-primary">
            <Icon name="lightbulb" className="text-[20px]" />
          </div>
          <div className="flex min-w-0 flex-col gap-1 pr-2">
            <div className="flex items-center gap-2">
              <span className="text-headline-sm">'작업'이란 무엇인가요?</span>
              <span className="rounded bg-surface-high px-1.5 text-label-sm text-primary">안내</span>
            </div>
            <p className="text-body-sm leading-normal text-secondary">
              매번 같은 설명을 다시 쓰지 않도록, 자주 하는 문서 작업의 <strong className="text-on-surface">설명과 규칙</strong>을 저장해 두는 곳이에요.
              규칙은 AI가 글을 쓸 때 지키는 약속이고, 앱이 결과가 맞는지 판단하는 기준은 아니에요. 재료를 넣고 [실행하기]를 누르면 AI가 규칙을 지켜 글을 쓰고, 확인할 곳을 짚어 드려요.
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-xl bg-surface-lowest p-4 shadow-sm lg:col-span-4">
          <div className="flex items-center justify-between pb-2">
            <span className="text-label-sm text-secondary">내 작업 현황</span>
            <span className="inline-flex items-center gap-1 text-label-sm text-outline">
              <Icon name="save" className="text-[13px]" />이 브라우저에 저장돼요
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { label: '등록한 작업', value: tasks.length, unit: '개' },
              { label: '실행 기록', value: runCount, unit: '회' },
              { label: '맡겨볼 만한 때', value: readyCount, unit: '개' },
            ].map((tile) => (
              <div key={tile.label} className="flex flex-col rounded-lg bg-surface-low p-2">
                <span className="text-label-sm text-secondary">{tile.label}</span>
                <div className="mt-0.5 flex items-baseline gap-1">
                  <span className="text-headline-lg">{tile.value}</span>
                  <span className="text-label-sm text-outline">{tile.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {myTasks.length === 0 ? (
        <section className="flex flex-col items-center gap-6 rounded-xl bg-surface-low p-8 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-lowest text-primary shadow-sm">
            <Icon name="rocket_launch" className="text-[28px]" />
          </div>
          <div className="flex max-w-2xl flex-col gap-1">
            <h2 className="text-headline-sm">아직 등록한 작업이 없어요</h2>
            <p className="text-body-sm text-secondary">
              처음이라면 예시로 먼저 체험해 보세요. 직접 등록하면 질문 4개에 답하는 것만으로 규칙이 만들어져요. 예시 작업으로 시작할 수도 있어요.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onRun(demo)}
              className="rounded-lg bg-primary px-5 py-2.5 text-headline-sm text-on-primary shadow-sm hover:bg-primary-container"
            >
              예시로 체험해보기
            </button>
            <button
              type="button"
              onClick={() => onCreate()}
              className="rounded-lg bg-surface-lowest px-4 py-2.5 text-body-sm shadow-sm hover:bg-surface"
            >
              직접 등록하기
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-label-sm text-secondary">예시 작업으로 시작:</span>
            {SAMPLE_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onCreate(key)}
                className="rounded bg-surface-lowest px-2.5 py-1 text-label-md hover:bg-primary hover:text-on-primary"
              >
                {SAMPLES[key].label}
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="flex flex-col gap-3">
          {myTasks.map((task) => (
            <TaskCard key={task.id} task={task} onRun={onRun} />
          ))}
        </section>
      )}

      <section className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-headline-sm">예시</h2>
          <button
            type="button"
            onClick={onResetDemo}
            className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-label-md text-secondary hover:bg-surface"
          >
            <Icon name="restart_alt" className="text-[16px]" />
            체험 초기화
          </button>
        </div>
        <TaskCard task={demo} onRun={onRun} />
      </section>
    </main>
  )
}
