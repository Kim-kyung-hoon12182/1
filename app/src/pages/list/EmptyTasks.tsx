import Button from '@/components/Button'
import Icon from '@/components/Icon'
import { SAMPLES, SAMPLE_KEYS } from '@/data/sampleTasks'
import type { SampleKey } from '@/types/task'

type EmptyTasksProps = {
  onTryDemo: () => void
  onCreate: (sampleKey?: SampleKey) => void
}

// 등록한 작업이 없을 때: 체험, 직접 등록, 예시 작업으로 시작 (S1)
export default function EmptyTasks({ onTryDemo, onCreate }: EmptyTasksProps) {
  return (
    <section className="flex flex-col items-center gap-4 rounded-xl bg-surface-low p-8 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary">
        <Icon name="auto_awesome" className="text-[26px]" />
      </div>
      <div className="flex max-w-xl flex-col gap-1">
        <h2 className="text-headline-sm">AI가 쓴 글을 고치면, 앱이 기억해요</h2>
        <p className="text-body-sm text-secondary">3분이면 한 번 해 볼 수 있어요. 체험용 작업이라 내 작업에는 영향이 없어요.</p>
      </div>
      <Button variant="primary" size="lg" className="px-5 py-2.5" onClick={onTryDemo}>
        예시로 체험해 보기
      </Button>
      <p className="text-label-md text-secondary">
        직접 만들려면{' '}
        <button type="button" className="font-semibold text-primary hover:underline" onClick={() => onCreate()}>
          새 작업 등록
        </button>
        . 예시 작업으로 시작할 수도 있어요.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {SAMPLE_KEYS.map((key) => (
          <Button key={key} size="sm" className="bg-surface-lowest hover:bg-primary hover:text-on-primary" onClick={() => onCreate(key)}>
            {SAMPLES[key].label}
          </Button>
        ))}
      </div>
    </section>
  )
}
