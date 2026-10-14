import type { PassState } from '@/lib/streak'
import type { LineStatus } from '@/lib/evidence'

export type SampleKey = 'report' | 'til' | 'summary' | 'minutes'

export type Answers = { what: string; materials: string; shape: string; example?: string }

export type Rule = {
  id: string
  text: string
  source: 'setup' | 'edit'
  /** 이 규칙을 지키는 줄은 자료에 없는 의견·느낀 점을 써도 된다(TIL 같은 글). 숫자·이름은 그래도 자료와 맞춰 본다 */
  freeform?: boolean
  fromRun?: number
}

export type OutputLine = {
  text: string
  editedText?: string
  /** 고치기 전(AI가 쓴 글)의 판정. 고친 글로 다시 검사한 뒤 되돌리면 이 판정으로 돌아간다 */
  aiStatus?: { status: LineStatus; missingTokens: string[] }
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
