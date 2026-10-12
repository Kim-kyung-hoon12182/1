import Badge from '@/components/Badge'
import Card from '@/components/Card'
import Button from '@/components/Button'
import IconButton from '@/components/IconButton'
import type { RunSession } from '@/hooks/useRunSession'
import { cn } from '@/lib/cn'
import { lineProps, revealDelay } from './lineProps'
import StatusLabel from './StatusLabel'

type CompactLineProps = {
  index: number
  session: RunSession
}

// 확인할 곳이 아닌 줄은 한 줄로 줄여 둔다. 누르면 펼쳐서 참고한 자료와 규칙을 보여 준다.
export default function CompactLine({ index, session }: CompactLineProps) {
  const line = session.lines[index]

  // 삭제한 줄: 취소선으로 접어 두고 [되돌리기]만 남긴다
  if (line.deleted) {
    return (
      <Card
        as="li"
        padding="none"
        className={cn('flex items-center gap-3 border-l-4 border-transparent bg-surface-low px-4 py-3', session.revealing && 'animate-result-in')}
      >
        <Badge size="md" className="text-secondary">
          {String(index + 1).padStart(2, '0')}
        </Badge>
        <p className="min-w-0 flex-1 text-body-md leading-snug text-on-surface-variant line-through decoration-outline">{line.text}</p>
        <Badge size="md" icon="delete">
          삭제함
        </Badge>
        {!session.finished && (
          <Button size="sm" variant="ghost" onClick={() => session.restoreLine(index)}>
            되돌리기
          </Button>
        )}
      </Card>
    )
  }

  return (
    <Card
      as="li"
      padding="none"
      className={cn(
        'flex scroll-mt-40 cursor-pointer items-center gap-3 border-l-4 border-transparent px-4 py-3 transition-shadow hover:shadow-md',
        session.revealing && 'animate-result-in',
      )}
      style={session.revealing ? { animationDelay: `${revealDelay(index)}ms` } : undefined}
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
        <>
          <IconButton
            icon="edit"
            label={`${index + 1}번 줄 고치기`}
            onClick={(event) => {
              event.stopPropagation()
              session.startEdit(index)
            }}
          />
          <IconButton
            icon="delete"
            label={`${index + 1}번 줄 삭제`}
            onClick={(event) => {
              event.stopPropagation()
              session.deleteLine(index)
            }}
          />
        </>
      )}
    </Card>
  )
}
