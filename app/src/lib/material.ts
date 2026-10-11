export const MAX_MATERIAL_CHARS = 8000

export const splitSentences = (text: string) =>
  text
    .split(/\n+|(?<=[.!?。])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)

const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳'

export const circled = (n: number) => (n >= 1 && n <= CIRCLED.length ? CIRCLED[n - 1] : `(${n})`)
