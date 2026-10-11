import Card from '@/components/Card'
import Icon from '@/components/Icon'
import { isHandoffReady } from '@/lib/streak'
import type { Task } from '@/types/task'

// 안내 카드와 내 작업 현황 (실제 값만 보여 준다)
export default function Overview({ tasks }: { tasks: Task[] }) {
  const tiles = [
    { label: '등록한 작업', value: tasks.length, unit: '개' },
    { label: '실행 기록', value: tasks.reduce((sum, task) => sum + task.runs.length, 0), unit: '회' },
    { label: '맡겨볼 만한 때', value: tasks.filter((task) => isHandoffReady(task.runs)).length, unit: '개' },
  ]

  return (
    <section className="mb-6 grid gap-3 lg:grid-cols-12">
      <Card className="relative flex items-start gap-3 overflow-hidden lg:col-span-8">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5" />
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-primary">
          <Icon name="lightbulb" className="text-[20px]" />
        </div>
        <div className="relative flex min-w-0 flex-col gap-1 pr-2">
          <div className="flex items-center gap-2">
            <h2 className="text-headline-sm">작업이 뭔가요?</h2>
          </div>
          <p className="text-body-sm leading-normal text-secondary">
            자주 쓰는 문서의 <strong className="text-on-surface">설명과 규칙</strong>을 저장해 두는 곳이에요. 매번 같은 설명을 다시 쓰지 않아도 돼요.
            규칙은 글을 쓸 때 지킬 약속이고, 앱이 결과를 판단하는 기준은 아니에요. 자료를 넣고 [실행하기]를 누르면 규칙에 맞춰 글을 쓰고 확인할 곳을 표시해 줘요.
          </p>
        </div>
      </Card>

      <Card className="flex flex-col justify-between lg:col-span-4">
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-label-sm text-secondary">내 작업 현황</h2>
          <span className="inline-flex items-center gap-1 text-label-sm text-outline">
            <Icon name="save" className="text-[13px]" />이 브라우저에 저장돼요
          </span>
        </div>
        <dl className="grid grid-cols-3 gap-2 pt-1">
          {tiles.map((tile) => (
            <div key={tile.label} className="flex flex-col rounded-lg bg-surface-low p-2">
              <dt className="text-label-sm text-secondary">{tile.label}</dt>
              <dd className="mt-0.5 flex items-baseline gap-1">
                <span className="text-headline-lg">{tile.value}</span>
                <span className="text-label-sm text-outline">{tile.unit}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Card>
    </section>
  )
}
