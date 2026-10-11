import { useEffect } from 'react'

// 화면이나 단계가 바뀌면 맨 위에서 시작한다. 이전 화면의 스크롤 위치가 남지 않게 한다.
export function useScrollToTop(...keys: unknown[]) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, keys)
}
