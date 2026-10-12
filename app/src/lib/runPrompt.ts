import type { Answers, Rule } from '@/types/task'

export type RawLine = { text: string; sourceIds: number[]; ruleIds: string[] }

// 자료 8,000자를 문장마다 한 줄로 옮겨도 넘지 않는 정도. 응답이 끝없이 길어지는 경우만 막는다
const MAX_LINES = 300

// F-03 요청: 번호 붙은 자료와 규칙을 주고, 줄마다 근거 자료 번호와 적용한 규칙 번호를 JSON으로 받는다
export const buildRunPrompt = (answers: Answers, rules: Rule[], sentences: string[]) =>
  [
    `다음 일을 하는 글을 써 주세요: ${answers.what}`,
    `결과 모양: ${answers.shape}`,
    '',
    '[지킬 규칙]',
    ...rules.filter((rule) => rule.text.trim()).map((rule) => `${rule.id}. ${rule.text.trim()}`),
    '',
    '[자료] 문장마다 번호가 붙어 있습니다.',
    ...sentences.map((sentence, index) => `${index + 1}. ${sentence}`),
    ...(answers.example?.trim() ? ['', '[예전에 잘 나온 결과: 말투와 모양만 참고하세요]', answers.example.trim()] : []),
    '',
    '- 자료에 없는 숫자, 이름, 사실은 쓰지 마세요. 모르는 부분은 "[확인 필요]"라고 쓰세요.',
    '- 결과는 줄 단위로 쓰고, 한 줄에는 하나의 내용만 담으세요.',
    '- 소제목이 필요하면 "[완료한 일]"처럼 대괄호로 감싼 짧은 줄로만 쓰세요. "여기까지예요" 같은 맺음 문장은 쓰지 마세요.',
    '- 줄마다 근거가 된 자료 번호(sourceIds)와 지킨 규칙 번호(ruleIds)를 붙이세요. 근거가 없으면 빈 배열로 두세요.',
    '- 응답은 JSON만 출력하세요. 형식: {"lines":[{"text":"줄 내용","sourceIds":[1],"ruleIds":["r1"]}]}',
  ].join('\n')

// 모델이 줄 끝에 근거 번호를 글로 붙이는 경우("... 제시 [1]")가 있어 지운다. 번호는 sourceIds로 따로 받는다
const stripCitationMarks = (text: string) => text.replace(/\s*\[\d+(?:\s*,\s*\d+)*\]\s*$/, '').trim()

const stripFence = (text: string) => text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

// 모델이 번호를 숫자(1)로도, 글자("1")로도, "1, 2"처럼 묶어서도 준다. 숫자로 읽고, 존재하지 않는 번호는 버린다
const toNumbers = (value: unknown): number[] =>
  typeof value === 'number' ? [value] : typeof value === 'string' ? (value.match(/\d+/g) ?? []).map(Number) : []

const cleanIds = (value: unknown, valid: (id: number) => boolean) =>
  Array.isArray(value) ? [...new Set(value.flatMap(toNumbers).filter((id) => Number.isInteger(id) && valid(id)))] : []

// 규칙 번호도 "r1"이 아니라 1로 주는 경우가 있어 r을 붙여 읽는다
const cleanRuleIds = (value: unknown, ruleIds: string[]) =>
  Array.isArray(value)
    ? [
        ...new Set(
          value
            .map((id) => (typeof id === 'number' ? `r${id}` : id))
            .filter((id): id is string => typeof id === 'string' && ruleIds.includes(id)),
        ),
      ]
    : []

// JSON이 깨지면 글로 받아 줄 단위로 자르고 근거 번호는 비운다
const splitPlainText = (text: string): RawLine[] =>
  text
    .split('\n')
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '').trim())
    .filter(Boolean)
    .slice(0, MAX_LINES)
    .map((line) => ({ text: line, sourceIds: [], ruleIds: [] }))

export const parseRunResponse = (text: string, sentenceCount: number, rules: Rule[]): RawLine[] => {
  try {
    const parsed: unknown = JSON.parse(stripFence(text))
    // 모델이 {"lines": [...]} 대신 줄 배열만 줄 때도 읽는다
    const list = Array.isArray(parsed) ? parsed : isRecord(parsed) && Array.isArray(parsed.lines) ? parsed.lines : null
    if (!list) return []
    const ruleIds = rules.map((rule) => rule.id)
    return list
      .flatMap((item): RawLine[] => {
        const text = typeof item?.text === 'string' ? stripCitationMarks(item.text) : ''
        if (!isRecord(item) || !text) return []
        return [
          {
            text,
            sourceIds: cleanIds(item.sourceIds, (id) => id >= 1 && id <= sentenceCount),
            ruleIds: cleanRuleIds(item.ruleIds, ruleIds),
          },
        ]
      })
      .slice(0, MAX_LINES)
  } catch {
    // JSON처럼 보이는데 깨진 글은 줄로 자르지 않는다(괄호와 따옴표가 결과로 보이므로)
    return /^\s*[[{]/.test(stripFence(text)) ? [] : splitPlainText(text)
  }
}
