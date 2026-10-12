import { useEffect } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
const BUBBLE = '[role="dialog"][aria-label="사용 안내"]'

const visible = (element: HTMLElement) => element.getClientRects().length > 0

// 안내 중에는 키보드도 눌러야 할 곳과 말풍선 안에서만 돈다. 흐려진 곳으로 들어가 엉뚱한 화면으로 가지 않게 한다.
// 안내가 시작되거나 단계가 바뀌면 포커스를 말풍선으로 옮겨서, 화면 읽기 프로그램이 안내를 먼저 읽는다.
export function useTourFocus(active: boolean, stepKey: number, pressSelector: string | null) {
  useEffect(() => {
    if (!active) return
    const bubble = () => document.querySelector<HTMLElement>(BUBBLE)
    const allowed = () => {
      const press = pressSelector ? document.querySelector<HTMLElement>(pressSelector) : null
      const inPress = press ? (press.matches(FOCUSABLE) ? [press] : [...press.querySelectorAll<HTMLElement>(FOCUSABLE)]) : []
      const inBubble = [...(bubble()?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])]
      return [...inPress, ...inBubble].filter(visible)
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const items = allowed()
      if (items.length === 0) return
      const at = items.indexOf(document.activeElement as HTMLElement)
      const nextIndex = at === -1 ? (event.shiftKey ? items.length - 1 : 0) : (at + (event.shiftKey ? -1 : 1) + items.length) % items.length
      event.preventDefault()
      items[nextIndex].focus()
    }

    const timer = window.setTimeout(() => {
      // 입력칸이 눌러야 할 곳이면 바로 쓸 수 있게 거기에 두고, 아니면 말풍선에 둔다
      const press = pressSelector ? document.querySelector<HTMLElement>(pressSelector) : null
      if (press?.matches('input, textarea')) {
        press.focus({ preventScroll: true })
        return
      }
      const target = bubble()
      target?.setAttribute('tabindex', '-1')
      target?.focus({ preventScroll: true })
    }, 0)
    document.addEventListener('keydown', onKey, true)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('keydown', onKey, true)
    }
  }, [active, stepKey, pressSelector])
}
