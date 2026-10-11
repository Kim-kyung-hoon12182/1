import { buildRunPrompt, parseRunResponse } from '../src/lib/runPrompt.ts'

const rules = [
  { id: 'r1', text: '존댓말로 쓴다', source: 'setup' as const },
  { id: 'r2', text: '  ', source: 'setup' as const },
  { id: 'r3', text: '숫자는 메모에 있는 것만 쓴다', source: 'setup' as const },
]
const answers = { what: '주간보고를 써요', materials: '업무 메모', shape: '500자 안팎' }
const sentences = ['가입자 120명이다.', '결제 오류 2건을 고쳤다.']
const prompt = buildRunPrompt(answers, rules, sentences)

const ok = JSON.stringify({
  lines: [
    { text: ' 가입자가 120명입니다. ', sourceIds: [1, 1, 9, 0, 1.5, '2'], ruleIds: ['r1', 'r9', 'r1'] },
    { text: '', sourceIds: [1], ruleIds: [] },
    { text: '결제 오류를 고쳤습니다.', sourceIds: [2] },
    { sourceIds: [1] },
  ],
})

const parsed = parseRunResponse(ok, 2, rules)
const plain = parseRunResponse('- 첫 줄입니다.\n\n2. 둘째 줄입니다.', 2, rules)
const many = JSON.stringify({ lines: Array.from({ length: 400 }, (_, i) => ({ text: `줄${i}` })) })

const CASES: { name: string; actual: unknown; expected: unknown }[] = [
  { name: '프롬프트에 자료 번호가 붙는다', actual: prompt.includes('1. 가입자 120명이다.\n2. 결제 오류 2건을 고쳤다.'), expected: true },
  { name: '프롬프트에 규칙 id와 내용이 들어간다', actual: prompt.includes('r1. 존댓말로 쓴다') && prompt.includes('r3. 숫자는 메모에 있는 것만 쓴다'), expected: true },
  { name: '빈 규칙은 프롬프트에서 뺀다', actual: prompt.includes('r2.'), expected: false },
  { name: '결과 모양과 하는 일이 들어간다', actual: prompt.includes('500자 안팎') && prompt.includes('주간보고를 써요'), expected: true },
  { name: '예시 결과가 없으면 그 칸을 만들지 않는다', actual: prompt.includes('예전에 잘 나온 결과'), expected: false },
  { name: '"검토 기준"이라는 말을 쓰지 않는다', actual: prompt.includes('검토 기준'), expected: false },
  { name: '빈 줄과 글 없는 줄은 버린다', actual: parsed.length, expected: 2 },
  { name: '줄 글은 앞뒤 공백을 뺀다', actual: parsed[0].text, expected: '가입자가 120명입니다.' },
  { name: '없는 자료 번호·소수·글자는 버리고 중복을 합친다', actual: parsed[0].sourceIds, expected: [1] },
  { name: '없는 규칙 번호는 버리고 중복을 합친다', actual: parsed[0].ruleIds, expected: ['r1'] },
  { name: '규칙 번호가 없으면 빈 배열', actual: parsed[1].ruleIds, expected: [] },
  { name: '코드 블록으로 감싼 JSON도 읽는다', actual: parseRunResponse('```json\n{"lines":[{"text":"가","sourceIds":[1]}]}\n```', 2, rules).length, expected: 1 },
  { name: 'JSON이 깨지면 글로 받아 줄로 자른다', actual: plain.map((line) => line.text), expected: ['첫 줄입니다.', '둘째 줄입니다.'] },
  { name: '글로 받은 줄은 근거 번호를 비운다', actual: plain.every((line) => line.sourceIds.length === 0), expected: true },
  { name: '줄 배열만 와도 읽는다', actual: parseRunResponse('[{"text":"가","sourceIds":[1,7],"ruleIds":["r1"]},{"text":"나"}]', 2, rules), expected: [{ text: '가', sourceIds: [1], ruleIds: ['r1'] }, { text: '나', sourceIds: [], ruleIds: [] }] },
  { name: 'lines가 없는 JSON은 실패로 본다', actual: parseRunResponse('{"a":1}', 2, rules).length, expected: 0 },
  { name: '깨진 JSON은 줄로 자르지 않고 실패로 본다', actual: parseRunResponse('[{"text": "가", ', 2, rules).length, expected: 0 },
  { name: '빈 응답은 줄이 없다', actual: parseRunResponse('  ', 2, rules).length, expected: 0 },
  { name: '줄은 300개까지만 받는다', actual: parseRunResponse(many, 2, rules).length, expected: 300 },
  { name: '자료 문장 수만큼 긴 응답(141줄)도 자르지 않는다', actual: parseRunResponse(JSON.stringify({ lines: Array.from({ length: 141 }, (_, i) => ({ text: `줄${i}` })) }), 2, rules).length, expected: 141 },
]

let failed = 0
for (const { name, actual, expected } of CASES) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected)
  if (!pass) failed += 1
  console.log(`${pass ? '통과' : '실패'} ${name}${pass ? '' : `: 기대 ${JSON.stringify(expected)}, 실제 ${JSON.stringify(actual)}`}`)
}
console.log(failed === 0 ? `\n${CASES.length}개 모두 통과` : `\n${failed}개 실패`)
process.exit(failed === 0 ? 0 : 1)
