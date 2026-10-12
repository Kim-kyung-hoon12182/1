import { useEffect, useRef, useState } from 'react'
import { parseHash, toHash, type View } from '@/lib/route'

// 화면 전환을 브라우저 기록에 남긴다. replace는 "만들고 바로 실행"처럼 이전 화면으로 돌아올 필요가 없을 때 쓴다.
// canLeave가 false를 주면(복사하지 않은 결과가 있고 사용자가 남기를 고름) 화면을 옮기지 않는다.
export function useRoute(canLeave: () => boolean = () => true) {
  const [view, setView] = useState<View>(() => parseHash(window.location.hash))
  const hashRef = useRef(window.location.hash)
  const canLeaveRef = useRef(canLeave)
  canLeaveRef.current = canLeave

  useEffect(() => {
    const sync = () => {
      const next = window.location.hash
      if (next === hashRef.current) return
      // 뒤로가기로 이미 주소가 바뀐 뒤라서, 남기를 고르면 주소를 원래대로 돌려놓는다
      if (!canLeaveRef.current()) {
        window.history.pushState(null, '', hashRef.current || '#/')
        return
      }
      hashRef.current = next
      setView(parseHash(next))
    }
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  function go(next: View, options: { replace?: boolean } = {}) {
    const hash = toHash(next)
    const moving = hash !== window.location.hash && !(hash === '#/' && window.location.hash === '')
    if (moving && !canLeaveRef.current()) return
    if (moving) window.history[options.replace ? 'replaceState' : 'pushState'](null, '', hash)
    hashRef.current = window.location.hash
    setView(next)
  }

  return [view, go] as const
}
