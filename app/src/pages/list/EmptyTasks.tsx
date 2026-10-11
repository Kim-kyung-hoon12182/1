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
    <section className="flex flex-col items-center gap-6 rounded-xl bg-surface-low p-8 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-lowest text-primary shadow-sm">
        <Icon name="rocket_launch" className="text-[28px]" />
      </div>
      <div className="flex max-w-2xl flex-col gap-1">
        <h2 className="text-headline-sm">아직 등록한 작업이 없어요</h2>
        <p className="text-body-sm text-secondary">
          먼저 예시로 해 보세요. 직접 등록하면 질문 4개에 답하는 것만으로 규칙 초안이 나와요. 예시 작업을 바탕으로 시작할 수도 있어요.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="primary" size="lg" className="px-5 py-2.5" onClick={onTryDemo}>
          예시로 체험해 보기
        </Button>
        <Button className="bg-surface-lowest px-4 py-2.5 shadow-sm hover:bg-surface" onClick={() => onCreate()}>
          직접 등록하기
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-label-sm text-secondary">예시 작업으로 시작:</span>
        {SAMPLE_KEYS.map((key) => (
          <Button
            key={key}
            size="sm"
            className="bg-surface-lowest hover:bg-primary hover:text-on-primary"
            onClick={() => onCreate(key)}
          >
            {SAMPLES[key].label}
          </Button>
        ))}
      </div>
    </section>
  )
}
