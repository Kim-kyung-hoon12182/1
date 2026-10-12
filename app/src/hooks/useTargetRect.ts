import { useEffect, useState } from 'react'

type Rect = { top: number; left: number; width: number; height: number }

const same = (a: Rect | null, b: Rect | null) =>
  a === b || (a !== null && b !== null && a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height)

// 선택자에 맞는 요소의 화면 위치를 따라간다. 요소가 아직 없으면 null이고, lostMs가 지나도 없으면 lost가 true가 된다.
export function useTargetRect(selector: string | null, lostMs: number) {
  const [rect, setRect] = useState<Rect | null>(null)
  const [lost, setLost] = useState(false)

  useEffect(() => {
    if (!selector) return
    let frame = 0
    let revealedAt = 0
    let retries = 0
    let movedAt = performance.now()
    let last: Rect | null = null
    let recenteredAt = 0
    const startedAt = performance.now()
    const reveal = (element: Element, behavior: ScrollBehavior) => {
      const tall = element.getBoundingClientRect().height > window.innerHeight * 0.7
      element.scrollIntoView({ block: tall ? 'start' : 'center', behavior })
    }

    const tick = () => {
      const element = document.querySelector(selector)
      if (element) {
        // 처음 보일 때 화면 가운데로 가져온다
        if (revealedAt === 0) {
          revealedAt = performance.now()
          reveal(element, 'smooth')
        }
        const box = element.getBoundingClientRect()
        // 부드러운 이동이 화면이 바뀌는 중에 끊겨서 요소가 화면 밖에 남으면 바로 이동한다
        const offscreen = box.bottom < 0 || box.top > window.innerHeight
        if (offscreen && retries < 3 && performance.now() - revealedAt > 700 * (retries + 1)) {
          retries += 1
          reveal(element, 'instant')
        }
        const next = { top: box.top, left: box.left, width: box.width, height: box.height }
        if (!same(last, next)) movedAt = performance.now()
        last = next
        setRect((prev) => (same(prev, next) ? prev : next))
        setLost(false)
        // 사용자가 스크롤해서 눌러야 할 곳이 위에 고정된 영역 밑에 가려지면, 멈춘 뒤 다시 가운데로 가져온다
        const now = performance.now()
        if (now - movedAt > 500 && now - recenteredAt > 1500 && box.top >= 0 && box.bottom <= window.innerHeight && box.width > 0) {
          const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)
          if (hit && !element.contains(hit) && !hit.closest('[data-tour-ui]')) {
            recenteredAt = now
            reveal(element, 'smooth')
          }
        }
      } else {
        setRect(null)
        if (performance.now() - startedAt > lostMs) setLost(true)
      }
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => {
      cancelAnimationFrame(frame)
      setRect(null)
      setLost(false)
    }
  }, [selector, lostMs])

  return { rect, lost }
}

const sameBoxes = (a: Rect[], b: Rect[]) => a.length === b.length && a.every((rect, i) => same(rect, b[i]))

// 선택자 여러 개의 화면 위치를 따라간다. 보이지 않는 것은 뺀다.
export function useRects(selectors: string[]) {
  const [rects, setRects] = useState<Rect[]>([])
  const key = selectors.join('|')

  useEffect(() => {
    if (selectors.length === 0) {
      setRects([])
      return
    }
    let frame = 0
    const tick = () => {
      const next = selectors.flatMap((selector) => {
        const box = document.querySelector(selector)?.getBoundingClientRect()
        return box && box.width > 0 && box.height > 0 ? [{ top: box.top, left: box.left, width: box.width, height: box.height }] : []
      })
      setRects((prev) => (sameBoxes(prev, next) ? prev : next))
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => {
      cancelAnimationFrame(frame)
      setRects([])
    }
  }, [key])

  return rects
}
