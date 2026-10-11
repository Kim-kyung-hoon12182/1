import { splitSentences } from '@/lib/material'
import { buildAiResult, type RunResult } from '@/lib/run'
import { buildRunPrompt, parseRunResponse } from '@/lib/runPrompt'
import { buildRulePrompt, parseRules } from '@/lib/rules'
import type { Answers, Task } from '@/types/task'

export type ApiErrorCode = 'no_key' | 'rate_limit' | 'upstream' | 'bad_request' | 'network'

class ApiError extends Error {
  code: ApiErrorCode

  constructor(code: ApiErrorCode, message: string) {
    super(message)
    this.code = code
  }
}

export async function requestGenerate(prompt: string, options: { json?: boolean } = {}): Promise<string> {
  let res: Response
  try {
    res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, json: options.json }),
    })
  } catch {
    throw new ApiError('network', '연결에 실패했어요.')
  }

  let data: { text?: string; error?: string; code?: ApiErrorCode }
  try {
    data = (await res.json()) as typeof data
  } catch {
    throw new ApiError('upstream', 'AI 응답을 받지 못했어요.')
  }
  if (!res.ok) throw new ApiError(data.code ?? 'upstream', data.error ?? '연결에 실패했어요.')
  return data.text ?? ''
}

type RuleResult = { texts: string[]; failed: boolean; code?: ApiErrorCode }

// F-02: 실패하면 호출한 쪽이 예시 규칙이나 빈 규칙으로 대신한다.
export async function generateRules(answers: Answers): Promise<RuleResult> {
  try {
    const text = await requestGenerate(buildRulePrompt(answers), { json: true })
    const texts = parseRules(text)
    return texts.length > 0 ? { texts, failed: false } : { texts: [], failed: true, code: 'upstream' }
  } catch (error) {
    return { texts: [], failed: true, code: error instanceof ApiError ? error.code : 'network' }
  }
}

type RunOutcome = { result: RunResult; code?: undefined } | { result?: undefined; code: ApiErrorCode }

// F-03: 실패하면 호출한 쪽이 재료를 그대로 두고 안내한다.
export async function generateRun(task: Task, material: string): Promise<RunOutcome> {
  const sentences = splitSentences(material)
  try {
    const text = await requestGenerate(buildRunPrompt(task.answers, task.rules, sentences), { json: true })
    const lines = parseRunResponse(text, sentences.length, task.rules)
    return lines.length > 0 ? { result: buildAiResult(lines, sentences) } : { code: 'upstream' }
  } catch (error) {
    return { code: error instanceof ApiError ? error.code : 'network' }
  }
}
