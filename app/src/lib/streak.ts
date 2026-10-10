export type PassState = 'stayed' | 'quick_pass' | 'nothing_flagged' | 'skipped'

export type StreakRun = {
  edited: boolean
  passState: PassState
  copied: boolean
}

export const HANDOFF_STREAK = 3

export const isCountable = (run: StreakRun) =>
  !run.edited && run.copied && (run.passState === 'stayed' || run.passState === 'nothing_flagged')

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
