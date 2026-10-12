import { checkLine } from './evidence.ts'
import { isHeading } from './heading.ts'
import { hasUnknownMark } from './unknownMark.ts'
import type { OutputLine } from '../types/task.ts'

// 한 줄의 글에 같은 검사를 붙인다. 소제목, AI가 스스로 [확인 필요]라고 적은 줄, 그 밖의 줄 순서로 본다 (F-04)
export const statusOfText = (text: string, sourceIds: number[], sentences: string[]): Pick<OutputLine, 'status' | 'missingTokens'> =>
  isHeading(text)
    ? { status: 'heading', missingTokens: [] }
    : hasUnknownMark(text)
      ? // AI가 스스로 모른다고 적은 줄은 근거 번호가 있어도 확인할 곳이다
        { status: 'needs_check', missingTokens: [] }
      : checkLine(text, sourceIds, sentences)

// 사용자가 줄을 고치면 고친 글로 다시 검사한다(고쳤는데도 경고가 남아 있지 않게). 되돌리면(editedText가 없으면) AI가 쓴 글의 판정으로 돌아간다.
export const withEditedText = (line: OutputLine, editedText: string | undefined, sentences: string[]): OutputLine => {
  if (editedText === undefined) {
    const { aiStatus, ...rest } = line
    return { ...rest, editedText: undefined, ...(aiStatus ?? {}) }
  }
  const aiStatus = line.aiStatus ?? { status: line.status, missingTokens: line.missingTokens }
  // 사용자가 직접 쓴 글은 겹침·시제·뒤집힘 같은 AI용 의심으로는 다시 걸지 않는다. 자료에 없는 숫자·이름과 [확인 필요]만 남긴다.
  const checked = statusOfText(editedText, line.sourceIds, sentences)
  const next = checked.status === 'needs_check' && checked.missingTokens.length === 0 && !hasUnknownMark(editedText) ? { status: 'has_source' as const, missingTokens: [] } : checked
  return { ...line, editedText, aiStatus, ...next }
}
