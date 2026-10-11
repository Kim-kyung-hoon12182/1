import Button from '@/components/Button'
import Card from '@/components/Card'
import Icon from '@/components/Icon'
import type { RunSession } from '@/hooks/useRunSession'

// 결과 맨 아래: 고친 내용까지 반영해 복사하고 이번 실행을 기록한다 (F-06)
export default function CopyBar({ session }: { session: RunSession }) {
  return (
    <Card as="section" className="flex flex-col items-center justify-between gap-3 md:flex-row">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary">
          <Icon name="content_copy" className="text-[22px]" />
        </div>
        <div>
          <h3 className="text-headline-sm">다 봤다면 복사해서 쓰세요</h3>
          <p className="text-body-sm text-on-surface-variant">
            AI 결과는 정답을 보장하지 않아요. 고친 내용까지 반영해서 복사하고, 이번 실행을 기록해요.
          </p>
        </div>
      </div>
      <Button variant="primary" icon="content_copy" className="w-full md:w-auto" onClick={session.copyAndFinish}>
        복사하고 끝내기
      </Button>
    </Card>
  )
}
