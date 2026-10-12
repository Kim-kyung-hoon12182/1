import { coverageOf } from '../src/lib/coverage.ts'

const sentences = ['가 문장', '나 문장', '다 문장', '라 문장']
const line = (sourceIds: number[], deleted?: boolean) => ({ sourceIds, deleted })

const all = coverageOf([line([1, 2]), line([3]), line([4, 1])], sentences)
const some = coverageOf([line([1]), line([3])], sentences)
const none = coverageOf([line([]), line([])], sentences)
const afterDelete = coverageOf([line([1]), line([2, 3], true)], sentences)

const CASES: { name: string; actual: unknown; expected: unknown }[] = [
  { name: '모두 참고했으면 빠진 문장이 없다', actual: [all.referenced, all.total, all.unreferenced.length], expected: [4, 4, 0] },
  { name: '일부만 참고하면 나머지를 번호와 함께 모은다', actual: some.unreferenced, expected: [{ id: 2, text: '나 문장' }, { id: 4, text: '라 문장' }] },
  { name: '참고한 개수', actual: some.referenced, expected: 2 },
  { name: '근거 번호가 하나도 없으면 전부 참고되지 않은 것', actual: [none.referenced, none.unreferenced.length], expected: [0, 4] },
  { name: '삭제한 줄이 참고한 자료는 참고된 것으로 세지 않는다', actual: afterDelete.unreferenced.map((item) => item.id), expected: [2, 3, 4] },
  { name: '없는 번호(범위 밖)는 무시한다', actual: coverageOf([line([9, 0])], sentences).referenced, expected: 0 },
  { name: '자료가 비면 0', actual: coverageOf([line([1])], []), expected: { total: 0, referenced: 0, unreferenced: [] } },
]

let failed = 0
for (const { name, actual, expected } of CASES) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected)
  if (!pass) failed += 1
  console.log(`${pass ? '통과' : '실패'} ${name}${pass ? '' : `: 기대 ${JSON.stringify(expected)}, 실제 ${JSON.stringify(actual)}`}`)
}
console.log(failed === 0 ? `\n${CASES.length}개 모두 통과` : `\n${failed}개 실패`)
process.exit(failed === 0 ? 0 : 1)
