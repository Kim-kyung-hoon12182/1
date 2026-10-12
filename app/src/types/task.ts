import type { PassState } from '@/lib/streak'
import type { LineStatus } from '@/lib/evidence'

export type SampleKey = 'report' | 'til' | 'summary' | 'minutes'

export type Answers = { what: string; materials: string; shape: string; example?: string }

export type Rule = {
  id: string
  text: string
  source: 'setup' | 'edit'
  fromRun?: number
}

export type OutputLine = {
  text: string
  editedText?: string
  /** 사용자가 이 줄을 통째로 뺐다. 복사와 집계에서 빠지고, 고침으로 센다 */
  deleted?: boolean
  sourceIds: number[]
  ruleIds: string[]
  status: LineStatus
  missingTokens: string[]
}

export type Run = {
  id: string
  number: number
  input: string
  sources: string[]
  lines: OutputLine[]
  edited: boolean
  passState: PassState
  flaggedCount: number
  elapsedSeconds: number
  copied: boolean
  /** 다음 실행 때 사용자가 답한 "복사한 뒤 다른 곳에서 더 고쳤나요". 안 물었거나 답하지 않았으면 없다 */
  editedAfter?: 'yes' | 'no'
  finalText: string
  isSample: boolean
  createdAt: string
}

export type Task = {
  id: string
  name: string
  sampleKey?: SampleKey
  answers: Answers
  rules: Rule[]
  runs: Run[]
  handsOff: boolean
  isDemo?: boolean
  createdAt: string
}
