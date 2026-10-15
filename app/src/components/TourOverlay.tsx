import Button from '@/components/Button'
import Icon from '@/components/Icon'
import Spinner from '@/components/Spinner'
import { useRects, useTargetRect } from '@/hooks/useTargetRect'
import { contains, grow, overlaps, overlayClipPath, placeBubble, splitAround } from '@/lib/tourLayout'
import { useEffect, useState } from 'react'
import { useTourFocus } from '@/hooks/useTourFocus'
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
const CONTEXT_PAD = 6
// 말풍선 크기(안내 문구와 [튜토리얼 끝내기]·[다음]이 들어가는 높이를 넉넉히 잡은 값)
const BUBBLE_SIZE = { width: 320, height: 230 }
const NUDGE_HINT_MS = 2600
// 막힌 곳을 눌러도 입력 중이던 칸의 포커스가 풀리지 않게 한다(풀리면 고치던 줄이 닫힌다)
const keepFocus = (event: React.MouseEvent) => event.preventDefault()

const CLICK_HINT = '지금은 표시된 곳을 눌러야 다음으로 넘어가요. [다음]을 누르면 대신 눌러 드려요.'
const MANUAL_HINT = '[다음]을 눌러 넘어가세요.'
const EDIT_HINT = '고친 글을 쓰고 Enter를 눌러 주세요. 고치지 않고 Enter만 눌러도 돼요.'
const NOT_READY_HINT = '아직 준비 중이에요. 잠시만 기다려 주세요.'

