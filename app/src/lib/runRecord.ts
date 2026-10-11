import type { OutputLine, Run } from '@/types/task'

// 확인할 곳이 있는데 이 시간보다 빨리 복사하면 "빠르게 넘김"으로 기록한다 (정의서 F-06, 임시 값)
export const QUICK_PASS_SECONDS = 5

// 띄어쓰기·줄바꿈·문장부호를 지우고 비교한다. 이런 것만 고친 건 고친 것으로 치지 않는다.
const normalize = (text: string) => text.replace(/[\s\p{P}]/gu, '')

export const isEdited = (lines: OutputLine[]) =>
  lines.some((line) => line.editedText !== undefined && normalize(line.editedText) !== normalize(line.text))

// 넘긴 방식. 결과를 접어 둔 상태(skipped)는 확인 생략(F-13)을 만들 때 더한다.
// 어느 값도 사람이 내용을 검토했다는 뜻이 아니다.
export const judgePassState = (flaggedCount: number, elapsedMs: number): Run['passState'] => {
  if (flaggedCount === 0) return 'nothing_flagged'
  return elapsedMs < QUICK_PASS_SECONDS * 1000 ? 'quick_pass' : 'stayed'
}

type RecordInput = {
  id: string
  number: number
  input: string
  sentences: string[]
  lines: OutputLine[]
  flaggedCount: number
  /** 결과가 화면에 나타난 뒤 [복사하고 끝내기]를 누르기까지 걸린 시간. 사람이 검토한 시간이 아니다 */
  elapsedMs: number
  copied: boolean
  finalText: string
  isSample: boolean
  createdAt: string
}

export const buildRunRecord = (input: RecordInput): Run => ({
  id: input.id,
  number: input.number,
  input: input.input,
  sources: input.sentences,
  lines: input.lines,
  edited: isEdited(input.lines),
  passState: judgePassState(input.flaggedCount, input.elapsedMs),
  flaggedCount: input.flaggedCount,
  elapsedSeconds: Math.round(input.elapsedMs / 1000),
  copied: input.copied,
  finalText: input.finalText,
  isSample: input.isSample,
  createdAt: input.createdAt,
})
