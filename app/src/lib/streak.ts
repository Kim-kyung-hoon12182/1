export type PassState = 'stayed' | 'quick_pass' | 'nothing_flagged' | 'skipped'

export type StreakRun = {
  edited: boolean
  passState: PassState
  copied: boolean
  /** 복사한 뒤 다른 곳에서 고쳤다고 답한 기록은 연속에 넣지 않는다 */
  editedAfter?: 'yes' | 'no'
}

export const HANDOFF_STREAK = 3

export const isCountable = (run: StreakRun) =>
  !run.edited && run.copied && run.editedAfter !== 'yes' && (run.passState === 'stayed' || run.passState === 'nothing_flagged')

export const countStreak = (runsOldestFirst: StreakRun[]) => {
  let streak = 0
  for (let i = runsOldestFirst.length - 1; i >= 0; i--) {
    if (!isCountable(runsOldestFirst[i])) break
    streak++
  }
  return streak
}

export const isHandoffReady = (runsOldestFirst: StreakRun[]) =>
  countStreak(runsOldestFirst) >= HANDOFF_STREAK
