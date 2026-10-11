import { isHeading } from '../src/lib/heading.ts'

const CASES: { text: string; expected: boolean; name: string }[] = [
  { text: '[완료한 일]', expected: true, name: '대괄호 제목' },
  { text: '[주간 업무 보고]', expected: true, name: '대괄호 제목(긴 쪽)' },
  { text: '1. 완료한 일', expected: true, name: '번호 제목' },
  { text: '2) 예정된 일', expected: true, name: '괄호 번호 제목' },
  { text: '## 막힌 점', expected: true, name: '마크다운 제목' },
  { text: '■ 결정 사항', expected: true, name: '기호 제목' },
  { text: '결정 사항:', expected: true, name: '콜론으로 끝나는 제목' },
  { text: '[확인 필요]', expected: false, name: 'AI가 모른다고 표시한 [확인 필요]는 제목이 아니라 확인할 곳으로 남긴다' },
  { text: '결정 사항', expected: false, name: '표시 없는 짧은 글은 내용으로 본다' },
  { text: '디자인 시안 전달', expected: false, name: '표시 없는 명사구는 내용으로 본다' },
  { text: '[3분기 주간 업무 보고]', expected: false, name: '숫자가 있으면 내용일 수 있다' },
  { text: '1. 계약 14건 체결', expected: false, name: '번호 뒤에 숫자가 있으면 내용' },
  { text: '[계약이 취소됐다]', expected: false, name: '문장으로 끝나면 내용' },
  { text: '[고객 미팅은 취소됩니다.]', expected: false, name: '마침표로 끝나면 내용' },
  { text: '1. 팀장님께 보고드립니다', expected: false, name: '다로 끝나면 내용' },
  { text: '[이번 주에 완료한 일들을 아래에 정리해서 적었습니다]', expected: false, name: '20자를 넘으면 내용' },
  { text: '- 월요일에는 프로젝트를 끝냈습니다.', expected: false, name: '글머리 기호 문장은 내용' },
  { text: '   ', expected: false, name: '빈 줄' },
  { text: '결정 사항이에요.', expected: false, name: '맺음 문장은 내용' },
]

let failed = 0
for (const { text, expected, name } of CASES) {
  const actual = isHeading(text)
  const pass = actual === expected
  if (!pass) failed += 1
  console.log(`${pass ? '통과' : '실패'} ${name}${pass ? '' : `: "${text}" 기대 ${expected}, 실제 ${actual}`}`)
}
console.log(failed === 0 ? `\n${CASES.length}개 모두 통과` : `\n${failed}개 실패`)
process.exit(failed === 0 ? 0 : 1)
