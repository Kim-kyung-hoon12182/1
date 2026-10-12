import type { Answers, Rule } from '@/types/task'

const MAX_RULES = 8

export const buildRulePrompt = (answers: Answers) =>
  [
    '아래 답변을 바탕으로, 이 반복 작업의 글을 쓸 때 AI가 지킬 작성 규칙을 5~8개 만들어 주세요.',
    '- 규칙은 글을 쓰는 쪽이 지킬 약속입니다. 결과를 검토하는 기준이 아닙니다.',
    '- 한 줄에 하나씩, 짧은 문장으로 씁니다.',
    '- 답변에 없는 내용을 지어내지 않습니다.',
    '- 응답은 JSON 문자열 배열만 출력합니다. 예: ["규칙 하나", "규칙 둘"]',
    '',
    `[무슨 일] ${answers.what}`,
    `[자료] ${answers.materials}`,
    `[결과 모양] ${answers.shape}`,
    ...(answers.example?.trim() ? [`[예전에 잘 나온 결과] ${answers.example}`] : []),
  ].join('\n')

const stripFence = (text: string) => text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

export const parseRules = (text: string): string[] => {
  try {
    const parsed: unknown = JSON.parse(stripFence(text))
    const list = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === 'object' && Array.isArray((parsed as { rules?: unknown }).rules)
        ? (parsed as { rules: unknown[] }).rules
        : []
    return list
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, MAX_RULES)
  } catch {
    return []
  }
}

export const toRules = (texts: string[]): Rule[] =>
  texts.map((text, index) => ({ id: `r${index + 1}`, text, source: 'setup' }))

// ---- F-05: 고친 내용에서 규칙 후보 한 줄 ----

export type EditedPair = { before: string; after: string }

const MAX_PAIRS = 5

// 사용자가 실제로 고친 줄만 고치기 전·후로 모은다
export const editedPairs = (lines: { text: string; editedText?: string }[]): EditedPair[] =>
  lines.flatMap((line) => (line.editedText !== undefined ? [{ before: line.text, after: line.editedText }] : [])).slice(0, MAX_PAIRS)

export const buildRuleCandidatePrompt = (pairs: EditedPair[], rules: Rule[]) =>
  [
    '사용자가 AI가 쓴 글을 아래처럼 고쳤습니다. 다음에도 글을 쓸 때 지킬 규칙을 한 줄로 만들어 주세요.',
    '- 규칙은 글을 쓰는 쪽이 지킬 약속입니다. "~한다"처럼 행동으로 씁니다. 결과를 검토하는 기준이 아닙니다.',
    '- 이번 자료에만 해당하는 사실 정정(숫자·이름·날짜를 바로잡은 것)이거나 아래 기존 규칙과 겹치면 빈 문자열("")을 주세요.',
    '- 응답은 JSON만 출력합니다. 형식: {"rule": "한 줄 규칙"}',
    '',
    '[기존 규칙]',
    ...(rules.filter((rule) => rule.text.trim()).length > 0 ? rules.filter((rule) => rule.text.trim()).map((rule) => `- ${rule.text.trim()}`) : ['(없음)']),
    '',
    '[고친 내용]',
    ...pairs.flatMap((pair, index) => [`${index + 1}. 고치기 전: ${pair.before}`, `   고친 후: ${pair.after}`]),
  ].join('\n')

// 후보 한 줄. 빈 글이면 카드를 띄우지 않는다(이번 자료에만 해당). 읽을 수 없으면 null이고 빈 입력칸을 보여 준다.
export const parseRuleCandidate = (text: string): string | null => {
  try {
    const parsed: unknown = JSON.parse(stripFence(text))
    const value =
      typeof parsed === 'string'
        ? parsed
        : parsed && typeof parsed === 'object' && typeof (parsed as { rule?: unknown }).rule === 'string'
          ? (parsed as { rule: string }).rule
          : null
    return value === null ? null : value.trim()
  } catch {
    return null
  }
}

const normalizeRule = (text: string) => text.replace(/[\s\p{P}]/gu, '')

// 이미 있는 규칙과 같은 말이면 다시 추가하지 않는다
export const hasRule = (rules: Rule[], text: string) => {
  const target = normalizeRule(text)
  return target !== '' && rules.some((rule) => normalizeRule(rule.text) === target)
}
