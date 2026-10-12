import { buildRuleCandidatePrompt, editedPairs, hasRule, parseRuleCandidate } from '../src/lib/rules.ts'

const rule = (id: string, text: string) => ({ id, text, source: 'setup' as const })
const lines = [
  { text: '가 줄', editedText: '가 줄 고침' },
  { text: '나 줄' },
  { text: '다 줄', editedText: '다 줄 고침' },
]
const pairs = editedPairs(lines)
const prompt = buildRuleCandidatePrompt(pairs, [rule('r1', '존댓말로 쓴다'), rule('r2', '  ')])

const CASES: { name: string; actual: unknown; expected: unknown }[] = [
  { name: '고친 줄만 고치기 전·후로 모은다', actual: pairs, expected: [{ before: '가 줄', after: '가 줄 고침' }, { before: '다 줄', after: '다 줄 고침' }] },
  { name: '고친 줄이 없으면 빈 배열', actual: editedPairs([{ text: 'a' }]), expected: [] },
  { name: '고친 줄이 많아도 5개까지만', actual: editedPairs(Array.from({ length: 9 }, (_, i) => ({ text: `${i}`, editedText: `${i}!` }))).length, expected: 5 },
  { name: '프롬프트에 기존 규칙이 들어가고 빈 규칙은 뺀다', actual: prompt.includes('- 존댓말로 쓴다') && !prompt.includes('-   '), expected: true },
  { name: '프롬프트에 고치기 전·후가 번호로 들어간다', actual: prompt.includes('1. 고치기 전: 가 줄') && prompt.includes('   고친 후: 다 줄 고침'), expected: true },
  { name: '규칙이 없으면 (없음)', actual: buildRuleCandidatePrompt(pairs, []).includes('(없음)'), expected: true },
  { name: '자료 정정과 기존 규칙과의 겹침은 빈 문자열로 달라고 한다', actual: prompt.includes('바로잡은 것뿐') && prompt.includes('뜻이 같거나') && prompt.includes('빈 문자열'), expected: true },
  { name: '표현이 달라도 뜻이 겹치면 겹침으로 본다고 알려 준다', actual: prompt.includes('표현이 다르거나') && prompt.includes('겹치는 것으로'), expected: true },
  { name: '"검토 기준"이라는 말을 쓰지 않는다(아니라고 밝히는 말은 제외)', actual: prompt.replace('검토하는 기준이 아닙니다', '').includes('검토 기준'), expected: false },
  { name: '후보 응답: rule 키', actual: parseRuleCandidate('{"rule": " 금액은 만 원 단위로 쓴다 "}'), expected: '금액은 만 원 단위로 쓴다' },
  { name: '후보 응답: 코드 블록으로 감싼 JSON', actual: parseRuleCandidate('```json\n{"rule":"a"}\n```'), expected: 'a' },
  { name: '후보 응답: JSON 문자열만', actual: parseRuleCandidate('"b"'), expected: 'b' },
  { name: '후보 응답: 빈 문자열은 빈 글(카드를 안 띄움)', actual: parseRuleCandidate('{"rule": ""}'), expected: '' },
  { name: '후보 응답: 읽을 수 없으면 null', actual: parseRuleCandidate('규칙은 이래요'), expected: null },
  { name: '후보 응답: rule이 문자열이 아니면 null', actual: parseRuleCandidate('{"rule": 3}'), expected: null },
  { name: '같은 규칙 판정: 공백·문장부호는 무시', actual: hasRule([rule('r1', '존댓말로 쓴다.')], ' 존댓말로  쓴다 '), expected: true },
  { name: '같은 규칙 판정: 다른 말은 아니다', actual: hasRule([rule('r1', '존댓말로 쓴다')], '반말로 쓴다'), expected: false },
  { name: '같은 규칙 판정: 빈 글은 아니다', actual: hasRule([rule('r1', '')], ''), expected: false },
]

let failed = 0
for (const { name, actual, expected } of CASES) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected)
  if (!pass) failed += 1
  console.log(`${pass ? '통과' : '실패'} ${name}${pass ? '' : `: 기대 ${JSON.stringify(expected)}, 실제 ${JSON.stringify(actual)}`}`)
}
console.log(failed === 0 ? `\n${CASES.length}개 모두 통과` : `\n${failed}개 실패`)
process.exit(failed === 0 ? 0 : 1)
