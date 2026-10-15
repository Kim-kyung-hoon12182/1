import Card from '@/components/Card'
import Spinner from '@/components/Spinner'

// 결과를 기다리는 동안 결과 카드가 놓일 자리를 보여 준다
export default function ResultSkeleton() {
  return (
    <div role="status" aria-live="polite" aria-label="결과를 쓰고 있어요" className="space-y-4">
      <p className="flex items-center gap-2 text-body-sm font-semibold text-on-surface-variant">
        <Spinner />
        결과를 쓰고 있어요. 곧 이 자리에 줄마다 나와요.
      </p>
      <p className="text-label-md text-on-surface-variant">보통 몇 초 걸려요. 자료가 길고 줄마다 정리하는 규칙이면 최대 1분 걸릴 수 있어요.</p>
      <ul aria-hidden className="space-y-3">
        {[80, 65, 90, 55].map((width, index) => (
          <Card key={index} as="li" bordered padding="none" className="flex animate-pulse items-center gap-3 border-l-4 border-neutral-line/40 px-4 py-4">
            <div className="h-6 w-8 shrink-0 rounded bg-surface-high" />
            <div className="h-4 rounded bg-surface-high" style={{ width: `${width}%` }} />
            <div className="ml-auto h-6 w-24 shrink-0 rounded-full bg-surface" />
          </Card>
        ))}
      </ul>
    </div>
  )
}
