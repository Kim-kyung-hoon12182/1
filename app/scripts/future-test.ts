import { checkLine, FUTURE_WORDS, hasUnbackedFuture } from '../src/lib/evidence.ts'

const blogSource = ['이 글은 폴링 주기를 10분에서 10초로 줄인 과정을 기록한 글입니다.', '자동승인 처리가 시작되기까지 최대 12분 59초가 걸렸습니다.']
const planSource = ['다음 주에 배포할 예정입니다.', '결제 화면 개선 작업을 완료했습니다.']

const CASES: { name: string; actual: unknown; expected: unknown }[] = [
  { name: '끝낸 일을 "예정"으로 바꿔 쓰면 확인할 곳(이번 사례)', actual: checkLine('폴링 주기를 10분에서 10초로 줄이는 작업을 진행할 예정입니다.', [1], blogSource).status, expected: 'needs_check' },
  { name: '근거 문장에도 "예정"이 있으면 통과', actual: checkLine('다음 주에 배포할 예정입니다.', [1], planSource).status, expected: 'has_source' },
  { name: '"계획"을 근거에 없이 쓰면 확인할 곳', actual: checkLine('결제 화면 개선 계획을 세웠습니다.', [2], planSource).status, expected: 'needs_check' },
  { name: '"하겠습니다"처럼 약속하는 말도 확인할 곳', actual: checkLine('결제 화면 개선 작업을 완료하겠습니다.', [2], planSource).status, expected: 'needs_check' },
  { name: '앞으로의 말이 없으면 이전과 같다', actual: checkLine('결제 화면 개선 작업을 완료했습니다.', [2], planSource).status, expected: 'has_source' },
  { name: '직접: 줄에만 있으면 true', actual: hasUnbackedFuture('작업을 진행할 예정입니다', '작업을 끝냈습니다'), expected: true },
  { name: '직접: 근거에도 있으면 false', actual: hasUnbackedFuture('작업을 진행할 예정입니다', '다음 달 진행 예정'), expected: false },
  { name: '직접: 앞으로의 말이 없으면 false', actual: hasUnbackedFuture('작업을 끝냈습니다', '작업을 끝냈습니다'), expected: false },
  { name: '자료에 없는 숫자는 시제와 상관없이 먼저 걸린다', actual: checkLine('매출 9억 원을 달성할 예정입니다.', [2], planSource).status, expected: 'not_in_input' },
  { name: '말 목록에 예정과 계획이 들어 있다', actual: FUTURE_WORDS.includes('예정') && FUTURE_WORDS.includes('계획'), expected: true },
]

let failed = 0
for (const { name, actual, expected } of CASES) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected)
  if (!pass) failed += 1
  console.log(`${pass ? '통과' : '실패'} ${name}${pass ? '' : `: 기대 ${JSON.stringify(expected)}, 실제 ${JSON.stringify(actual)}`}`)
}
console.log(failed === 0 ? `\n${CASES.length}개 모두 통과` : `\n${failed}개 실패`)
process.exit(failed === 0 ? 0 : 1)
