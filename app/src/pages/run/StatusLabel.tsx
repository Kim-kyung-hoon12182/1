import type { ReactNode } from 'react'
import Badge from '@/components/Badge'
import Tooltip from '@/components/Tooltip'
import { circled } from '@/lib/material'
import type { OutputLine } from '@/types/task'
import { LEGEND } from './copy'

type StatusLabelProps = Pick<OutputLine, 'status' | 'sourceIds' | 'missingTokens'> & {
  /** 자료 문장. 있으면 "참고한 곳"에 올렸을 때 그 문장을 바로 보여 준다 */
  sentences?: string[]
  /** 좁은 화면(sm 미만)에서는 아이콘만 보여 글이 들어갈 자리를 남긴다. 글자는 화면 읽기 프로그램에는 남는다 */
  compact?: boolean
}

const SHOWN_CITED = 2
const CITED_CHARS = 90

const legendOf = (status: OutputLine['status']) => LEGEND.find((item) => item.status === status)?.body ?? ''

// 결과 줄의 상태. 색만으로 구분하지 않도록 글자와 아이콘을 함께 쓴다.
export default function StatusLabel({ status, sourceIds, missingTokens, sentences = [], compact = false }: StatusLabelProps) {
  const text = (value: string): ReactNode => (compact ? <span className="sr-only sm:not-sr-only">{value}</span> : value)

  if (status === 'has_source') {
    const cited = sourceIds.flatMap((id) => (sentences[id - 1] ? [{ id, text: sentences[id - 1] }] : [])).slice(0, SHOWN_CITED)
    return (
      <Tooltip
        content={
          <span className="block space-y-1">
            {cited.map((item) => (
              <span key={item.id} className="block">
                <span className="text-secondary">자료 {circled(item.id)}</span> {item.text.length > CITED_CHARS ? `${item.text.slice(0, CITED_CHARS)}…` : item.text}
              </span>
            ))}
            <span className="block text-secondary">{legendOf('has_source')}</span>
          </span>
        }
      >
        <Badge tone="muted" size="md" pill icon="link">
          {text(`참고한 곳 ${sourceIds.map(circled).join(' ')}`)}
        </Badge>
      </Tooltip>
    )
  }
  if (status === 'heading') {
    return (
      <Tooltip content={legendOf('heading')}>
        <Badge size="md" pill icon="title">
          {text('제목')}
        </Badge>
      </Tooltip>
    )
  }
  if (status === 'not_in_input') {
    return (
      <Tooltip content={legendOf('not_in_input')}>
        <Badge tone="flag" size="md" pill icon="error">
          {text(`자료에 없음: ${missingTokens.join(', ')}`)}
        </Badge>
      </Tooltip>
    )
  }
  return (
    <Tooltip content={legendOf('needs_check')}>
      <Badge tone="flagSoft" size="md" pill icon="warning" className="font-semibold">
        {text('근거 확인 필요')}
      </Badge>
    </Tooltip>
  )
}
