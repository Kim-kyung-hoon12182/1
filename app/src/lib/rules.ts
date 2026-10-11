import type { Answers, Rule } from '@/types/task'

export const MAX_RULES = 8

export const buildRulePrompt = (answers: Answers) =>
  [
    '아래 답변을 바탕으로, 이 반복 작업의 글을 쓸 때 AI가 지킬 작성 규칙을 5~8개 만들어 주세요.',
    '- 규칙은 글을 쓰는 쪽이 지킬 약속입니다. 결과를 검토하는 기준이 아닙니다.',
    '- 한 줄에 하나씩, 짧은 문장으로 씁니다.',
    '- 답변에 없는 내용을 지어내지 않습니다.',
    '- 응답은 JSON 문자열 배열만 출력합니다. 예: ["규칙 하나", "규칙 둘"]',
    '',
    `[무슨 일] ${answers.what}`,
    `[재료] ${answers.materials}`,
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
