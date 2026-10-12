import { editedLineCount, matchesFilter, shortMaterial, summarize, toEntries, trendOf } from '../src/lib/history.ts'

const line = (edited: boolean) => ({ text: 'a', editedText: edited ? 'b' : undefined, sourceIds: [], ruleIds: [], status: 'has_source' as const, missingTokens: [] })
const run = (id: string, at: string, over: Record<string, unknown> = {}) =>
  ({ id, number: 1, input: '월요일에 한 일\n둘째 줄', sources: [], lines: [], edited: false, passState: 'stayed', flaggedCount: 0, elapsedSeconds: 5, copied: true, finalText: '', isSample: false, createdAt: at, ...over }) as never

const tasks = [
  { id: 'a', name: '주간보고', isDemo: false, runs: [run('a1', '2026-10-01T00:00:00Z'), run('a2', '2026-10-08T00:00:00Z', { edited: true, lines: [line(true), line(true), line(false)] })] },
  { id: 'd', name: '체험', isDemo: true, runs: [run('d1', '2026-10-05T00:00:00Z', { copied: false })] },
]
const entries = toEntries(tasks as never)

const CASES: { name: string; actual: unknown; expected: unknown }[] = [
  { name: '모든 작업의 기록을 모은다', actual: entries.length, expected: 3 },
  { name: '최근 기록이 위', actual: entries.map((e) => e.run.id), expected: ['a2', 'd1', 'a1'] },
  { name: '체험용 작업 표시가 따라온다', actual: entries.map((e) => e.isDemo), expected: [false, true, false] },
  { name: '필터: 전체', actual: entries.filter((e) => matchesFilter(e.run, 'all')).length, expected: 3 },
  { name: '필터: 안 고침(복사한 것만)', actual: entries.filter((e) => matchesFilter(e.run, 'unedited')).map((e) => e.run.id), expected: ['a1'] },
  { name: '필터: 고침', actual: entries.filter((e) => matchesFilter(e.run, 'edited')).map((e) => e.run.id), expected: ['a2'] },
  { name: '필터: 복사 안 됨', actual: entries.filter((e) => matchesFilter(e.run, 'notCopied')).map((e) => e.run.id), expected: ['d1'] },
  { name: '고친 줄 수', actual: editedLineCount(tasks[0].runs[1] as never), expected: 2 },
  { name: '안 고친 기록은 0', actual: editedLineCount(tasks[0].runs[0] as never), expected: 0 },
  { name: '줄이 저장되지 않은 고친 기록은 1', actual: editedLineCount({ edited: true, lines: [] }), expected: 1 },
  { name: '자료는 첫 줄 앞부분만', actual: shortMaterial('월요일에 한 일\n둘째 줄'), expected: '월요일에 한 일' },
  { name: '자료가 길면 줄임표', actual: shortMaterial('가'.repeat(40)), expected: `${'가'.repeat(30)}…` },
  { name: '집계: 총 3, 안 고침 1(33%), 복사 안 됨 1', actual: summarize(entries), expected: { total: 3, unedited: 1, ratio: 33, notCopied: 1 } },
  { name: '집계: 기록이 없으면 0%', actual: summarize([]), expected: { total: 0, unedited: 0, ratio: 0, notCopied: 0 } },
  { name: '추이: 회차별 고친 줄 수(오래된 것이 앞)', actual: trendOf(tasks[0].runs as never), expected: [0, 2] },
  { name: '추이: 10회까지만', actual: trendOf(Array.from({ length: 14 }, () => ({ edited: false, lines: [] }))).length, expected: 10 },
]

let failed = 0
for (const { name, actual, expected } of CASES) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected)
  if (!pass) failed += 1
  console.log(`${pass ? '통과' : '실패'} ${name}${pass ? '' : `: 기대 ${JSON.stringify(expected)}, 실제 ${JSON.stringify(actual)}`}`)
}
console.log(failed === 0 ? `\n${CASES.length}개 모두 통과` : `\n${failed}개 실패`)
process.exit(failed === 0 ? 0 : 1)
