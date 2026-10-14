import { useEffect, useRef } from 'react'
import Button from '@/components/Button'
import IconButton from '@/components/IconButton'
import Notice from '@/components/Notice'
import type { RunSession } from '@/hooks/useRunSession'
import { countDeleted } from '@/lib/run'

// 복사하기 전에 복사될 글(고친 내용 반영, 삭제한 줄 제외)을 보여 주고, 여기서 복사하면 이번 실행을 기록한다 (S3-8, F-06).
// 안내 모드의 덮개(z-60) 아래에 놓이도록 브라우저 기본 <dialog>(맨 위 층)를 쓰지 않고 직접 만든다.
export default function CopyPreviewDialog({ session }: { session: RunSession }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const { lines, flagged, finalText, closePreview, copyAndFinish } = session
  const edited = lines.filter((line) => !line.deleted && line.editedText !== undefined).length
  const deleted = countDeleted(lines)

  // Esc로 닫고, Tab은 창 안에서만 돈다
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        closePreview()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const items = [...panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), pre[tabindex]')].filter((item) => item.getClientRects().length > 0)
      if (items.length === 0) return
      const at = items.indexOf(document.activeElement as HTMLElement)
      const next = at === -1 ? 0 : (at + (event.shiftKey ? -1 : 1) + items.length) % items.length
      event.preventDefault()
      items[next].focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closePreview])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closePreview()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="copy-preview-title"
        data-tour="copy-preview"
        className="flex max-h-[88vh] w-full max-w-2xl flex-col rounded-t-2xl bg-surface-lowest shadow-xl sm:rounded-xl"
      >
        <div className="flex items-center justify-between gap-2 border-b border-outline-variant px-5 py-3">
          <h2 id="copy-preview-title" className="text-headline-sm">
            복사할 글
          </h2>
          <IconButton icon="close" label="닫기" onClick={closePreview} />
        </div>
        <div className="space-y-3 overflow-y-auto p-5">
          <p className="text-body-sm text-on-surface-variant">
            아래 글이 복사돼요. 고친 내용은 들어가고 삭제한 줄은 빠져요.
            {edited + deleted > 0 && ` (고친 줄 ${edited}개, 삭제한 줄 ${deleted}개)`}
          </p>
          {flagged.length > 0 && (
            <Notice tone="flag" icon="warning">
              아직 확인할 곳이 {flagged.length}개 남아 있어요. 돌아가서 볼 수 있어요.
            </Notice>
          )}
          <pre tabIndex={0} aria-label="복사될 글" className="max-h-[45vh] overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-surface-low p-3 font-sans text-body-md">
            {finalText}
          </pre>
          <p className="text-label-md text-on-surface-variant">AI 결과가 항상 맞는 건 아니에요. 붙여 넣은 뒤에도 한 번 더 읽어 보세요.</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-outline-variant px-5 py-3">
          <Button onClick={closePreview}>돌아가기</Button>
          <Button autoFocus data-tour="copy-confirm" variant="primary" icon="content_copy" onClick={copyAndFinish}>
            이대로 복사하고 기록
          </Button>
        </div>
      </div>
    </div>
  )
}
