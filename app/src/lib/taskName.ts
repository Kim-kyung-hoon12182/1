// 낱말 끝이 조사·어미인 경우만 적는다. "보고서"의 "서", "문의"의 "의"처럼 명사 끝은 넣지 않는다
const PARTICLE_END = /(?:는|면|에|에게|께|에서|으로|며)$/
const OBJECT_PARTICLE = /[을를]$/
const NAME_MAX = 20

// 첫 질문의 답에서 작업 이름 후보를 뽑는다. 못 뽑으면 앞부분을 자른다.
// 예: "매주 금요일에 팀장님께 보내는 주간 업무 보고서를 써요" → "주간 업무 보고서"
export const suggestTaskName = (what: string, max = NAME_MAX) => {
  const sentence = what.trim().split(/[.\n]/)[0].trim()
  // "...를 써요"처럼 목적어 뒤에서 자른다
  const words = sentence.split(/\s+/).filter(Boolean)
  const objectAt = words.findIndex((word) => OBJECT_PARTICLE.test(word))
  const phrase = objectAt === -1 ? words : [...words.slice(0, objectAt), words[objectAt].replace(OBJECT_PARTICLE, '')]
  // 뒤에서부터 조사가 붙지 않은 낱말만 이어 붙인다
  const kept: string[] = []
  for (let i = phrase.length - 1; i >= 0; i--) {
    const word = phrase[i]
    if (kept.length > 0 && PARTICLE_END.test(word)) break
    if (kept.length === 0 && PARTICLE_END.test(word) && phrase.length > 1) continue
    if ([word, ...kept].join(' ').length > max) break
    kept.unshift(word)
  }
  const name = kept.join(' ').replace(/[은는이가을를]$/, '')
  return name || sentence.slice(0, max)
}
