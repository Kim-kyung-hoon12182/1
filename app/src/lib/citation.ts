import type { RawLine } from '@/lib/runPrompt'

const normalize = (text: string) => text.replace(/\s/g, '')

// 이보다 짧은 글은 여러 문장에 들어 있을 가능성이 커서 근거를 찾는 데 쓰지 않는다
const MIN_QUOTE_CHARS = 4
// 칸 단위로 나눠 찾을 때는 더 길어야 한다(짧은 칸은 흔한 말이라 엉뚱한 문장에 걸린다)
const MIN_PIECE_CHARS = 8

const matchesOf = (target: string, normalized: string[]) =>
  target.length < MIN_QUOTE_CHARS ? [] : normalized.flatMap((sentence, index) => (sentence.includes(target) ? [index + 1] : []))

// 통째로 찾고, 없으면 표의 칸(|)이나 쉼표 단위로 나눈 조각을 긴 것부터 찾는다
const firstMatches = (quote: string, normalized: string[]): number[] => {
  const whole = matchesOf(normalize(quote), normalized)
  if (whole.length > 0) return whole
  const pieces = quote
    .split(/[|·]/)
    .map(normalize)
    .filter((piece) => piece.length >= MIN_PIECE_CHARS)
    .sort((a, b) => b.length - a.length)
  for (const piece of pieces) {
    const found = matchesOf(piece, normalized)
    if (found.length > 0) return found
  }
  return []
}

// AI는 긴 자료에서 "몇 번째 문장인지"를 자주 틀리지만(배포 실험: 251문장 자료에서 번호가 맞은 줄 24줄 중 1줄), 문장의 글을 그대로 옮기는 건 잘한다.
// 그래서 AI가 옮긴 글(quotes)이 자료의 어느 문장에 들어 있는지를 앱이 찾아 번호로 바꾸고, 못 찾으면 AI가 준 번호를 그대로 쓴다.
export const resolveSourceIds = (modelIds: number[], quotes: string[] | undefined, sentences: string[]): number[] => {
  const normalized = sentences.map(normalize)
  const found = new Set<number>()

  for (const quote of quotes ?? []) {
    // 옮긴 글이 문장 하나에 통째로 들어 있지 않을 수 있다(표의 여러 칸, 문장 나누기에서 갈라진 곳). 통째로 못 찾으면 칸 단위로 찾는다.
    const matches = firstMatches(quote, normalized)
    if (matches.length === 0) continue

    if (matches.length === 1) {
      found.add(matches[0])
      continue
    }
    // 여러 문장에 같은 글이 있으면 AI가 준 번호와 겹치는 것을, 없으면 AI가 준 번호에 가장 가까운 것을 쓴다
    const agreed = matches.filter((id) => modelIds.includes(id))
    if (agreed.length > 0) agreed.forEach((id) => found.add(id))
    else if (modelIds.length > 0) {
      const distance = (id: number) => Math.min(...modelIds.map((modelId) => Math.abs(modelId - id)))
      found.add(matches.reduce((best, id) => (distance(id) < distance(best) ? id : best)))
    } else found.add(matches[0])
  }

  return found.size > 0 ? [...found].sort((a, b) => a - b) : modelIds
}

// 줄마다 근거 번호를 옮긴 글로 바로잡고, 저장하지 않을 sourceQuotes는 뺀다
export const withResolvedSources = (lines: RawLine[], sentences: string[]): RawLine[] =>
  lines.map(({ sourceQuotes, ...line }) => ({ ...line, sourceIds: resolveSourceIds(line.sourceIds, sourceQuotes, sentences) }))
