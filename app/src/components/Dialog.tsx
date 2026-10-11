import { useEffect, useId, useRef, type ReactNode } from 'react'
import IconButton from '@/components/IconButton'

type DialogProps = {
  title: string
  onClose: () => void
  children: ReactNode
}

// 화면 위에 뜨는 창. 브라우저 기본 <dialog>를 써서 Esc로 닫기와 포커스 가두기를 따로 만들지 않는다.
export default function Dialog({ title, onClose, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  // 정리 단계에서 close()를 부르지 않는다. 닫힘 이벤트가 onClose를 다시 불러 창이 열리자마자 닫힐 수 있다.
  // 요소가 화면에서 사라지면 창도 함께 끝난다.
  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onKeyDown={(event) => {
        // 브라우저 기본 닫힘에 기대지 않고 Esc를 직접 처리한다
        if (event.key === 'Escape') {
          event.preventDefault()
          onClose()
        }
      }}
      onClick={(event) => {
        // 어두운 배경을 누르면 닫는다
        if (event.target === event.currentTarget) onClose()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-xl bg-surface-lowest p-0 text-on-surface shadow-xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
    >
      <div className="flex max-h-[85vh] flex-col">
        <div className="flex items-center justify-between gap-2 border-b border-outline-variant px-5 py-3">
          <h2 id={titleId} className="text-headline-sm">
            {title}
          </h2>
          <IconButton icon="close" label="닫기" onClick={onClose} />
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </dialog>
  )
}
