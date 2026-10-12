// AI가 자료에서 알 수 없다고 직접 적은 표시. 프롬프트가 "모르는 부분은 [확인 필요]라고 쓰세요"라고 시킨다.
export const UNKNOWN_MARK = '[확인 필요]'

export const hasUnknownMark = (text: string) => text.includes(UNKNOWN_MARK)
