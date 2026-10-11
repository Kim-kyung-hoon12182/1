import { useEffect, useState } from 'react'
import { parseHash, toHash, type View } from '@/lib/route'

// 화면 전환을 브라우저 기록에 남긴다. replace는 "만들고 바로 실행"처럼 이전 화면으로 돌아올 필요가 없을 때 쓴다.
export function useRoute() {
  const [view, setView] = useState<View>(() => parseHash(window.location.hash))

  useEffect(() => {
    const sync = () => setView(parseHash(window.location.hash))
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  function go(next: View, options: { replace?: boolean } = {}) {
    const hash = toHash(next)
    if (hash !== window.location.hash && !(hash === '#/' && window.location.hash === '')) {
      window.history[options.replace ? 'replaceState' : 'pushState'](null, '', hash)
    }
    setView(next)
  }

  return [view, go] as const
}
