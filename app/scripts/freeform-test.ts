import { checkLine } from '../src/lib/evidence.ts'
import { withOpinion } from '../src/lib/lineEdit.ts'
import { buildRunPrompt } from '../src/lib/runPrompt.ts'
import type { Rule } from '../src/types/task.ts'

const answers = { what: 'TIL을 쓴다', materials: '배운 내용 메모', shape: '짧은 글' }
const rules: Rule[] = [
  { id: 'r1', text: '배운 내용을 쓴다', source: 'setup' },
  { id: 'r2', text: '느낀 점 한 줄을 쓴다', source: 'setup', freeform: true },
]
const sentences = ['오늘은 리액트 상태 관리를 공부했다.', '컴포넌트를 3개 만들었다.']

const opinion = '꾸준히 해야겠다고 느꼈다.'
const check = (text: string, ruleIds: string[]) => withOpinion({ text, ruleIds }, checkLine(text, [], sentences), rules)
const withFree = buildRunPrompt(answers, rules, sentences)
const withoutFree = buildRunPrompt(answers, [rules[0]], sentences)

const CASES: { name: string; actual: unknown; expected: unknown }[] = [
  { name: '자료 밖 허용 규칙에 표시가 붙는다', actual: withFree.includes('r2. 느낀 점 한 줄을 쓴다 [자료 밖 허용]'), expected: true },
  { name: '다른 규칙에는 표시가 안 붙는다', actual: withFree.includes('r1. 배운 내용을 쓴다 [자료 밖 허용]'), expected: false },
  { name: '자료 밖 허용 규칙이 있으면 예외 지시가 들어간다', actual: withFree.includes('[자료 밖 허용]이 붙은 규칙을 지키는 줄만'), expected: true },
  { name: '자료 밖 허용 규칙이 없으면 요청이 그대로다', actual: withoutFree.includes('자료 밖 허용'), expected: false },
  { name: '근거가 약한 줄이 허용 규칙을 지켰으면 "내 생각 줄"', actual: check(opinion, ['r2']).status, expected: 'opinion' },
  { name: '같은 줄이라도 허용 규칙이 아니면 "근거 확인 필요"', actual: check(opinion, ['r1']).status, expected: 'needs_check' },
  { name: '허용 규칙 줄이라도 자료에 없는 숫자는 "자료에 없음"', actual: check('3시간 동안 집중해서 뿌듯했다.', ['r2']).status, expected: 'not_in_input' },
  { name: '허용 규칙 줄이라도 AI가 [확인 필요]라고 쓴 줄은 그대로', actual: check('느낀 점은 [확인 필요]', ['r2']).status, expected: 'needs_check' },
  { name: '허용 규칙을 쓰지 않은 줄은 건드리지 않는다', actual: check('컴포넌트를 3개 만들었다.', []).status, expected: 'needs_check' },
]

let failed = 0
for (const { name, actual, expected } of CASES) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected)
  if (!pass) failed += 1
  console.log(`${pass ? '통과' : '실패'} ${name}${pass ? '' : `: 기대 ${JSON.stringify(expected)}, 실제 ${JSON.stringify(actual)}`}`)
}
console.log(failed === 0 ? `\n${CASES.length}개 모두 통과` : `\n${failed}개 실패`)
process.exit(failed === 0 ? 0 : 1)
