export type MissingSentence = { id: number; text: string }

export type Coverage = {
  /** 내용이 있는 자료 문장 수(표 구분선, 제목, 너무 짧은 줄은 뺀다) */
  total: number
  referenced: number
  /** 결과의 어느 줄도 참고하지 않은 자료 문장. 빠뜨렸다는 판정이 아니라 확인해 보라는 목록이다 */
  unreferenced: MissingSentence[]
  /** 삭제하지 않은 결과 내용 줄 수(소제목 제외) */
  resultLines: number
  /** 자료를 훨씬 적은 줄로 줄여 쓴 요약이면 true. 줄마다 대표 근거만 달려서 참고한 문장이 적게 나오는 게 정상이다 */
  summary: boolean
}

// 내용 없는 줄: 표 구분선(| --- |), 마크다운 제목(## ...), 장식뿐이거나 4글자 미만인 줄
export const isNoiseSentence = (text: string) => {
  const trimmed = text.trim()
  return /^\|?[\s|:-]+\|?$/.test(trimmed) || /^#{1,6}\s/.test(trimmed) || trimmed.replace(/[\s|*#>·\-:]/g, '').length < 4
}

// 줄 수가 내용 있는 문장 수의 절반에 못 미치면 요약으로 본다(자료가 너무 짧을 때는 판단하지 않는다)
const SUMMARY_RATIO = 0.5
const SUMMARY_MIN_SENTENCES = 10

// 결과 줄(삭제한 줄은 뺀다)이 근거로 단 자료 번호를 모아서 내용 있는 자료 문장 중 몇 개가 참고됐는지 센다.
export const coverageOf = (lines: { sourceIds: number[]; deleted?: boolean; status?: string }[], sentences: string[]): Coverage => {
  const alive = lines.filter((line) => !line.deleted)
  const cited = new Set(alive.flatMap((line) => line.sourceIds))
  const content = sentences.flatMap((text, index) => (isNoiseSentence(text) ? [] : [{ id: index + 1, text }]))
  const unreferenced = content.filter((sentence) => !cited.has(sentence.id))
  const resultLines = alive.filter((line) => line.status !== 'heading').length
  return {
    total: content.length,
    referenced: content.length - unreferenced.length,
    unreferenced,
    resultLines,
    summary: content.length >= SUMMARY_MIN_SENTENCES && resultLines < content.length * SUMMARY_RATIO,
  }
}
