import Button from '@/components/Button'
import Icon from '@/components/Icon'
import { useTargetRect } from '@/hooks/useTargetRect'
import { useEffect } from 'react'
import { TOUR_END, TOUR_LOST_MS, TOUR_OPTIONAL_MS, type TourStep } from '@/lib/tour'

type TourOverlayProps = {
  step: TourStep | null
  atEnd: boolean
  index: number
  total: number
  onSkip: () => void
  onNext: () => void
  onFinish: () => void
  /** 안내를 끝내고 내 작업 만들기로 */
  onCreate: () => void
}

const PAD = 8
const PANEL = 'fixed z-[60] bg-on-surface/45 backdrop-blur-[3px]'

// 안내 모드: 회색 블러로 화면을 덮고 지금 누를 곳만 밝게 보여 준다. 밝은 곳은 막지 않아서 실제로 눌린다.
export default function TourOverlay({ step, atEnd, index, total, onSkip, onNext, onFinish, onCreate }: TourOverlayProps) {
  const { rect, lost } = useTargetRect(step?.target ?? null, step?.optional ? TOUR_OPTIONAL_MS : TOUR_LOST_MS)
  const skipOptional = Boolean(lost && step?.optional)

  // 조건이 안 맞아서 없는 단계는 알리지 않고 넘어간다
  useEffect(() => {
    if (skipOptional) onNext()
  }, [skipOptional])

  if (atEnd) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-on-surface/45 p-4 backdrop-blur-[3px]">
        <Bubble title={TOUR_END.title} body={TOUR_END.body} counter={`${total} / ${total}`}>
          <div className="flex gap-2">
            <Button onClick={onFinish}>닫기</Button>
            <Button variant="primary" icon="add" onClick={onCreate}>
              내 작업 만들기
            </Button>
          </div>
        </Bubble>
      </div>
    )
  }
  if (!step) return null

  // 요소가 아직 안 보이면 화면을 막지 않는다. 오래 안 보이면 끝내는 길만 보여 준다.
  if (!rect) {
    if (!lost || skipOptional) return null
    return (
      <div className="fixed bottom-4 left-1/2 z-[70] w-[min(22rem,calc(100%-2rem))] -translate-x-1/2">
        <Bubble title="안내를 이어 갈 수 없어요" body="다음 단계를 화면에서 찾지 못했어요.">
          <Button onClick={onSkip}>안내 끝내기</Button>
        </Bubble>
      </div>
    )
  }

  const top = Math.max(rect.top - PAD, 0)
  const left = Math.max(rect.left - PAD, 0)
  const right = rect.left + rect.width + PAD
  const bottom = rect.top + rect.height + PAD
  const room = { below: window.innerHeight - bottom, above: top }
  const onScreen = bottom > 0 && top < window.innerHeight
  // 말풍선은 요소 아래, 위, 둘 다 좁거나 요소가 화면 밖이면 화면 아래 가운데 순서로 둔다
  const place = !onScreen ? 'dock' : room.below > 220 ? 'below' : room.above > 220 && room.above < window.innerHeight ? 'above' : 'dock'
  const bubbleLeft = Math.min(Math.max(rect.left, 16), window.innerWidth - 352)
  const bubbleStyle =
    place === 'below'
      ? { left: bubbleLeft, top: bottom + 12 }
      : place === 'above'
        ? { left: bubbleLeft, bottom: window.innerHeight - top + 12 }
        : { left: Math.max((window.innerWidth - 320) / 2, 16), bottom: 16 }

  return (
    <>
      <div aria-hidden className={`${PANEL} inset-x-0 top-0`} style={{ height: top }} />
      <div aria-hidden className={`${PANEL} inset-x-0 bottom-0`} style={{ top: bottom }} />
      <div aria-hidden className={`${PANEL} left-0`} style={{ top, height: bottom - top, width: left }} />
      <div aria-hidden className={`${PANEL} right-0`} style={{ top, height: bottom - top, left: right }} />
      <div
        aria-hidden
        className="pointer-events-none fixed z-[61] rounded-xl ring-4 ring-primary-container"
        style={{ top, left, width: right - left, height: bottom - top }}
      />
      <div
        className="fixed z-[70] w-80"
        style={bubbleStyle}
      >
        <Bubble title={step.title} body={step.body} counter={`${index + 1} / ${total}`}>
          <Button size="sm" variant="ghost" onClick={onSkip}>
            건너뛰기
          </Button>
        </Bubble>
      </div>
    </>
  )
}

type BubbleProps = { title: string; body: string; counter?: string; children: React.ReactNode }

function Bubble({ title, body, counter, children }: BubbleProps) {
  return (
    <div role="dialog" aria-live="polite" aria-label="사용 안내" className="rounded-xl bg-surface-lowest p-4 shadow-xl ring-1 ring-outline-variant">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-label-md text-primary">
          <Icon name="explore" className="text-[16px]" />
          사용 안내
        </span>
        {counter && <span className="text-label-md text-on-surface-variant">{counter}</span>}
      </div>
      <h3 className="text-headline-sm">{title}</h3>
      <p className="mt-1 text-body-sm leading-relaxed text-on-surface-variant">{body}</p>
      <div className="mt-3 flex justify-end">{children}</div>
    </div>
  )
}
