import Badge from '@/components/Badge'
import Card from '@/components/Card'
import IconButton from '@/components/IconButton'
import type { RunSession } from '@/hooks/useRunSession'
import { lineProps } from './lineProps'
import StatusLabel from './StatusLabel'

type CompactLineProps = {
  index: number
  session: RunSession
}

// 확인할 곳이 아닌 줄은 한 줄로 줄여 둔다. 누르면 펼쳐서 참고한 자료와 규칙을 보여 준다.
export default function CompactLine({ index, session }: CompactLineProps) {
  const line = session.lines[index]

  return (
    <Card
      as="li"
      padding="none"
      className="flex scroll-mt-40 cursor-pointer items-center gap-3 border-l-4 border-transparent px-4 py-3 transition-shadow hover:shadow-md"
      {...lineProps(session, index, false)}
    >
      <Badge size="md" className="text-secondary">
        {String(index + 1).padStart(2, '0')}
      </Badge>
      <p className="min-w-0 flex-1 text-body-md leading-snug">{line.editedText ?? line.text}</p>
      {line.editedText !== undefined && (
        <Badge size="md" tone="primary">
          고침
        </Badge>
      )}
      <StatusLabel status={line.status} sourceIds={line.sourceIds} missingTokens={line.missingTokens} />
      {!session.finished && (
        <IconButton
          icon="edit"
          label={`${index + 1}번 줄 고치기`}
          onClick={(event) => {
            event.stopPropagation()
            session.startEdit(index)
          }}
        />
      )}
    </Card>
  )
}
