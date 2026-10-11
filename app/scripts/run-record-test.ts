import { buildRunRecord, isEdited, judgePassState, QUICK_PASS_SECONDS } from '../src/lib/runRecord.ts'

type Line = Parameters<typeof isEdited>[0][number]

const line = (text: string, editedText?: string): Line => ({
  text,
  editedText,
  sourceIds: [1],
  ruleIds: [],
  status: 'has_source',
  missingTokens: [],
})

const SECOND = 1000

const CASES: { name: string; actual: unknown; expected: unknown }[] = [
  { name: '고친 줄이 없으면 안 고침', actual: isEdited([line('가나다'), line('라마바')]), expected: false },
  { name: '글을 바꾸면 고침', actual: isEdited([line('가나다'), line('라마바', '라마사')]), expected: true },
  { name: '띄어쓰기만 고치면 안 고침', actual: isEdited([line('매출은 9천만 원입니다', '매출은9천만 원 입니다')]), expected: false },
  { name: '문장부호만 고치면 안 고침', actual: isEdited([line('끝냈습니다.', '끝냈습니다')]), expected: false },
  { name: '줄바꿈만 고치면 안 고침', actual: isEdited([line('가나\n다', '가나 다')]), expected: false },
  { name: '고쳤다가 같은 글로 돌려놓으면 안 고침', actual: isEdited([line('가나다', '가나다')]), expected: false },
  { name: '여러 줄 중 한 줄만 바꿔도 고침', actual: isEdited([line('a1'), line('b2'), line('c3', 'c4')]), expected: true },
  { name: '확인할 곳이 없으면 nothing_flagged', actual: judgePassState(0, 30 * SECOND), expected: 'nothing_flagged' },
  { name: '확인할 곳이 없으면 시간과 상관없이 nothing_flagged', actual: judgePassState(0, 1 * SECOND), expected: 'nothing_flagged' },
  { name: '확인할 곳이 있고 4.9초에 넘기면 quick_pass', actual: judgePassState(2, QUICK_PASS_SECONDS * SECOND - 100), expected: 'quick_pass' },
  { name: '확인할 곳이 있고 정확히 5초면 stayed', actual: judgePassState(2, QUICK_PASS_SECONDS * SECOND), expected: 'stayed' },
  { name: '확인할 곳이 있고 오래 머물면 stayed', actual: judgePassState(1, 60 * SECOND), expected: 'stayed' },
  {
    name: '기록 만들기: 시간은 초로 반올림, 복사 실패도 기록',
    actual: (() => {
      const run = buildRunRecord({
        id: 'r',
        number: 3,
        input: '자료',
        sentences: ['자료'],
        lines: [line('가나다'), line('라마바', '라마사')],
        flaggedCount: 2,
        elapsedMs: 7400,
        copied: false,
        finalText: '가나다\n라마사',
        isSample: true,
        createdAt: '2026-10-11T00:00:00.000Z',
      })
      return [run.number, run.edited, run.passState, run.flaggedCount, run.elapsedSeconds, run.copied, run.finalText, run.sources.length]
    })(),
    expected: [3, true, 'stayed', 2, 7, false, '가나다\n라마사', 1],
  },
]

let failed = 0
for (const testCase of CASES) {
  const pass = JSON.stringify(testCase.actual) === JSON.stringify(testCase.expected)
  if (!pass) failed++
  console.log(`${pass ? '통과' : '실패'} ${testCase.name}${pass ? '' : `: 기대 ${JSON.stringify(testCase.expected)}, 실제 ${JSON.stringify(testCase.actual)}`}`)
}
process.exit(failed ? 1 : 0)
