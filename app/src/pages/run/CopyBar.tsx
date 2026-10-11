import Button from '@/components/Button'
import Card from '@/components/Card'
import { TextArea } from '@/components/Field'
import Icon from '@/components/Icon'
import Notice from '@/components/Notice'
import type { RunSession } from '@/hooks/useRunSession'

// 결과 맨 아래: 고친 내용까지 반영해 복사한다 (F-06의 첫 단계)
export default function CopyBar({ session }: { session: RunSession }) {
  return (
    <>
      <Card as="section" className="flex flex-col items-center justify-between gap-3 md:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary">
            <Icon name="content_copy" className="text-[22px]" />
          </div>
          <div>
            <h3 className="text-headline-sm">다 봤다면 복사해서 쓰세요</h3>
            <p className="text-body-sm text-on-surface-variant">
              AI 결과는 정답을 보장하지 않아요. 고친 내용까지 반영해서 복사하고, 쓰기 전에 확인할 곳을 한 번 더 살펴보세요.
            </p>
          </div>
        </div>
        <Button variant="primary" icon="content_copy" className="w-full md:w-auto" onClick={session.copyAndFinish}>
          복사하고 끝내기
        </Button>
      </Card>

      {session.copyState === 'done' && (
        <p role="status" className="text-body-sm font-semibold text-primary">
          복사했어요
        </p>
      )}
      {session.copyState === 'failed' && (
        <Card role="status">
          <Notice tone="flag" icon="warning">
            복사하지 못했어요. 아래 글을 직접 복사해 주세요.
          </Notice>
          <TextArea
            ref={session.fallbackRef}
            tone="paper"
            readOnly
            value={session.finalText}
            aria-label="복사할 결과"
            className="mt-2 h-32 p-2 text-body-sm"
          />
        </Card>
      )}
    </>
  )
}
