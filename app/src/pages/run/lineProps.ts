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

// 카드가 나타나는 순서. 처음 12개만 0.07초씩 늦추고 나머지는 한꺼번에 보여 줘서 줄이 많아도 기다리지 않게 한다.
export const revealDelay = (index: number) => Math.min(index, 11) * 70
