export type TourScreen = 'tasks' | 'run' | 'history'

export type TourStep = {
  /** 화면에서 이 요소를 밝게 보여 준다 */
  target: string
  /** 이 요소 안을 누르면 다음 단계로 넘어간다. 없으면 target을 누를 때 넘어간다 */
  advanceOn?: string
  /** 누를 곳과 함께 밝게 보여 주는 곳(눌러도 아무 일 없음). 앞 단계 동작의 결과(넣은 자료, 나온 결과, 옮겨 간 자료 칸, 기록 카드)를 보여 주려는 것. 누를 곳과 겹치면 안 된다 */
  context?: string[]
  /** 지정한 키를 target 안에서 누르면 다음 단계로 넘어간다(입력칸처럼 누를 곳이 없는 단계) */
  advanceKey?: string
  /** 누를 곳이 없는 설명 단계. 말풍선의 [다음]을 눌러야 넘어가고, 밝게 보이는 곳은 눌러도 반응하지 않는다 */
  manual?: boolean
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
    body: '[예시로 체험해 보기]를 누르면 체험용 작업이 열려요. 체험용이라 실제 작업에는 영향이 없어요. [다음]을 누르면 앱이 대신 눌러 줘요.',
  },
  {
    target: '[data-tour="load-sample"]',
    screen: 'run',
    title: '자료를 넣어요',
    body: '글의 바탕이 될 자료가 필요해요. [다음]을 누르면 앱이 [예시 자료 넣기]를 대신 눌러 줘요.',
  },
  {
    target: '[data-tour="run-button"]',
    context: ['[data-tour="material-input"]'],
    screen: 'run',
    title: '실행해요',
    body: '위에 넣은 자료와 규칙에 맞춰 글을 써 줘요. 어떤 자료가 들어갔는지 보고 [다음]을 누르면 앱이 [실행하기]를 대신 눌러 줘요.',
  },
  {
    target: '[data-tour="goto-first"]',
    context: ['[data-tour="result-list"]'],
    screen: 'run',
    title: '확인할 곳으로 가요',
    body: 'AI가 쓴 글이 다 맞다는 보장은 없어요. [다음]을 누르면 확인이 필요한 줄로 이동해요.',
  },
  {
    target: 'main li[aria-current="true"] [data-tour="source-link"]',
    // 왼쪽 자료는 일부러 흐리게 둔다. [자료에서 보기]를 눌러야 자료가 밝아지고 참고한 문장이 표시되는 것을 보여 주려는 것
    context: ['main li[aria-current="true"]'],
    screen: 'run',
    title: '참고한 자료를 확인해요',
    body: '"자료에 없음"은 자료에서 찾지 못한 값이라는 뜻이에요. [다음]을 누르면 [자료에서 보기]로 AI가 참고한 문장을 보여 줘요.',
  },
  {
    target: 'main li[aria-current="true"] [data-tour="edit-line"]',
    context: ['[data-tour="source-panel"]', 'main li[aria-current="true"]'],
    screen: 'run',
    title: '자료와 다르면 고쳐요',
    body: '자료에는 "9천만 원"만 있고 목표 이야기는 없어요. 이 줄을 자료에 맞게 고쳐 볼게요. [다음]을 누르면 [고치기]가 열려요.',
  },
  {
    target: 'main li[aria-current="true"] [data-tour="edit-field"]',
    advanceKey: 'Enter',
    context: ['[data-tour="source-panel"]', 'main li[aria-current="true"]'],
    screen: 'run',
    title: '자료에 맞게 고쳐요',
    body: '예: "[매출] 9천만 원 / 목표 대비 달성 여부: 자료에 없음"처럼 자료에 맞게 고쳐요. [다음]을 누르면 이 글로 고쳐 줘요.',
  },
  {
    target: '[data-tour="copy-finish"]',
    context: ['[data-tour="source-panel"]', 'main li[aria-current="true"]'],
    screen: 'run',
    title: '복사할 글을 열어요',
    body: '고친 내용을 반영한 글이 어떤 모양인지 먼저 보여 줘요. [다음]을 누르면 열려요.',
  },
  {
    target: '[data-tour="copy-confirm"]',
    context: ['[data-tour="copy-preview"]'],
    screen: 'run',
    title: '이대로 복사해요',
    body: '복사될 글이에요. 고친 글은 들어가고 삭제한 줄은 빠져요. [다음]을 누르면 복사되고, 고쳤는지가 기록돼요.',
  },
  {
    target: '[data-tour="finished"]',
    manual: true,
    screen: 'run',
    title: '기록했어요',
    body: '방금 결과와 고친 곳이 이 작업의 기록으로 남았어요. 고쳤는지가 기록되고, 이 기록이 쌓이면 맡겨볼 만한 때를 알려 줘요. 다 봤으면 [다음]을 눌러 주세요.',
  },
  {
    target: '[data-tour="rule-candidate"]',
    advanceOn: '[data-tour="rule-add"]',
    context: ['[data-tour="finished"]'],
    screen: 'run',
    optional: true,
    title: '고친 내용이 규칙으로 남아요',
    body: '고친 내용에서 규칙 후보가 나와요. 고쳐 쓸 수 있고, 추가한 규칙만 다음 실행부터 지켜서 글을 써요. [다음]을 누르면 앱이 [규칙 추가]를 대신 눌러 줘요.',
  },
  {
    target: '[data-tour="rule-added"]',
    manual: true,
    screen: 'run',
    optional: true,
    title: '규칙이 남았어요',
    body: '방금 고친 내용이 이 작업의 규칙으로 저장됐어요. 다음 실행부터 AI에게 이 규칙을 함께 보내요. 규칙은 [내 작업]에서 고치거나 지울 수 있어요. 다 봤으면 [다음]을 눌러 주세요.',
  },
  {
    target: '[data-tour="handoff"]',
    advanceOn: '[data-tour="handoff-toggle"]',
    context: ['[data-tour="finished"]'],
    screen: 'run',
    optional: true,
    title: '맡겨볼 만한 때예요',
    body: '안 고친 기록이 3번 쌓이면 이렇게 알려 줘요. 체험용이라 앞의 두 번은 미리 채워 뒀어요. 결과가 맞다는 뜻은 아니에요. [다음]을 누르면 [지시문 보기]를 열어 줘요.',
  },
  {
    target: '[data-tour="nav-history"]',
    screen: 'run',
    title: '기록은 실행 이력에 쌓여요',
    body: '실행할 때마다 고쳤는지, 복사했는지가 기록돼요. [다음]을 누르면 위쪽 [실행 이력]으로 가요.',
  },
  {
    target: '[data-tour="run-detail"]',
    context: ['main ul > li:first-child'],
    screen: 'history',
    title: '지난 결과를 다시 봐요',
    body: '방금 한 3회차가 맨 위에 있어요. [다음]을 누르면 [결과 보기]로 복사한 결과와 고친 곳을 펼쳐 줘요. 1·2회차는 체험용으로 미리 채운 기록이라 결과가 없어요.',
  },
  {
    target: '[data-tour="run-result"]',
    manual: true,
    screen: 'history',
    title: '복사한 결과와 고친 곳이 남아요',
    body: '복사한 글이 이렇게 기록돼요. 글을 고쳤다면 고친 곳(전 → 후)도 아래에 함께 남아요. 다 봤으면 [다음]을 눌러 주세요.',
  },
]

// 7단계에서 [다음]을 누르면 앱이 이 글로 고쳐 준다(직접 쓴 글이 있으면 그 글을 쓴다)
export const TOUR_EDIT_TEXT = '[매출] 9천만 원 / 목표 대비 달성 여부: 자료에 없음'

export const TOUR_END = {
  title: '끝났어요',
  body: '안 고친 기록이 3번 쌓이면 "맡겨볼 만한 때예요"라고 알려 줘요. 이제 내 작업을 만들어 볼까요? 안내는 위쪽 [사용 안내]에서 다시 볼 수 있어요.',
}

// 조건이 맞을 때만 나오는 단계의 요소를 기다리는 시간. 요소는 있으면 바로 나오므로 짧게 둔다(기다리는 동안 화면에 안내가 없어서, 길면 안내가 끊긴 것처럼 보인다)
export const TOUR_OPTIONAL_MS = 250

// 다음 단계의 요소가 이 시간 넘게 안 보이면 안내를 끝낸다
export const TOUR_LOST_MS = 3000
