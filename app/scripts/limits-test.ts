import { REQUEST_MAX_CHARS, RULES_BUDGET, RULE_MAX, ruleMaxLength, rulesChars } from '../src/lib/limits.ts'
import { buildRunPrompt } from '../src/lib/runPrompt.ts'

const rule = (n: number, length = 200) => ({ id: `r${n}`, text: '가'.repeat(length), source: 'setup' as const })
const many = (count: number, length = 200) => Array.from({ length: count }, (_, i) => rule(i + 1, length))
const answers = { what: 'x'.repeat(300), materials: 'y'.repeat(300), shape: 'z'.repeat(300) }
// 자료 8,000자: 문장 한 줄 약 48자, 문장마다 번호가 붙는다
const sentences = Array.from({ length: 160 }, () => '문'.repeat(48))

const CASES: { name: string; actual: unknown; expected: unknown }[] = [
  { name: '규칙 글자 수 합계', actual: rulesChars(many(3, 100)), expected: 300 },
  { name: '규칙이 적으면 한 규칙은 최대 200자(RULE_MAX)', actual: ruleMaxLength(many(2, 50)), expected: RULE_MAX },
  { name: '남은 예산이 200자보다 적으면 남은 만큼만', actual: ruleMaxLength(many(1, RULES_BUDGET - 120, )), expected: 120 },
  { name: '예산을 다 쓰면 0자', actual: ruleMaxLength(many(1, RULES_BUDGET)), expected: 0 },
  { name: '고치는 중인 규칙은 자기 글자 수를 빼고 계산한다', actual: ruleMaxLength([rule(1, 150), rule(2, RULES_BUDGET - 150)], 150), expected: 150 },
  { name: '규칙 15개(각 200자)는 예산 안', actual: rulesChars(many(15)) <= RULES_BUDGET, expected: true },
  { name: '규칙 16개(각 200자)는 예산을 넘는다', actual: rulesChars(many(16)) <= RULES_BUDGET, expected: false },
  { name: '예산을 다 쓴 규칙 + 자료 8,000자 요청이 요청 한도 안', actual: buildRunPrompt(answers, many(15), sentences).length <= REQUEST_MAX_CHARS, expected: true },
  { name: '서버 한도(16,000)와 같은 값을 쓴다', actual: REQUEST_MAX_CHARS, expected: 16000 },
]

let failed = 0
for (const { name, actual, expected } of CASES) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected)
  if (!pass) failed += 1
  console.log(`${pass ? '통과' : '실패'} ${name}${pass ? '' : `: 기대 ${JSON.stringify(expected)}, 실제 ${JSON.stringify(actual)}`}`)
}
console.log(failed === 0 ? `\n${CASES.length}개 모두 통과` : `\n${failed}개 실패`)
process.exit(failed === 0 ? 0 : 1)
