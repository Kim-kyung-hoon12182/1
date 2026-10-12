// 'heading'은 소제목 줄(lib/heading.ts). checkLine은 만들지 않고, 결과를 줄로 만들 때 붙인다.
export type LineStatus = 'has_source' | 'not_in_input' | 'needs_check' | 'heading'

export type LineCheck = {
  status: LineStatus
  missingTokens: string[]
  overlap: number
}

export const SOURCE_OVERLAP_MIN = 0.3

export const FLIP_WORDS = ['실패', '취소', '지연', '연기', '중단', '보류', '미완료', '못', '않', '없']

const PARTICLES = [
  '으로부터', '에서부터', '이라고', '라고', '에게서', '한테서',
  '에서', '에게', '한테', '으로', '부터', '까지', '처럼', '보다', '마다', '이나', '이다', '입니다',
  '은', '는', '이', '가', '을', '를', '에', '의', '와', '과', '도', '로', '만', '나',
]

const NUMBER_PATTERN = /\d[\d,.:/]*(?:\s?(?:억|천만|천|백만|만|백))*(?:\s?\d[\d,.]*)?\s?(?:%|원|건|명|개|회|차|시|분|초|월|일|주|년|층|종|배|줄)?/g
const QUOTED_PATTERN = /["'“‘「]([^"'”’」]+)["'”’」]/g
const CAPITAL_WORD_PATTERN = /\b[A-Z][A-Za-z0-9]+\b/g

const normalize = (text: string) => text.replace(/[\s,]/g, '')

export const extractNumbers = (text: string) =>
  (text.match(NUMBER_PATTERN) ?? []).map((token) => token.trim()).filter(Boolean)

export const extractNames = (text: string) => [
  ...[...text.matchAll(QUOTED_PATTERN)].map((match) => match[1]),
  ...(text.match(CAPITAL_WORD_PATTERN) ?? []),
]

