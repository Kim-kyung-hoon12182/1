export type LineStatus = 'has_source' | 'not_in_input' | 'needs_check'

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

export const findMissingTokens = (line: string, material: string) => {
  const haystack = normalize(material)
  return [...extractNumbers(line), ...extractNames(line)].filter(
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
  if (hasUnbackedFlip(line, source) || overlap < minOverlap) {
    return { status: 'needs_check', missingTokens: [], overlap }
  }
  return { status: 'has_source', missingTokens: [], overlap }
}
