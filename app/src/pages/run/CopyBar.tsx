import Button from '@/components/Button'
import Card from '@/components/Card'
import Icon from '@/components/Icon'
import type { RunSession } from '@/hooks/useRunSession'

// 결과 맨 아래: 고친 내용까지 반영해 복사하고 이번 실행을 기록한다 (F-06)
export default function CopyBar({ session }: { session: RunSession }) {
  return (
    <Card
      as="section"
      padding="sm"
      className="sticky bottom-3 z-30 flex flex-col items-center justify-between gap-2 shadow-lg ring-1 ring-outline-variant md:flex-row md:gap-3 md:p-4"
    >
      <div className="flex items-center gap-3">
        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary md:flex">
          <Icon name="content_copy" className="text-[22px]" />
        </div>
        <div>
          <h3 className="text-body-md font-semibold md:text-headline-sm">다 봤으면 복사할 글을 열어 보세요</h3>
          <p className="hidden text-body-sm text-on-surface-variant md:block">
            AI 결과가 항상 맞는 건 아니에요. 고친 내용까지 반영한 글을 먼저 보여 드리고, 거기서 복사하면 이번 실행을 기록해요.
          </p>
        </div>
      </div>
      <Button
        data-tour="copy-finish"
        // 고치던 입력칸에서 커서가 빠져 화면이 움직이면 이 클릭이 놓친다. 커서를 그대로 두고 누른다.
        onMouseDown={(event) => event.preventDefault()}
        variant="primary"
        icon="article"
        className="w-full md:w-auto"
        disabled={session.finalText.trim() === ''}
        onClick={session.openPreview}
      >
        복사할 글 보기
      </Button>
    </Card>
  )
}
