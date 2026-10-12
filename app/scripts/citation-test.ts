import { resolveSourceIds, withResolvedSources } from '../src/lib/citation.ts'

const sentences = [
  '| 구분 | AS-IS | TO-BE |',
  '| --- | --- | --- |',
  '| 추천 기준 | 시스템이 분류한 기준별로 추천 영역이 여러 개 노출 | 사용자 탐색 목적 순서로 재분류 |',
  '| 노출 순서 | 상품 설명보다 추천 캐러셀이 먼저 길게 이어짐 | 판단에 필요한 정보를 먼저 |',
  '| 추천 이유 | 영역 제목만으로 왜 추천됐는지 알기 어려움 | 제목 자체가 추천 목적을 설명 |',
  '결과는 AS-IS 기준으로 정리합니다.',
  '결과는 AS-IS 기준으로 정리합니다.',
]

const CASES: { name: string; actual: unknown; expected: unknown }[] = [
  { name: '번호가 틀려도 옮긴 글로 맞는 문장을 찾는다(표의 한 칸 글)', actual: resolveSourceIds([1], ['시스템이 분류한 기준별'], sentences), expected: [3] },
  { name: '옮긴 글의 띄어쓰기가 달라도 찾는다', actual: resolveSourceIds([1], ['시스템이분류한 기준별로'], sentences), expected: [3] },
  { name: '글이 두 문장에서 나오면 둘 다 근거로 쓴다', actual: resolveSourceIds([2], ['추천 캐러셀이 먼저', '왜 추천됐는지'], sentences), expected: [4, 5] },
  { name: '자료에 없는 글이면 AI가 준 번호를 그대로 쓴다', actual: resolveSourceIds([3], ['자료에 없는 엉뚱한 글'], sentences), expected: [3] },
  { name: '옮긴 글이 없으면 AI가 준 번호를 그대로 쓴다', actual: resolveSourceIds([4, 5], undefined, sentences), expected: [4, 5] },
  { name: '너무 짧은 글(4글자 미만)은 찾는 데 쓰지 않는다', actual: resolveSourceIds([3], ['AS'], sentences), expected: [3] },
  { name: '같은 글이 여러 문장에 있으면 AI가 준 번호와 겹치는 문장을 쓴다', actual: resolveSourceIds([7], ['AS-IS 기준으로 정리'], sentences), expected: [7] },
  { name: '같은 글이 여러 문장에 있고 겹치는 번호가 없으면 AI가 준 번호에 가까운 문장을 쓴다', actual: resolveSourceIds([5], ['AS-IS 기준으로 정리'], sentences), expected: [6] },
  { name: 'AI가 번호를 비웠어도 옮긴 글로 근거를 채운다', actual: resolveSourceIds([], ['추천 목적을 설명'], sentences), expected: [5] },
  { name: '여러 칸에 걸친 글은 칸 단위로 찾는다', actual: resolveSourceIds([1], ['**추천 이유** | 영역 제목만으로 왜 추천됐는지 알기 어려움 | 잘못된 다른 글'], sentences), expected: [5] },
  { name: '칸이 8글자보다 짧으면 칸 단위로 찾지 않는다(흔한 말에 걸리기 때문)', actual: resolveSourceIds([1], ['없는글입니다확인 | AS-IS'], sentences), expected: [1] },
  { name: '결과: 옮긴 글을 저장하지 않는다', actual: withResolvedSources([{ text: '가', sourceIds: [1], ruleIds: [], sourceQuotes: ['추천 목적을 설명'] }], sentences), expected: [{ text: '가', sourceIds: [5], ruleIds: [] }] },
  { name: '결과: 옮긴 글이 없는 줄은 그대로', actual: withResolvedSources([{ text: '나', sourceIds: [2], ruleIds: ['r1'] }], sentences), expected: [{ text: '나', sourceIds: [2], ruleIds: ['r1'] }] },
]

let failed = 0
for (const { name, actual, expected } of CASES) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected)
  if (!pass) failed += 1
  console.log(`${pass ? '통과' : '실패'} ${name}${pass ? '' : `: 기대 ${JSON.stringify(expected)}, 실제 ${JSON.stringify(actual)}`}`)
}
console.log(failed === 0 ? `\n${CASES.length}개 모두 통과` : `\n${failed}개 실패`)
process.exit(failed === 0 ? 0 : 1)
