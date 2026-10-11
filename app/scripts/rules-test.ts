import { describeLastRun } from '../src/lib/format.ts'
import { buildRulePrompt, parseRules, toRules } from '../src/lib/rules.ts'

const DAY = 24 * 60 * 60 * 1000
const NOW = Date.parse('2026-10-11T12:00:00Z')

const taskWith = (runs: { createdAt: string }[]) => ({ runs }) as unknown as Parameters<typeof describeLastRun>[0]
const at = (daysAgo: number) => ({ createdAt: new Date(NOW - daysAgo * DAY).toISOString() })

const CASES: { name: string; actual: unknown; expected: unknown }[] = [
  { name: '규칙 응답: 문자열 배열', actual: parseRules('["a", "b"]'), expected: ['a', 'b'] },
  { name: '규칙 응답: 코드 블록으로 감싼 JSON', actual: parseRules('```json\n["a", "b"]\n```'), expected: ['a', 'b'] },
  { name: '규칙 응답: rules 키가 있는 객체', actual: parseRules('{"rules": ["a"]}'), expected: ['a'] },
  { name: '규칙 응답: 빈 글자와 문자열이 아닌 값은 버린다', actual: parseRules('["a", "  ", 3, null, " b "]'), expected: ['a', 'b'] },
  { name: '규칙 응답: 8개를 넘으면 앞의 8개만', actual: parseRules(JSON.stringify(Array.from({ length: 10 }, (_, i) => `r${i}`))).length, expected: 8 },
  { name: '규칙 응답: JSON이 아니면 빈 배열', actual: parseRules('규칙을 만들었어요'), expected: [] },
  { name: '규칙 응답: 빈 글', actual: parseRules(''), expected: [] },
  { name: '규칙 번호는 r1부터', actual: toRules(['a', 'b']).map((rule) => rule.id), expected: ['r1', 'r2'] },
  {
    name: '프롬프트에 답변과 "검토 기준이 아니다" 안내가 들어간다',
    actual: (() => {
      const prompt = buildRulePrompt({ what: '주간보고', materials: '메모', shape: '500자', example: '' })
      return prompt.includes('[무슨 일] 주간보고') && prompt.includes('검토하는 기준이 아닙니다') && !prompt.includes('[예전에')
    })(),
    expected: true,
  },
  { name: '프롬프트: 예전 결과가 있으면 포함', actual: buildRulePrompt({ what: 'a', materials: 'b', shape: 'c', example: 'd' }).includes('[예전에 잘 나온 결과] d'), expected: true },
  { name: '최근 실행: 기록 없음', actual: describeLastRun(taskWith([]), NOW), expected: '아직 실행 전이에요' },
  { name: '최근 실행: 오늘', actual: describeLastRun(taskWith([at(0)]), NOW), expected: '최근 실행: 오늘' },
  { name: '최근 실행: 어제', actual: describeLastRun(taskWith([at(1)]), NOW), expected: '최근 실행: 어제' },
  { name: '최근 실행: 마지막 기록을 기준으로 N일 전', actual: describeLastRun(taskWith([at(10), at(3)]), NOW), expected: '최근 실행: 3일 전' },
]

let failed = 0
for (const testCase of CASES) {
  const pass = JSON.stringify(testCase.actual) === JSON.stringify(testCase.expected)
  if (!pass) failed++
  console.log(`${pass ? '통과' : '실패'} ${testCase.name}${pass ? '' : `: 기대 ${JSON.stringify(testCase.expected)}, 실제 ${JSON.stringify(testCase.actual)}`}`)
}
process.exit(failed ? 1 : 0)