// 날짜는 표기만 바꿔 쓰는 일이 흔하다("2026. 09. 23." → "2026년 9월 23일"). 같은 날이면 같은 값으로 본다.
const FULL_DATE_DOT = /(\d{4})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})\.?/g
const FULL_DATE_KOR = /(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/g
const MONTH_DAY_KOR = /(\d{1,2})\s*월\s*(\d{1,2})\s*일/g
const two = (value: string) => value.padStart(2, '0')

// 자료에 있는 날짜를 "YYYYMMDD"(연도가 있을 때)와 "MMDD"로 모은다
const datesIn = (text: string) => {
  const full = new Set<string>()
  const monthDay = new Set<string>()
  for (const pattern of [FULL_DATE_DOT, FULL_DATE_KOR]) {
    for (const match of text.matchAll(pattern)) {
      full.add(match[1] + two(match[2]) + two(match[3]))
      monthDay.add(two(match[2]) + two(match[3]))
    }
  }
  for (const match of text.matchAll(MONTH_DAY_KOR)) monthDay.add(two(match[1]) + two(match[2]))
  return { full, monthDay }
}

// 줄에서 자료에도 있는 날짜(표기가 달라도 같은 날)를 지운다. 자료에 없는 날짜는 남겨서 그대로 걸린다.
const withoutKnownDates = (line: string, material: string) => {
  const known = datesIn(material)
  const drop = (pattern: RegExp, text: string, key: (match: RegExpMatchArray) => string, set: Set<string>) =>
    text.replace(pattern, (whole, ...groups) => (set.has(key([whole, ...groups] as unknown as RegExpMatchArray)) ? ' ' : whole))
  let result = drop(FULL_DATE_DOT, line, (m) => m[1] + two(m[2]) + two(m[3]), known.full)
  result = drop(FULL_DATE_KOR, result, (m) => m[1] + two(m[2]) + two(m[3]), known.full)
  return drop(MONTH_DAY_KOR, result, (m) => two(m[1]) + two(m[2]), known.monthDay)
}

// 금액도 표기만 바꿔 쓰는 일이 흔하다("9천만 원" = "9000만 원" = "0.9억 원" = "90,000,000원"). 같은 금액이면 같은 값으로 본다.
const MONEY = /(?:\d[\d,]*(?:\.\d+)?\s?(?:억|천만|백만|만|천|백)?\s?)+원/g
const MONEY_PART = /(\d[\d,]*(?:\.\d+)?)\s?(억|천만|백만|만|천|백)?/g
const MONEY_UNIT: Record<string, number> = { 억: 1e8, 천만: 1e7, 백만: 1e6, 만: 1e4, 천: 1e3, 백: 100 }

const wonOf = (expression: string) =>
  Math.round([...expression.matchAll(MONEY_PART)].reduce((sum, part) => sum + parseFloat(part[1].replace(/,/g, '')) * (part[2] ? MONEY_UNIT[part[2]] : 1), 0))

// 줄에서 자료에도 있는 금액(표기가 달라도 같은 값)을 지운다. 자료에 없는 금액은 남겨서 그대로 걸린다.
const withoutKnownMoney = (line: string, material: string) => {
  const known = new Set([...material.matchAll(MONEY)].map((match) => wonOf(match[0])))
  return line.replace(MONEY, (whole) => (known.has(wonOf(whole)) ? ' ' : whole))
}

export const findMissingTokens = (line: string, material: string) => {
  const haystack = normalize(material)
  const comparable = withoutKnownMoney(withoutKnownDates(line, material), material)
  return [...extractNumbers(comparable), ...extractNames(line)].filter(
    (token) => !haystack.includes(normalize(token)),
  )
}

const stripParticle = (word: string) => {
  for (const particle of PARTICLES) {
    if (word.length - particle.length >= 2 && word.endsWith(particle)) {
      return word.slice(0, -particle.length)
    }
  }
  return word
}

export const tokenize = (text: string) =>
  text
    .split(/[\s.,!?·()[\]{}"'“”‘’「」:;~-]+/)
    .map(stripParticle)
    .filter((word) => word.length >= 2)

const sameWord = (a: string, b: string) => {
  const shorter = a.length <= b.length ? a : b
  const longer = a.length <= b.length ? b : a
  return shorter.length >= 2 && longer.startsWith(shorter)
}

export const overlapRatio = (line: string, source: string) => {
  const lineWords = tokenize(line)
  if (lineWords.length === 0) return 0
  const sourceWords = tokenize(source)
  const matched = lineWords.filter((word) => sourceWords.some((sourceWord) => sameWord(word, sourceWord)))
  return matched.length / lineWords.length
}

// "끝낸 일"을 "앞으로 할 일"로 바꿔 쓰는 오류(시제 바꿈)를 잡기 위한 말. 근거 문장에 같은 말이 없는데 줄에만 있으면 확인할 곳이다.
export const FUTURE_WORDS = ['예정', '계획', '할 것입니다', '할 것이다', '하겠습니다', '하겠다']

export const hasUnbackedFuture = (line: string, source: string) => FUTURE_WORDS.some((word) => line.includes(word) && !source.includes(word))

export const hasUnbackedFlip = (line: string, source: string) =>
  FLIP_WORDS.some((word) => line.includes(word) && !source.includes(word))

export const checkLine = (
  line: string,
  sourceIds: number[],
  sentences: string[],
  minOverlap = SOURCE_OVERLAP_MIN,
): LineCheck => {
  const material = sentences.join('\n')
  const missingTokens = findMissingTokens(line, material)
  if (missingTokens.length > 0) {
    return { status: 'not_in_input', missingTokens, overlap: 0 }
  }

  const cited = sourceIds
    .map((id) => sentences[id - 1])
    .filter((sentence): sentence is string => Boolean(sentence))
  if (cited.length === 0) {
    return { status: 'needs_check', missingTokens: [], overlap: 0 }
  }

  const source = cited.join(' ')
  const overlap = overlapRatio(line, source)
  if (hasUnbackedFlip(line, source) || hasUnbackedFuture(line, source) || overlap < minOverlap) {
    return { status: 'needs_check', missingTokens: [], overlap }
  }
  return { status: 'has_source', missingTokens: [], overlap }
}