// 안내 모드: 회색 블러로 화면을 덮고 지금 누를 곳만 밝게 보여 준다. 밝은 곳은 막지 않아서 실제로 눌린다.
export default function TourOverlay({ step, atEnd, index, total, onSkip, onNext, onFinish, onCreate }: TourOverlayProps) {
  const { rect, lost } = useTargetRect(step?.target ?? null, step?.optional ? TOUR_OPTIONAL_MS : TOUR_LOST_MS)
  const skipOptional = Boolean(lost && step?.optional)
  const contextRects = useRects(step?.context ?? [])
  // 조건이 안 맞아 알리지 않고 건너뛴 단계 수. 단계 표시("9 / 16")에서 빼서, 번호가 갑자기 건너뛰어 보이지 않게 한다
  const [skipped, setSkipped] = useState(0)
  // [튜토리얼 끝내기]를 누르거나 Esc를 누르면 한 번 더 묻는다(안내 전체가 끝나는 버튼인데 "이 단계만 넘기는 것"으로 읽히기 쉬워서)
  const [confirmingEnd, setConfirmingEnd] = useState(false)
  // 눌러야 할 곳이 보일 때만 포커스를 가둔다. 안 보이면 안내가 화면을 막지 않으므로 가두지 않는다.
  useTourFocus(atEnd || Boolean(rect), index, step ? (step.advanceOn ?? step.target) : null)
  // 강조되지 않은 곳을 눌렀을 때: 강조 테두리를 한 번 흔들고 잠깐 안내한다. 아무 반응이 없으면 고장으로 느낀다.
  const [nudge, setNudge] = useState(0)
  const [hint, setHint] = useState<string | null>(null)

  useEffect(() => {
    if (nudge === 0) return
    const timer = window.setTimeout(() => setHint(null), NUDGE_HINT_MS)
    return () => window.clearTimeout(timer)
  }, [nudge])

  // 단계가 바뀌면 이전 안내는 지운다
  useEffect(() => {
    setNudge(0)
    setHint(null)
    setConfirmingEnd(false)
  }, [index])

  const showHint = (message: string) => {
    setHint(message)
    setNudge((count) => count + 1)
  }
  const onBlockedClick = () => showHint(step?.manual ? MANUAL_HINT : step?.advanceKey ? EDIT_HINT : CLICK_HINT)

  // Esc는 바로 끝내지 않고 끝낼지 묻는다. 다시 누르면 묻기를 닫는다.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setConfirmingEnd((value) => !value)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // [다음]: 설명만 하는 단계는 그대로 넘어가고, 눌러야 하는 단계는 앱이 대신 눌러 준다. 직접 고치는 단계는 안내만 한다.
  const onNextClick = () => {
    if (!step) return
    if (step.manual) return onNext()
    if (step.advanceKey) return showHint(EDIT_HINT)
    const element = document.querySelector<HTMLElement>(step.advanceOn ?? step.target)
    if (!element) return showHint(NOT_READY_HINT)
    if (element instanceof HTMLButtonElement && element.disabled) return showHint(NOT_READY_HINT)
    element.click()
  }

  // 조건이 안 맞아서 없는 단계는 알리지 않고 넘어간다
  useEffect(() => {
    if (skipOptional) {
      setSkipped((count) => count + 1)
      onNext()
    }
  }, [skipOptional])

  if (atEnd) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-on-surface/45 p-4 backdrop-blur-[3px]">
        <Bubble title={TOUR_END.title} body={TOUR_END.body} counter={`${total - skipped} / ${total - skipped}`}>
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
          <Button onClick={onSkip}>튜토리얼 끝내기</Button>
        </Bubble>
      </div>
    )
  }

  const hole = grow(rect, PAD)
  // 스크롤바를 뺀 화면 크기(말풍선이 스크롤바 위에 걸치지 않게)
  const view = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight }
  // 같이 보여 줄 곳이 누를 곳을 품고 있으면(고른 줄 카드 안의 [자료에서 보기]) 그 곳 전체를 밝게 하고, 누를 곳 둘레만 막는다.
  // 누를 곳과 걸쳐만 있는 곳은 뺀다(덮개로 막으면 누를 곳도 막힌다)
  const grown = contextRects.map((box) => grow(box, CONTEXT_PAD))
  const wrapping = grown.filter((box) => contains(box, hole))
  const separate = grown.filter((box) => !overlaps(box, hole))
  const holes = wrapping.length > 0 ? [...separate, ...wrapping] : [hole, ...separate]
  const strips = wrapping.flatMap((box) => splitAround(box, hole))
  // 눌러야 할 버튼이 아직 안 나왔으면(AI가 규칙 후보를 만드는 중) 기다리는 중이라고 알린다. 후보가 나오면 카드 높이가 바뀌어 다시 그려진다.
  const waiting = Boolean(step.advanceOn) && document.querySelector(step.advanceOn ?? '') === null
  const bubbleStyle = placeBubble({ target: hole, contexts: [...separate, ...wrapping], view, size: BUBBLE_SIZE })

  return (
    <>
      {/* 덮개 하나에 밝게 보일 곳을 뚫어 둔다. 뚫린 곳은 눌러도 덮개가 받지 않는다 */}
      <div
        aria-hidden
        data-tour-ui
        onClick={onBlockedClick}
        onMouseDown={keepFocus}
        className="fixed inset-0 z-[60] cursor-default bg-on-surface/45 backdrop-blur-[3px]"
        style={{ clipPath: overlayClipPath(holes, view) }}
      />
      {/* 같이 보여 주는 곳은 보기만 한다. 눌러도 앱이 반응하지 않고 안내만 흔든다 */}
      {separate.map((box, i) => (
        <div
          key={`c${i}`}
          aria-hidden
          data-tour-ui
          onClick={onBlockedClick}
          onMouseDown={keepFocus}
          className="fixed z-[60] cursor-default rounded-xl ring-2 ring-surface-lowest/80"
          style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
        />
      ))}
      {step.manual && (
        <div aria-hidden data-tour-ui onClick={onBlockedClick} onMouseDown={keepFocus} className="fixed z-[60] cursor-default" style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }} />
      )}
      {strips.map((box, i) => (
        <div
          key={`s${i}`}
          aria-hidden
          data-tour-ui
          onClick={onBlockedClick}
          onMouseDown={keepFocus}
          className="fixed z-[60] cursor-default"
          style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
        />
      ))}
      <div
        key={nudge}
        aria-hidden
        data-tour-ui
        data-nudged={nudge > 0 ? 'true' : undefined}
        className={`pointer-events-none fixed z-[61] rounded-xl ring-4 ring-primary-container ${nudge > 0 ? 'animate-tour-nudge' : ''}`}
        style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }}
      />
      <div
        data-tour-ui
        className="fixed z-[70] w-80"
        style={bubbleStyle}
      >
        <Bubble
          title={step.title}
          body={step.body}
          counter={`${index + 1 - skipped} / ${total - skipped}`}
          waiting={waiting}
          hint={hint ?? undefined}
        >
          {confirmingEnd ? (
            <div className="w-full space-y-2">
              <p className="text-body-sm">튜토리얼을 끝낼까요? 나중에 위쪽 [사용 안내]에서 다시 볼 수 있어요.</p>
              <div className="flex justify-end gap-2">
                <Button size="sm" onClick={() => setConfirmingEnd(false)}>
                  계속하기
                </Button>
                <Button size="sm" variant="primary" onClick={onSkip}>
                  끝내기
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setConfirmingEnd(true)}>
                튜토리얼 끝내기
              </Button>
              <Button size="sm" variant="primary" onClick={onNextClick}>
                다음
              </Button>
            </div>
          )}
        </Bubble>
      </div>
    </>
  )
}

type BubbleProps = { title: string; body: string; counter?: string; hint?: string; waiting?: boolean; children: React.ReactNode }

function Bubble({ title, body, counter, hint, waiting, children }: BubbleProps) {
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
      {waiting && (
        <p role="status" className="mt-2 flex items-center gap-2 text-body-sm font-semibold text-primary">
          <Spinner />
          만들고 있어요. 잠시만 기다려 주세요.
        </p>
      )}
      {hint && (
        <p role="status" className="mt-2 rounded-lg bg-flag-soft p-2 text-body-sm font-semibold text-flag-text">
          {hint}
        </p>
      )}
      <div className="mt-3 flex justify-end">{children}</div>
    </div>
  )
}
