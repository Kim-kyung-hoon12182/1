export type TourScreen = 'tasks' | 'run'

export type TourStep = {
  /** 화면에서 이 요소를 밝게 보여 준다 */
  target: string
  /** 이 요소 안을 누르면 다음 단계로 넘어간다. 없으면 target을 누를 때 넘어간다 */
  advanceOn?: string
  /** 조건이 맞을 때만 나오는 단계. 요소가 안 보이면 알리지 않고 다음으로 넘어간다 */
  optional?: boolean
  screen: TourScreen
  title: string
  body: string
}

// 안내 모드 (정의서 S0). 체험용 작업으로만 돌아서 AI 키가 없어도 된다.
export const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="try-demo"]',
    screen: 'tasks',
    title: '예시로 먼저 해 볼게요',
    body: '[예시로 체험해 보기]를 눌러 보세요. 체험용 작업이라 실제 작업에는 영향이 없어요.',
  },
  {
    target: '[data-tour="load-sample"]',
    screen: 'run',
    title: '자료를 넣어요',
    body: '글의 바탕이 될 자료가 필요해요. [예시 자료 넣기]를 눌러 보세요.',
  },
  {
    target: '[data-tour="run-button"]',
    screen: 'run',
    title: '실행해요',
    body: '규칙에 맞춰 글을 써 줘요. [실행하기]를 눌러 보세요.',
  },
  {
    target: '[data-tour="goto-first"]',
    screen: 'run',
    title: '확인할 곳으로 가요',
    body: 'AI가 쓴 글이 다 맞다는 보장은 없어요. 확인이 필요한 줄로 가 볼게요. 눌러 보세요.',
  },
  {
    target: 'main li[aria-current="true"] [data-tour="source-link"]',
    screen: 'run',
    title: '참고한 자료를 확인해요',
    body: '"자료에 없음"은 자료에서 찾지 못한 값이라는 뜻이에요. [자료에서 보기]를 눌러 AI가 참고한 문장을 확인해 보세요.',
  },
  {
    target: '[data-tour="copy-finish"]',
    screen: 'run',
    title: '복사하고 끝내요',
    body: '다 봤으면 복사해요. 고쳤는지가 기록돼요. 눌러 보세요.',
  },
  {
    target: '[data-tour="handoff"]',
    advanceOn: '[data-tour="handoff-toggle"]',
    screen: 'run',
    optional: true,
    title: '맡겨볼 만한 때예요',
    body: '체험용 작업은 앞의 1·2회차를 안 고친 기록으로 미리 채워 뒀어요. 안 고친 기록이 3번 쌓이면 이렇게 알려 줘요. 결과가 맞다는 뜻은 아니에요. [지시문 보기]를 눌러 보세요.',
  },
]

export const TOUR_END = {
  title: '끝났어요',
  body: '안 고친 기록이 3번 쌓이면 "맡겨볼 만한 때예요"라고 알려 줘요. 안내는 위쪽 [사용 안내]에서 다시 볼 수 있어요.',
}

// 조건이 맞을 때만 나오는 단계의 요소를 기다리는 시간
export const TOUR_OPTIONAL_MS = 1500

// 다음 단계의 요소가 이 시간 넘게 안 보이면 안내를 끝낸다
export const TOUR_LOST_MS = 3000
