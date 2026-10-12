import type { Answers, Rule } from '@/types/task'

const MAX_RULES = 8

export const buildRulePrompt = (answers: Answers) =>
  [
    '아래 답변을 바탕으로, 이 반복 작업의 글을 쓸 때 AI가 지킬 작성 규칙을 5~8개 만들어 주세요.',
    '- 규칙은 글을 쓰는 쪽이 지킬 약속입니다. 결과를 검토하는 기준이 아닙니다.',
    '- 한 줄에 하나씩, 짧은 문장으로 씁니다.',
    '- 답변에 없는 내용을 지어내지 않습니다.',
    '- 답변을 그대로 옮기지 말고, 글을 쓸 때 지킬 구체적인 행동으로 바꿉니다. 분량·말투·구성은 답변에서 뽑되, 자료를 다루는 규칙도 하나 이상 넣습니다.',
    '- 좋은 규칙의 예: "숫자와 이름은 자료에 있는 것만 쓴다", "자료에 없는 내용은 [확인 필요]로 표시한다", "한 줄에 하나의 내용만 쓴다"',
    '- 나쁜 규칙의 예: "주간 업무 보고서를 쓴다"(하는 일의 설명), "메모를 자료로 활용한다"(당연한 말)',
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
export const DELETED_AFTER = '(삭제함)'

// 고친 줄과 삭제한 줄을 고치기 전·후로 모은다. 삭제한 줄의 후는 DELETED_AFTER다.
export const editedPairs = (lines: { text: string; editedText?: string; deleted?: boolean }[]): EditedPair[] =>
  lines
    .flatMap((line) =>
      line.deleted ? [{ before: line.text, after: DELETED_AFTER }] : line.editedText !== undefined ? [{ before: line.text, after: line.editedText }] : [],
    )
    .slice(0, MAX_PAIRS)

export const buildRuleCandidatePrompt = (pairs: EditedPair[], rules: Rule[]) =>
  [
    '사용자가 AI가 쓴 글을 아래처럼 고쳤습니다. 다음에도 글을 쓸 때 지킬 규칙을 한 줄로 만들어 주세요.',
    '- 규칙은 글을 쓰는 쪽이 지킬 약속입니다. "~한다"처럼 행동으로 씁니다. 결과를 검토하는 기준이 아닙니다.',
    '- 다음 두 경우에는 규칙을 만들지 말고 빈 문자열("")을 주세요.',
    '  ① 이번 자료의 숫자·이름·날짜를 바로잡은 것뿐이라 이번 자료에만 해당할 때',
    '  ② 기존 규칙과 뜻이 같거나, 기존 규칙이 이미 포함하는 내용일 때. 표현이 다르거나 조금 더 구체적으로 쓴 것도 겹치는 것으로 봅니다.',
    '  (예: 기존 규칙이 "숫자는 메모에 있는 것만 쓴다"일 때 "수치는 메모에 적힌 사실만 쓴다"는 겹칩니다.)',
    '- 기존 규칙에 없는 새 약속일 때만 규칙을 줍니다.',
    `- 고친 후가 "${DELETED_AFTER}"이면 사용자가 그 줄을 통째로 뺀 것입니다. 이런 줄을 쓰지 말라는 뜻이니, 어떤 종류의 줄을 쓰지 않을지를 규칙으로 만들어 주세요.`,
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

// 후보를 만든 뒤 따로 한 번 더 묻는다. "만들기"보다 "겹치는지 고르기"가 가벼운 모델에게 쉽다.
export const buildOverlapPrompt = (candidate: string, rules: Rule[]) =>
  [
    '새 규칙이 아래 기존 규칙과 겹치는지 판단해 주세요.',
    '- 겹침: 새 규칙이 기존 규칙 중 하나와 같은 행동을 요구하거나, 기존 규칙이 이미 포함하는 내용입니다. 표현이 달라도 같은 뜻이면 겹칩니다.',
    '- 겹치지 않음: 새 규칙이 기존 규칙에 없는 구체적인 방식(표기 방법, 형식, 문체 등)을 더하는 경우입니다.',
    '- 응답은 JSON만 출력합니다. 형식: {"overlap": true 또는 false}',
    '',
    '[기존 규칙]',
    ...rules.filter((rule) => rule.text.trim()).map((rule) => `- ${rule.text.trim()}`),
    '',
    '[새 규칙]',
    `- ${candidate.trim()}`,
  ].join('\n')

// 겹침 판정. 읽을 수 없으면 null(겹치는지 모르는 채로 후보를 그대로 보여 준다).
export const parseOverlap = (text: string): boolean | null => {
  try {
    const parsed: unknown = JSON.parse(stripFence(text))
    const value = parsed && typeof parsed === 'object' ? (parsed as { overlap?: unknown }).overlap : undefined
    return typeof value === 'boolean' ? value : null
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
