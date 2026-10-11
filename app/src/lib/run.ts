import type { Sample } from '@/data/sampleTasks'
import { checkLine, hasUnbackedFlip, type LineStatus } from '@/lib/evidence'
import { splitSentences } from '@/lib/material'
import type { OutputLine } from '@/types/task'

export type RunResult = {
  sentences: string[]
  lines: OutputLine[]
}

type CitedSentence = { id: number; text: string }

// 예시 결과: 준비된 줄마다 앱이 직접 검사해서 상태를 붙인다 (F-04)
export const buildSampleResult = (sample: Sample, material: string): RunResult => {
  const sentences = splitSentences(material)
  const lines = sample.lines.map((line) => {
    const { status, missingTokens } = checkLine(line.text, line.sourceIds, sentences)
    return { ...line, status, missingTokens }
  })
  return { sentences, lines }
}

export const isFlagged = (line: OutputLine) => line.status !== 'has_source'

export const flaggedIndexes = (lines: OutputLine[]) =>
  lines.flatMap((line, index) => (isFlagged(line) ? [index] : []))

export const countByStatus = (lines: OutputLine[], status: LineStatus) =>
  lines.filter((line) => line.status === status).length

// 사용자가 고친 줄은 고친 글로, 아니면 AI가 쓴 글로 이어 붙인다
export const finalTextOf = (lines: OutputLine[]) => lines.map((line) => line.editedText ?? line.text).join('\n')

// 줄이 짚은 재료 문장 (없는 번호는 뺀다)
export const citedSentences = (line: OutputLine, sentences: string[]): CitedSentence[] =>
  line.sourceIds.flatMap((id) => (sentences[id - 1] ? [{ id, text: sentences[id - 1] }] : []))

// 재료 문장 하나를 짚은 결과 줄 번호(1부터)
export const linesCiting = (sentenceId: number, lines: OutputLine[]) =>
  lines.flatMap((line, index) => (line.sourceIds.includes(sentenceId) ? [index + 1] : []))

// 확인할 곳으로 표시된 이유를 쉬운 말로 설명한다 (F-04의 판정 순서와 같다)
export const describeReason = (line: OutputLine, sentences: string[]) => {
  if (line.status === 'not_in_input') {
    return `재료에서 찾지 못한 값이 있어요: ${line.missingTokens.join(', ')}. 재료에 실제로 있는 값인지 확인해 주세요.`
  }
  const cited = citedSentences(line, sentences)
  if (cited.length === 0) return 'AI가 근거로 짚은 재료가 없어요.'
  if (hasUnbackedFlip(line.text, cited.map((item) => item.text).join(' '))) {
    return '이 줄에는 짚은 재료에 없는 "실패·못·않·없" 같은 뒤집는 말이 들어 있어요. 뜻이 바뀌지 않았는지 확인해 주세요.'
  }
  return '짚은 재료와 겹치는 낱말이 적어요. 다른 문장을 짚은 건 아닌지 확인해 주세요.'
}
