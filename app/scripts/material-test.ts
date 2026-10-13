import { splitSentences } from '../src/lib/material.ts'

const CASES: { name: string; actual: unknown; expected: unknown }[] = [
  { name: '줄바꿈으로 자른다', actual: splitSentences('가나다입니다.\n라마바입니다.'), expected: ['가나다입니다.', '라마바입니다.'] },
  { name: '한 줄 안의 문장 끝에서 자른다', actual: splitSentences('첫째입니다. 둘째입니다.'), expected: ['첫째입니다.', '둘째입니다.'] },
  { name: '점으로 쓴 날짜는 자르지 않는다', actual: splitSentences('다음 회의는 2026. 10. 19.에 열립니다.'), expected: ['다음 회의는 2026. 10. 19.에 열립니다.'] },
  { name: '문장 끝이 날짜여도 자르지 않는다', actual: splitSentences('회의는 2026. 10. 19.'), expected: ['회의는 2026. 10. 19.'] },
  { name: '날짜 뒤 문장은 자른다', actual: splitSentences('회의는 2026. 10. 19. 이후에 열립니다. 다음 안건입니다.'), expected: ['회의는 2026. 10. 19. 이후에 열립니다.', '다음 안건입니다.'] },
  { name: '목록 번호만 따로 떼지 않는다', actual: splitSentences('1. 첫째 안건입니다.\n2. 둘째 안건입니다.'), expected: ['1. 첫째 안건입니다.', '2. 둘째 안건입니다.'] },
  { name: '소수점은 자르지 않는다', actual: splitSentences('환불은 1.4%였습니다.'), expected: ['환불은 1.4%였습니다.'] },
]

let failed = 0
for (const { name, actual, expected } of CASES) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected)
  if (!pass) failed += 1
  console.log(`${pass ? '통과' : '실패'} ${name}${pass ? '' : `: 기대 ${JSON.stringify(expected)}, 실제 ${JSON.stringify(actual)}`}`)
}
console.log(failed === 0 ? `\n${CASES.length}개 모두 통과` : `\n${failed}개 실패`)
process.exit(failed === 0 ? 0 : 1)
