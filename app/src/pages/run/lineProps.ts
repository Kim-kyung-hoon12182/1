import type { RunSession } from '@/hooks/useRunSession'

// 결과 줄 카드(작은 모양, 펼친 모양)가 함께 쓰는 선택 동작: 클릭, 키보드, 이동용 위치 등록
export function lineProps(session: RunSession, index: number, isSelected: boolean) {
  return {
    ref: (element: HTMLElement | null) => {
      session.cardRefs.current[index] = element
    },
    tabIndex: 0,
    'aria-current': isSelected,
    onClick: () => session.select(index),
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault()
        session.select(index)
      }
    },
  }
}
