import { coverageOf, isNoiseSentence } from '../src/lib/coverage.ts'

const sentences = ['가나다 문장입니다', '나다라 문장입니다', '다라마 문장입니다', '라마바 문장입니다']
const line = (sourceIds: number[], deleted?: boolean, status?: string) => ({ sourceIds, deleted, status })

const all = coverageOf([line([1, 2]), line([3]), line([4, 1])], sentences)
const some = coverageOf([line([1]), line([3])], sentences)
const none = coverageOf([line([]), line([])], sentences)
const afterDelete = coverageOf([line([1]), line([2, 3], true)], sentences)
const withNoise = coverageOf([line([1])], ['| 구분 | AS-IS |', '| --- | --- |', '## 2-1.', '내용이 있는 문장입니다', '| 항목 | 값을 적은 줄 |'])
const longDoc = Array.from({ length: 20 }, (_, i) => `${i + 1}번째 내용이 있는 문장입니다`)
const summaryDoc = coverageOf([line([1]), line([5]), line([9])], longDoc)
const detailDoc = coverageOf(Array.from({ length: 15 }, (_, i) => line([i + 1])), longDoc)

const CASES: { name: string; actual: unknown; expected: unknown }[] = [
  { name: '모두 참고했으면 빠진 문장이 없다', actual: [all.referenced, all.total, all.unreferenced.length], expected: [4, 4, 0] },
  { name: '일부만 참고하면 나머지를 번호와 함께 모은다', actual: some.unreferenced, expected: [{ id: 2, text: '나다라 문장입니다' }, { id: 4, text: '라마바 문장입니다' }] },
  { name: '참고한 개수', actual: some.referenced, expected: 2 },
  { name: '근거 번호가 하나도 없으면 전부 참고되지 않은 것', actual: [none.referenced, none.unreferenced.length], expected: [0, 4] },
  { name: '삭제한 줄이 참고한 자료는 참고된 것으로 세지 않는다', actual: afterDelete.unreferenced.map((item) => item.id), expected: [2, 3, 4] },
  { name: '없는 번호(범위 밖)는 무시한다', actual: coverageOf([line([9, 0])], sentences).referenced, expected: 0 },
  { name: '자료가 비면 0', actual: coverageOf([line([1])], []), expected: { total: 0, referenced: 0, unreferenced: [], resultLines: 1, summary: false } },
  { name: '표 구분선과 제목은 세지 않고 내용 있는 표 행은 센다', actual: [withNoise.total, withNoise.unreferenced.map((item) => item.id)], expected: [3, [4, 5]] },
  { name: '잡음 판정: 구분선', actual: [isNoiseSentence('| --- | --- |'), isNoiseSentence('|---|:---:|')], expected: [true, true] },
  { name: '잡음 판정: 마크다운 제목과 짧은 줄', actual: [isNoiseSentence('### 후속: A.'), isNoiseSentence('A.'), isNoiseSentence('**')], expected: [true, true, true] },
  { name: '잡음 판정: 내용 있는 표 행과 문장은 아니다', actual: [isNoiseSentence('| 추천 기준 | 시스템이 분류한 기준 |'), isNoiseSentence('2.4배 증가')], expected: [false, false] },
  { name: '자료를 훨씬 적은 줄로 줄이면 요약', actual: [summaryDoc.summary, summaryDoc.resultLines, summaryDoc.total], expected: [true, 3, 20] },
  { name: '줄 수가 자료와 비슷하면 요약이 아니다', actual: detailDoc.summary, expected: false },
  { name: '자료가 짧으면(10문장 미만) 요약으로 보지 않는다', actual: coverageOf([line([1])], sentences).summary, expected: false },
  { name: '소제목 줄은 결과 줄 수에 넣지 않는다', actual: coverageOf([line([], false, 'heading'), line([1])], longDoc).resultLines, expected: 1 },
]

let failed = 0
for (const { name, actual, expected } of CASES) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected)
  if (!pass) failed += 1
  console.log(`${pass ? '통과' : '실패'} ${name}${pass ? '' : `: 기대 ${JSON.stringify(expected)}, 실제 ${JSON.stringify(actual)}`}`)
}
console.log(failed === 0 ? `\n${CASES.length}개 모두 통과` : `\n${failed}개 실패`)
process.exit(failed === 0 ? 0 : 1)
