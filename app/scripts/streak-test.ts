import { countStreak, type StreakRun } from '../src/lib/streak.ts'

const ok = (passState: StreakRun['passState'] = 'stayed'): StreakRun => ({ edited: false, passState, copied: true })

const CASES: { name: string; runs: StreakRun[]; expected: number }[] = [
  {
    name: '리뷰 예시: 최신순 stayed → quick_pass → nothing_flagged → stayed',
    runs: [ok('stayed'), ok('nothing_flagged'), ok('quick_pass'), ok('stayed')],
    expected: 1,
  },
  { name: '셀 수 있는 실행 3번 연속', runs: [ok(), ok('nothing_flagged'), ok()], expected: 3 },
  { name: '마지막이 고친 실행', runs: [ok(), ok(), { edited: true, passState: 'stayed', copied: true }], expected: 0 },
  { name: '중간에 skipped', runs: [ok(), ok(), { edited: false, passState: 'skipped', copied: true }, ok()], expected: 1 },
  { name: '중간에 복사 실패', runs: [ok(), { edited: false, passState: 'stayed', copied: false }, ok(), ok()], expected: 2 },
  { name: '확인 생략 중 펼쳐서 복사', runs: [ok(), ok(), ok('nothing_flagged')], expected: 3 },
  { name: '복사한 뒤 더 고쳤다고 답한 기록은 연속을 끊는다', runs: [ok(), { edited: false, passState: 'stayed', copied: true, editedAfter: 'yes' }, ok()], expected: 1 },
  { name: '복사 뒤 고치지 않았다고 답한 기록은 그대로 센다', runs: [ok(), { edited: false, passState: 'stayed', copied: true, editedAfter: 'no' }, ok()], expected: 3 },
  { name: '답이 없으면 안 고친 것으로 센다', runs: [{ edited: false, passState: 'stayed', copied: true, editedAfter: undefined }, ok()], expected: 2 },
  { name: '기록 없음', runs: [], expected: 0 },
]

let failed = 0
for (const testCase of CASES) {
  const actual = countStreak(testCase.runs)
  const pass = actual === testCase.expected
  if (!pass) failed++
  console.log(`${pass ? '통과' : '실패'} ${testCase.name}: 기대 ${testCase.expected}, 실제 ${actual}`)
}
process.exit(failed ? 1 : 0)
