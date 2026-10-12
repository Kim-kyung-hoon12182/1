import { checkLine, findMissingTokens } from '../src/lib/evidence.ts'
import { statusOfText, withEditedText } from '../src/lib/lineEdit.ts'
import type { OutputLine } from '../src/types/task.ts'

const material = ['화요일 매출은 9천만 원을 기록했습니다.', '광고비는 1,200만 원이었다.', '객단가는 7만 2천 원이다.']
const all = material.join('\n')

const base: OutputLine = { text: '화요일 매출은 12% 증가했습니다.', sourceIds: [1], ruleIds: [], status: 'not_in_input', missingTokens: ['12%'] }
const edited = withEditedText(base, '화요일 매출은 9000만 원을 기록했습니다.', material)
const reverted = withEditedText(edited, undefined, material)
const unchanged = withEditedText(edited, '화요일 매출은 9000만 원을 기록했습니다.', material)

const CASES: { name: string; actual: unknown; expected: unknown }[] = [
  { name: '"9천만 원"을 "9000만 원"으로 써도 같은 금액', actual: findMissingTokens('화요일 매출은 9000만 원을 기록했습니다.', all), expected: [] },
  { name: '"9,000만원"(붙여 씀)도 같은 금액', actual: findMissingTokens('매출은 9,000만원이다.', all), expected: [] },
  { name: '"0.9억 원"도 같은 금액', actual: findMissingTokens('매출은 0.9억 원이다.', all), expected: [] },
  { name: '"90,000,000원"도 같은 금액', actual: findMissingTokens('매출은 90,000,000원이다.', all), expected: [] },
  { name: '"1200만 원"은 "1,200만 원"과 같다', actual: findMissingTokens('광고비는 1200만 원이었다.', all), expected: [] },
  { name: '"7만 2천 원"은 "72,000원"과 같다', actual: findMissingTokens('객단가는 72,000원이다.', all), expected: [] },
  { name: '다른 금액은 그대로 걸린다', actual: findMissingTokens('매출은 1억 원이다.', all).length > 0, expected: true },
  { name: '비슷해 보여도 값이 다르면 걸린다(9천만 → 9천 5백만)', actual: findMissingTokens('매출은 9500만 원이다.', all).length > 0, expected: true },
  { name: '"12%"는 그대로 걸린다', actual: findMissingTokens('화요일 매출은 12% 증가했습니다.', all).includes('12%'), expected: true },
  { name: '금액 표기를 바꾼 줄은 참고한 곳으로 나온다', actual: checkLine('화요일 매출은 9000만 원을 기록했습니다.', [1], material).status, expected: 'has_source' },
  { name: '고친 글로 다시 검사: 경고가 풀린다', actual: edited.status, expected: 'has_source' },
  { name: '고친 줄의 누락 목록이 비워진다', actual: edited.missingTokens, expected: [] },
  { name: '되돌리면 AI가 쓴 글의 판정으로 돌아간다', actual: [reverted.status, reverted.missingTokens, reverted.editedText], expected: ['not_in_input', ['12%'], undefined] },
  { name: '같은 글을 다시 고쳐도 원래 판정을 잃지 않는다', actual: withEditedText(unchanged, undefined, material).status, expected: 'not_in_input' },
  { name: '고쳐도 자료에 없는 금액이면 계속 걸린다', actual: statusOfText('화요일 매출은 8000만 원을 기록했습니다.', [1], material).status, expected: 'not_in_input' },
]

let failed = 0
for (const { name, actual, expected } of CASES) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected)
  if (!pass) failed += 1
  console.log(`${pass ? '통과' : '실패'} ${name}${pass ? '' : `: 기대 ${JSON.stringify(expected)}, 실제 ${JSON.stringify(actual)}`}`)
}
console.log(failed === 0 ? `\n${CASES.length}개 모두 통과` : `\n${failed}개 실패`)
process.exit(failed === 0 ? 0 : 1)
