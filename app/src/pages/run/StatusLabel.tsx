import Badge from '@/components/Badge'
import { circled } from '@/lib/material'
import type { OutputLine } from '@/types/task'

type StatusLabelProps = Pick<OutputLine, 'status' | 'sourceIds' | 'missingTokens'>

// 결과 줄의 상태. 색만으로 구분하지 않도록 글자와 아이콘을 함께 쓴다.
export default function StatusLabel({ status, sourceIds, missingTokens }: StatusLabelProps) {
  if (status === 'has_source') {
    return (
      <Badge
        tone="muted"
        size="md"
        pill
        icon="link"
        title="AI가 이 줄의 근거라고 참고한 자료예요. 뜻이 맞는지는 확인하지 않았어요"
      >
        참고한 곳 {sourceIds.map(circled).join(' ')}
      </Badge>
    )
  }
  if (status === 'heading') {
    return (
      <Badge size="md" pill icon="title" title="내용이 아니라 구분용 제목이라 자료와 맞춰 보지 않았어요">
        제목
      </Badge>
    )
  }
  if (status === 'not_in_input') {
    return (
      <Badge tone="flag" size="md" pill icon="error">
        자료에 없음: {missingTokens.join(', ')}
      </Badge>
    )
  }
  return (
    <Badge tone="flagSoft" size="md" pill icon="warning" className="font-semibold">
      근거 확인 필요
    </Badge>
  )
}
