export type MissingSentence = { id: number; text: string }

export type Coverage = {
  total: number
  referenced: number
  /** 결과의 어느 줄도 참고하지 않은 자료 문장. 빠뜨렸다는 판정이 아니라 확인해 보라는 목록이다 */
  unreferenced: MissingSentence[]
}

// 결과 줄(삭제한 줄은 뺀다)이 근거로 단 자료 번호를 모아서 자료 문장 중 몇 개가 참고됐는지 센다.
export const coverageOf = (lines: { sourceIds: number[]; deleted?: boolean }[], sentences: string[]): Coverage => {
  const cited = new Set(lines.filter((line) => !line.deleted).flatMap((line) => line.sourceIds))
  const unreferenced = sentences.flatMap((text, index) => (cited.has(index + 1) ? [] : [{ id: index + 1, text }]))
  return { total: sentences.length, referenced: sentences.length - unreferenced.length, unreferenced }
}
