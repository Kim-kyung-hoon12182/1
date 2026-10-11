const MAX_HEADING_CHARS = 20
const MARKER = /^(?:#{1,6}\s+|[■▶●◆▪]\s*|\d+[.)]\s+)/
const WRAPPED = /^[[【(].+[\]】)]$/
const SENTENCE_END = /(?:[.!?。]|다|요|죠|까)[\s\])】]*$/

// 소제목 줄인지 본다. 주장이 아니라 구분용 글이라 재료와 맞춰 볼 필요가 없다.
// 표시가 분명한 짧은 글만 인정한다: [제목], 1. 제목, # 제목, ■ 제목, 제목:
// 숫자가 있거나 문장으로 끝나면 내용일 수 있으니 소제목으로 보지 않는다.
export const isHeading = (text: string) => {
  const line = text.trim()
  if (!line || line.length > MAX_HEADING_CHARS) return false
  const marked = MARKER.test(line) || WRAPPED.test(line) || /[:：]$/.test(line)
  if (!marked) return false
  const body = line.replace(MARKER, '')
  return !/\d/.test(body) && !SENTENCE_END.test(body)
}
