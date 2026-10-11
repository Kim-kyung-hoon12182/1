import { splitByTokens } from '../src/lib/highlight.ts'

const CASES: { name: string; actual: unknown; expected: unknown }[] = [
  { name: '값 하나를 표시한다', actual: splitByTokens('매출이 1억 원으로 늘었다', ['1억 원']), expected: [{ text: '매출이 ', mark: false }, { text: '1억 원', mark: true }, { text: '으로 늘었다', mark: false }] },
  { name: '값이 줄 맨 앞·맨 뒤여도 된다', actual: splitByTokens('5건 처리 3건', ['5건', '3건']), expected: [{ text: '5건', mark: true }, { text: ' 처리 ', mark: false }, { text: '3건', mark: true }] },
  { name: '같은 값이 두 번 나오면 둘 다 표시한다', actual: splitByTokens('3건과 3건', ['3건']).filter((part) => part.mark).length, expected: 2 },
  { name: '못 찾은 값이 없으면 줄 전체를 그대로 둔다', actual: splitByTokens('내용이 있다', []), expected: [{ text: '내용이 있다', mark: false }] },
  { name: '줄에 없는 값은 무시하고 줄 전체를 그대로 둔다', actual: splitByTokens('내용이 있다', ['9억']), expected: [{ text: '내용이 있다', mark: false }] },
  { name: '겹치는 값은 긴 쪽만 표시한다', actual: splitByTokens('1억 2천 원', ['1억 2천 원', '1억']), expected: [{ text: '1억 2천 원', mark: true }] },
  { name: '앞뒤 공백이 붙은 값도 찾는다', actual: splitByTokens('A 팀 3건', [' 3건 ']).filter((part) => part.mark).map((part) => part.text), expected: ['3건'] },
  { name: '빈 값은 무시한다', actual: splitByTokens('가나다', ['', '  ']), expected: [{ text: '가나다', mark: false }] },
  { name: '조각을 이으면 원래 글이 된다', actual: splitByTokens('매출 1억 원, 비용 3천만 원', ['1억 원', '3천만 원']).map((part) => part.text).join(''), expected: '매출 1억 원, 비용 3천만 원' },
]

let failed = 0
for (const { name, actual, expected } of CASES) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected)
  if (!pass) failed += 1
  console.log(`${pass ? '통과' : '실패'} ${name}${pass ? '' : `: 기대 ${JSON.stringify(expected)}, 실제 ${JSON.stringify(actual)}`}`)
}
console.log(failed === 0 ? `\n${CASES.length}개 모두 통과` : `\n${failed}개 실패`)
process.exit(failed === 0 ? 0 : 1)
