import { suggestTaskName } from '../src/lib/taskName.ts'

const CASES: { name: string; actual: unknown; expected: unknown }[] = [
  { name: '주간보고', actual: suggestTaskName('매주 팀장님께 내는 주간보고를 써요.'), expected: '주간보고' },
  { name: '긴 설명에서 이름만', actual: suggestTaskName('매주 금요일에 팀장님께 보내는 주간 업무 보고서를 써요'), expected: '주간 업무 보고서' },
  { name: '회의록', actual: suggestTaskName('회의가 끝나면 회의록을 정리해요'), expected: '회의록' },
  { name: '목적어가 없으면 마지막 낱말', actual: suggestTaskName('블로그 글 쓰기'), expected: '블로그 글 쓰기' },
  { name: '개조식', actual: suggestTaskName('일일 고객 문의 요약'), expected: '일일 고객 문의 요약' },
  { name: '20자를 넘기지 않는다', actual: suggestTaskName('아주아주아주아주 긴 이름의 매우매우매우 복잡한 월간 성과 보고서를 작성해요').length <= 20, expected: true },
  { name: '빈 글은 빈 이름', actual: suggestTaskName('  '), expected: '' },
  { name: '첫 문장만 본다', actual: suggestTaskName('주간보고를 써요. 팀장님께 보내요.'), expected: '주간보고' },
  { name: '낱말 하나', actual: suggestTaskName('일기'), expected: '일기' },
]

let failed = 0
for (const { name, actual, expected } of CASES) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected)
  if (!pass) failed += 1
  console.log(`${pass ? '통과' : '실패'} ${name}${pass ? '' : `: 기대 ${JSON.stringify(expected)}, 실제 ${JSON.stringify(actual)}`}`)
}
console.log(failed === 0 ? `\n${CASES.length}개 모두 통과` : `\n${failed}개 실패`)
process.exit(failed === 0 ? 0 : 1)
