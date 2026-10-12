import { hasUnknownMark, UNKNOWN_MARK } from '../src/lib/unknownMark.ts'
import { buildRunPrompt } from '../src/lib/runPrompt.ts'

const prompt = buildRunPrompt({ what: 'a', materials: 'b', shape: 'c' }, [], ['문장'])

const CASES: { name: string; actual: unknown; expected: unknown }[] = [
  { name: '줄 끝의 [확인 필요]', actual: hasUnknownMark('담당자: 이서연, 기한: [확인 필요]'), expected: true },
  { name: '줄 중간의 [확인 필요]', actual: hasUnknownMark('[확인 필요] 담당자'), expected: true },
  { name: '표시가 없으면 아니다', actual: hasUnknownMark('담당자: 이서연, 기한: 10/18'), expected: false },
  { name: '대괄호 제목은 아니다', actual: hasUnknownMark('[완료한 일]'), expected: false },
  { name: '띄어쓰기가 다른 표시는 아니다(프롬프트가 정확한 표기를 시킨다)', actual: hasUnknownMark('[확인필요]'), expected: false },
  { name: '프롬프트가 같은 표기를 AI에게 시킨다', actual: prompt.includes(UNKNOWN_MARK), expected: true },
]

let failed = 0
for (const { name, actual, expected } of CASES) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected)
  if (!pass) failed += 1
  console.log(`${pass ? '통과' : '실패'} ${name}${pass ? '' : `: 기대 ${JSON.stringify(expected)}, 실제 ${JSON.stringify(actual)}`}`)
}
console.log(failed === 0 ? `\n${CASES.length}개 모두 통과` : `\n${failed}개 실패`)
process.exit(failed === 0 ? 0 : 1)
