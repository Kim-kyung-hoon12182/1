export const MAX_MATERIAL_CHARS = 8000

// 줄바꿈과 문장 끝(. ! ?) 뒤 공백에서 자른다. 숫자 바로 뒤의 점은 문장 끝으로 보지 않는다(점으로 쓴 날짜 "2026. 10. 19.", 목록 번호 "1. 첫째").
export const splitSentences = (text: string) =>
  text
    .split(/\n+|(?<=[.!?。])(?<!\d\.)\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)

const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳'

export const circled = (n: number) => (n >= 1 && n <= CIRCLED.length ? CIRCLED[n - 1] : `(${n})`)
