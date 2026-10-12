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
        setRect((prev) => (same(prev, next) ? prev : next))
        setLost(false)
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
