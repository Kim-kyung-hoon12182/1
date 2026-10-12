import Icon from '@/components/Icon'
import type { RunSession } from '@/hooks/useRunSession'
import { coverageOf } from '@/lib/coverage'
import { circled } from '@/lib/material'

// 참고 범위 팝오버 안: 결과의 어느 줄도 참고하지 않은 자료 문장. 빠뜨렸다는 판정이 아니라 직접 확인해 보라는 목록이다 (I-20).
// 표 구분선·제목 같은 내용 없는 줄은 세지 않고, 자료를 줄여 쓴 요약이면 목록 대신 안내만 한다.
export default function CoverageNote({ session }: { session: RunSession }) {
  const { lines, sentences, scrollToSentence } = session
  const { total, referenced, unreferenced, resultLines, summary } = coverageOf(lines, sentences)

  if (total === 0) return <p>참고 범위를 셀 자료가 없어요.</p>

  if (summary) {
    return (
      <p className="text-on-surface-variant">
        자료 {total}문장을 {resultLines}줄로 줄여 쓴 요약이에요. 줄마다 대표 근거만 표시해서 참고 표시가 있는 문장은 {referenced}개예요. 줄인 만큼 빠진 내용이 있는 게 당연하니, 꼭 필요한 내용이 들어갔는지는 직접 확인해 주세요.
      </p>
    )
  }

  if (unreferenced.length === 0) {
    return <p className="text-on-surface-variant">자료 {total}문장 모두 어딘가에서 참고됐어요. 내용을 빠짐없이 옮겼다는 뜻은 아니에요.</p>
  }

  return (
    <div className="space-y-2">
      <p className="font-semibold">
        자료 {total}문장 중 {referenced}문장을 참고했어요 · 참고하지 않은 자료 {unreferenced.length}문장
      </p>
      <p className="text-on-surface-variant">일부러 뺀 내용이면 괜찮아요. 빠뜨린 내용이 있는지 확인해 보세요. 앱은 빠진 내용을 판정하지 못해요.</p>
      <ul className="max-h-56 space-y-1 overflow-y-auto">
        {unreferenced.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => scrollToSentence(item.id, true)}
              className="flex w-full items-start gap-2 rounded px-1.5 py-1 text-left hover:bg-surface-high"
            >
              <span className="shrink-0 text-secondary">자료 {circled(item.id)}</span>
              <span className="min-w-0 flex-1">{item.text}</span>
              <Icon name="arrow_outward" className="mt-0.5 shrink-0 text-[14px] text-primary" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
