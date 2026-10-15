import { REQUEST_MAX_CHARS, rulesChars } from '@/lib/limits'
import { splitSentences } from '@/lib/material'
import { withResolvedSources } from '@/lib/citation'
import { buildAiResult, type RunResult } from '@/lib/run'
import { buildRunPrompt, parseRunResponse, type Correction } from '@/lib/runPrompt'
import { buildOverlapPrompt, buildRuleCandidatePrompt, buildRulePrompt, parseOverlap, parseRuleCandidate, parseRules, type EditedPair } from '@/lib/rules'
import type { Answers, Rule, Task } from '@/types/task'

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

export const tooLongNotice = (length: number, rules: { text: string }[]) => {
  const over = length - REQUEST_MAX_CHARS
  const rulePart = rulesChars(rules) > 1500 ? `규칙(${rulesChars(rules).toLocaleString()}자)과 ` : ''
  return `요청이 한도보다 ${over.toLocaleString()}자 길어요. ${rulePart}질문 답변·예전 결과·고친 내용을 줄이거나, 자료를 ${over.toLocaleString()}자 정도 줄여서 다시 실행해 주세요.`
}

// notice가 있으면 그 문구를 우선해서 보여 준다(원인을 알 수 있을 때)
type RunOutcome = { result: RunResult; code?: undefined; notice?: undefined } | { result?: undefined; code: ApiErrorCode; notice?: string }

// F-03: 실패하면 호출한 쪽이 자료를 그대로 두고 안내한다.
export async function generateRun(task: Task, material: string, corrections: Correction[] = []): Promise<RunOutcome> {
  const sentences = splitSentences(material)
  try {
    const prompt = buildRunPrompt(task.answers, task.rules, sentences, corrections)
    // 서버가 막기 전에 알아서, 원인에 맞게 안내한다(규칙이 길어서인데 "자료를 줄이라"고만 하면 풀리지 않는다)
    if (prompt.length > REQUEST_MAX_CHARS) return { code: 'bad_request', notice: tooLongNotice(prompt.length, task.rules) }
    const text = await requestGenerate(prompt, { json: true })
    // AI가 옮긴 글로 근거 번호를 바로잡는다. 번호는 긴 자료에서 자주 어긋난다
    const lines = withResolvedSources(parseRunResponse(text, sentences.length, task.rules), sentences)
    return lines.length > 0 ? { result: buildAiResult(lines, sentences, task.rules) } : { code: 'upstream' }
  } catch (error) {
    return { code: error instanceof ApiError ? error.code : 'network' }
  }
}

// 겹침 확인은 덤이라서, AI가 느리면 기다리지 않고 후보를 그대로 보여 준다
const OVERLAP_CHECK_MS = 6000

// F-05: 고친 내용에서 규칙 후보 한 줄. 실패하거나 읽을 수 없으면 null이고, 호출한 쪽이 빈 입력칸을 보여 준다.
export async function generateRuleCandidate(pairs: EditedPair[], rules: Rule[]): Promise<string | null> {
  try {
    const candidate = parseRuleCandidate(await requestGenerate(buildRuleCandidatePrompt(pairs, rules), { json: true }))
    if (!candidate || rules.every((rule) => !rule.text.trim())) return candidate
    // 후보가 기존 규칙과 뜻이 겹치면 빈 글로 바꿔 카드를 띄우지 않는다. 판정이 실패하면 후보를 그대로 보여 준다.
    const overlap = await Promise.race([
      requestGenerate(buildOverlapPrompt(candidate, rules), { json: true }).then(parseOverlap),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), OVERLAP_CHECK_MS)),
    ]).catch(() => null)
    return overlap === true ? '' : candidate
  } catch {
    return null
  }
}
