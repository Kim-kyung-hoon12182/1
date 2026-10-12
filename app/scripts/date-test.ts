import { checkLine, findMissingTokens } from '../src/lib/evidence.ts'

const material = ['2026. 09. 23. 기준 월 매출은 9천만 원이다.', '재구매율은 2026. 08. 31.에 44%였고 2026-09-23에 46.5%로 올랐다.', '다음 회의는 10월 12일에 열린다.']
const all = material.join('\n')

const CASES: { name: string; actual: unknown; expected: unknown }[] = [
  { name: '점으로 쓴 날짜를 "년 월 일"로 바꿔도 같은 날이면 없다고 보지 않는다', actual: findMissingTokens('2026년 9월 23일 기준 월 매출은 9천만 원이다.', all), expected: [] },
  { name: '자릿수(08과 8)가 달라도 같은 날', actual: findMissingTokens('2026년 8월 31일에 44%였다.', all), expected: [] },
  { name: '하이픈으로 쓴 날짜도 같은 날로 본다', actual: findMissingTokens('2026. 09. 23.에 46.5%로 올랐다.', all), expected: [] },
  { name: '연도가 없는 "월 일"은 자료에 같은 월·일이 있으면 같은 날', actual: findMissingTokens('9월 23일에 올랐다.', all), expected: [] },
  { name: '자료에 없는 날짜는 그대로 걸린다', actual: findMissingTokens('2026년 9월 24일 기준이다.', all).length > 0, expected: true },
  { name: '연도가 다르면 다른 날이다', actual: findMissingTokens('2025년 9월 23일 기준이다.', all).length > 0, expected: true },
  { name: '날짜가 맞아도 자료에 없는 다른 숫자는 걸린다', actual: findMissingTokens('2026년 9월 23일 기준 월 매출은 1억 원이다.', all).includes('1억 원'), expected: true },
  { name: '"10월 12일"이 자료에 있으면 같은 표기는 통과', actual: findMissingTokens('다음 회의는 10월 12일이다.', all), expected: [] },
  { name: '자료의 월·일에 연도를 새로 붙이면 연도는 걸린다', actual: findMissingTokens('다음 회의는 2026. 10. 12.이다.', all).length > 0, expected: true },
  { name: '표기를 바꾼 날짜 줄은 "자료에 없음"이 아니라 참고한 곳으로 나온다', actual: checkLine('재구매율은 2026년 8월 31일에 44%였다.', [2], material).status, expected: 'has_source' },
  { name: '실제로 다른 날짜를 쓴 줄은 "자료에 없음"', actual: checkLine('재구매율은 2026년 8월 30일에 44%였다.', [2], material).status, expected: 'not_in_input' },
]

let failed = 0
for (const { name, actual, expected } of CASES) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected)
  if (!pass) failed += 1
  console.log(`${pass ? '통과' : '실패'} ${name}${pass ? '' : `: 기대 ${JSON.stringify(expected)}, 실제 ${JSON.stringify(actual)}`}`)
}
console.log(failed === 0 ? `\n${CASES.length}개 모두 통과` : `\n${failed}개 실패`)
process.exit(failed === 0 ? 0 : 1)
