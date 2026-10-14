import type { Answers, Rule } from '@/types/task'

export type RawLine = {
  text: string
  sourceIds: number[]
  ruleIds: string[]
  /** 근거 자료 문장에서 그대로 옮긴 짧은 글. 번호가 틀려도 앱이 이 글로 근거를 찾는다(lib/citation.ts) */
  sourceQuotes?: string[]
}

// 자료 8,000자를 문장마다 한 줄로 옮겨도 넘지 않는 정도. 응답이 끝없이 길어지는 경우만 막는다
const MAX_LINES = 300

// 같은 자료로 다시 실행할 때 보내는 사용자의 정정. after가 null이면 그 줄을 삭제한 것이다.
export type Correction = { before: string; after: string | null }

const MAX_CORRECTIONS = 10
const CORRECTION_CHARS = 200
const clip = (text: string) => (text.length > CORRECTION_CHARS ? `${text.slice(0, CORRECTION_CHARS)}…` : text)

// F-03 요청: 번호 붙은 자료와 규칙을 주고, 줄마다 근거 자료 번호와 적용한 규칙 번호를 JSON으로 받는다
export const buildRunPrompt = (answers: Answers, rules: Rule[], sentences: string[], corrections: Correction[] = []) =>
  [
    `다음 일을 하는 글을 써 주세요: ${answers.what}`,
    `결과 모양: ${answers.shape}`,
    '',
    '[지킬 규칙]',
    ...rules.filter((rule) => rule.text.trim()).map((rule) => `${rule.id}. ${rule.text.trim()}${rule.freeform ? ' [자료 밖 허용]' : ''}`),
    '',
    '[자료] 문장마다 번호가 붙어 있습니다.',
    ...sentences.map((sentence, index) => `${index + 1}. ${sentence}`),
    ...(corrections.length > 0
      ? [
          '',
          '[이번 자료에 대한 사용자의 정정]',
          '같은 자료로 이미 한 번 쓴 결과를 사용자가 아래처럼 고쳤습니다. 이번에는 고친 내용을 그대로 지키고, 삭제함으로 표시된 줄과 같은 내용은 쓰지 마세요.',
          ...corrections.slice(0, MAX_CORRECTIONS).flatMap((item, index) =>
            item.after === null ? [`${index + 1}. 삭제함: ${clip(item.before)}`] : [`${index + 1}. 고치기 전: ${clip(item.before)}`, `   고친 후: ${clip(item.after)}`],
          ),
        ]
      : []),
    ...(answers.example?.trim() ? ['', '[예전에 잘 나온 결과: 말투와 모양만 참고하세요]', answers.example.trim()] : []),
    '',
    '- 자료에 없는 숫자, 이름, 사실은 쓰지 마세요. 모르는 부분은 "[확인 필요]"라고 쓰세요.',
    ...(rules.some((rule) => rule.freeform && rule.text.trim())
      ? ['- [자료 밖 허용]이 붙은 규칙을 지키는 줄만 자료에 없는 의견, 느낀 점, 다짐을 써도 됩니다. 그 줄의 ruleIds에 그 규칙 번호를 넣으세요. 자료에 있는 사실처럼 쓰지 말고, 숫자와 이름은 그 줄에서도 자료에 없는 것을 쓰지 마세요.']
      : []),
    '- 자료의 조심스러운 표현(가능성이 있다, ~할 수 있다, 추정, 일부)은 단정으로 바꾸지 말고 그대로 유지하세요.',
    '- 날짜와 숫자는 자료에 적힌 표기 그대로 쓰세요(예: 2026. 09. 23.을 2026년 9월 23일로 바꾸지 마세요).',
    '- 자료의 시제와 사실 상태를 바꾸지 마세요. 이미 끝난 일은 끝난 일로, 계획이나 예정은 계획이나 예정으로 그대로 쓰세요.',
    '- 결과는 줄 단위로 쓰고, 한 줄에는 하나의 내용만 담으세요.',
    '- 소제목이 필요하면 "[완료한 일]"처럼 대괄호로 감싼 짧은 줄로만 쓰세요. "여기까지예요" 같은 맺음 문장은 쓰지 마세요.',
    '- 줄마다 근거가 된 자료 번호(sourceIds)와, 그 자료 문장에서 그대로 옮긴 짧은 글(sourceQuotes, 8~15글자)과, 지킨 규칙 번호(ruleIds)를 붙이세요. 번호는 틀리기 쉬우니 글을 자료와 똑같이 옮기세요. 근거가 없으면 빈 배열로 두세요.',
    '- 응답은 JSON만 출력하세요. 형식: {"lines":[{"text":"줄 내용","sourceIds":[1],"sourceQuotes":["자료에서 옮긴 글"],"ruleIds":["r1"]}]}',
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

// 옮긴 글: 문자열만, 앞뒤 공백을 지우고, 너무 긴 건 자르고, 한 줄에 3개까지
const cleanQuotes = (value: unknown): string[] =>
  Array.isArray(value)
    ? [...new Set(value.filter((quote): quote is string => typeof quote === 'string').map((quote) => quote.trim().slice(0, 60)).filter(Boolean))].slice(0, 3)
    : []

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
        const sourceQuotes = cleanQuotes(item.sourceQuotes)
        return [
          {
            text,
            sourceIds: cleanIds(item.sourceIds, (id) => id >= 1 && id <= sentenceCount),
            ruleIds: cleanRuleIds(item.ruleIds, ruleIds),
            ...(sourceQuotes.length > 0 ? { sourceQuotes } : {}),
          },
        ]
      })
      .slice(0, MAX_LINES)
  } catch {
    // JSON처럼 보이는데 깨진 글은 줄로 자르지 않는다(괄호와 따옴표가 결과로 보이므로)
    return /^\s*[[{]/.test(stripFence(text)) ? [] : splitPlainText(text)
  }
}
