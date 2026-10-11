import { buildHandoffPrompt, withObjectParticle } from '../src/lib/handoff.ts'

const task = {
  name: '주간보고',
  answers: { what: '주간보고를 써요', materials: '지난주 업무 메모', shape: '500자 안팎, 보고체' },
  rules: [
    { id: 'r1', text: '존댓말 보고체로 쓴다', source: 'setup' as const },
    { id: 'r2', text: '  ', source: 'setup' as const },
    { id: 'r3', text: '숫자는 메모에 있는 것만 쓴다', source: 'setup' as const },
  ],
}

const prompt = buildHandoffPrompt(task)
const lines = prompt.split('\n')

const CASES: { name: string; actual: unknown; expected: unknown }[] = [
  { name: '받침이 없으면 "를" (정리)', actual: withObjectParticle('회의록 정리'), expected: '회의록 정리를' },
  { name: '받침이 없으면 "를" (메모)', actual: withObjectParticle('주간 업무 메모'), expected: '주간 업무 메모를' },
  { name: '받침이 있으면 "을" (ㅇ)', actual: withObjectParticle('지난주 업무 메모 내용'), expected: '지난주 업무 메모 내용을' },
  { name: '받침이 있으면 "을" (ㄱ)', actual: withObjectParticle('결과 모양은 표 형식'), expected: '결과 모양은 표 형식을' },
  { name: '한글로 끝나지 않으면 "을(를)"', actual: withObjectParticle('주간보고 (체험)'), expected: '주간보고 (체험)을(를)' },
  { name: '영문으로 끝나면 "을(를)"', actual: withObjectParticle('weekly report'), expected: 'weekly report을(를)' },
  { name: '첫 줄은 작업 이름', actual: lines[0], expected: '매주 주간보고를 써 주세요.' },
  { name: '이름 끝의 괄호 표기는 뺀다', actual: buildHandoffPrompt({ ...task, name: '주간보고 (체험)' }).split('\n')[0], expected: '매주 주간보고를 써 주세요.' },
  { name: '이름이 괄호뿐이면 그대로 쓴다', actual: buildHandoffPrompt({ ...task, name: '(체험)' }).split('\n')[0], expected: '매주 (체험)을(를) 써 주세요.' },
  { name: '결과 모양 항목', actual: lines.slice(2, 4), expected: ['[결과 모양]', '500자 안팎, 보고체'] },
  { name: '비어 있는 규칙은 빼고 번호를 다시 매긴다', actual: lines.slice(5, 8), expected: ['[지킬 규칙]', '1. 존댓말 보고체로 쓴다', '2. 숫자는 메모에 있는 것만 쓴다'] },
  { name: '재료 문단: 모르는 부분은 [확인 필요]', actual: lines[lines.length - 1].includes('[확인 필요]') && lines[lines.length - 1].startsWith('제가 지난주 업무 메모를 붙여 넣으면'), expected: true },
  { name: '"검토 기준"이라는 말을 쓰지 않는다', actual: prompt.includes('검토 기준'), expected: false },
  { name: '정확성을 보장하는 말을 쓰지 않는다', actual: /정확|보장|검증/.test(prompt), expected: false },
]

let failed = 0
for (const testCase of CASES) {
  const pass = JSON.stringify(testCase.actual) === JSON.stringify(testCase.expected)
  if (!pass) failed++
  console.log(`${pass ? '통과' : '실패'} ${testCase.name}${pass ? '' : `: 기대 ${JSON.stringify(testCase.expected)}, 실제 ${JSON.stringify(testCase.actual)}`}`)
}
process.exit(failed ? 1 : 0)
