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
    let revealed = false
    const startedAt = performance.now()

    const tick = () => {
      const element = document.querySelector(selector)
      if (element) {
        // 처음 보일 때 화면 가운데로 가져온다
        if (!revealed) {
          revealed = true
          element.scrollIntoView({ block: 'center', behavior: 'smooth' })
        }
        const box = element.getBoundingClientRect()
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
