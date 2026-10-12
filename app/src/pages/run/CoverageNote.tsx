import Icon from '@/components/Icon'
import type { RunSession } from '@/hooks/useRunSession'
import { coverageOf } from '@/lib/coverage'
import { circled } from '@/lib/material'

// 결과의 어느 줄도 참고하지 않은 자료 문장을 모아 보여 준다. 빠뜨렸다는 판정이 아니라 직접 확인해 보라는 목록이다 (I-20).
export default function CoverageNote({ session }: { session: RunSession }) {
  const { lines, sentences, scrollToSentence } = session
  const { total, referenced, unreferenced } = coverageOf(lines, sentences)
  if (total === 0) return null

  if (unreferenced.length === 0) {
    return (
      <p className="flex items-center gap-1.5 px-1 text-label-sm text-on-surface-variant">
        <Icon name="fact_check" className="text-[15px] text-primary" />
        자료 {total}문장 모두 어딘가에서 참고됐어요. 내용을 빠짐없이 옮겼다는 뜻은 아니에요.
      </p>
    )
  }

  return (
    <details className="group rounded-lg border border-outline-variant bg-surface-low p-2.5 text-label-sm">
      <summary className="flex cursor-pointer list-none items-center gap-1 font-semibold">
        <Icon name="fact_check" className="text-[15px] text-primary" />
        자료 {total}문장 중 {referenced}문장을 참고했어요 · 참고하지 않은 자료 {unreferenced.length}문장 보기
        <Icon name="expand_more" className="ml-auto text-[18px] transition-transform group-open:rotate-180" />
      </summary>
      <p className="mt-2 text-on-surface-variant">
        일부러 뺀 내용이면 괜찮아요. 빠뜨린 내용이 있는지 확인해 보세요. 앱은 빠진 내용을 판정하지 못해요.
      </p>
      <ul className="mt-2 space-y-1">
        {unreferenced.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => scrollToSentence(item.id)}
              className="flex w-full items-start gap-2 rounded px-1.5 py-1 text-left text-body-sm hover:bg-surface-high"
            >
              <span className="shrink-0 text-secondary">자료 {circled(item.id)}</span>
              <span className="min-w-0 flex-1">{item.text}</span>
              <Icon name="arrow_outward" className="mt-0.5 shrink-0 text-[14px] text-primary" />
            </button>
          </li>
        ))}
      </ul>
    </details>
  )
}
