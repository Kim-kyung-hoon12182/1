export type TextPart = { text: string; mark: boolean }

// 자료에서 찾지 못한 값이 줄 안 어디에 있는지 나눈다. 못 찾은 값은 나눌 수 없으니 줄 전체를 그대로 돌려준다.
export const splitByTokens = (text: string, tokens: string[]): TextPart[] => {
  const wanted = [...new Set(tokens.map((token) => token.trim()).filter(Boolean))].sort((a, b) => b.length - a.length)
  const ranges: [number, number][] = []
  for (const token of wanted) {
    let from = 0
    for (let at = text.indexOf(token, from); at !== -1; at = text.indexOf(token, from)) {
      const end = at + token.length
      if (!ranges.some(([start, stop]) => at < stop && end > start)) ranges.push([at, end])
      from = end
    }
  }
  if (ranges.length === 0) return [{ text, mark: false }]
  ranges.sort((a, b) => a[0] - b[0])

  const parts: TextPart[] = []
  let cursor = 0
  for (const [start, end] of ranges) {
    if (start > cursor) parts.push({ text: text.slice(cursor, start), mark: false })
    parts.push({ text: text.slice(start, end), mark: true })
    cursor = end
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), mark: false })
  return parts
}
