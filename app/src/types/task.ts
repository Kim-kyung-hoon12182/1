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
