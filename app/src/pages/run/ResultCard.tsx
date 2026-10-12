import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Card from '@/components/Card'
import { TextArea } from '@/components/Field'
import Icon from '@/components/Icon'
import Notice from '@/components/Notice'
import type { RunSession } from '@/hooks/useRunSession'
import { cn } from '@/lib/cn'
import { splitByTokens } from '@/lib/highlight'
import { circled } from '@/lib/material'
import { citedSentences, describeReason, isFlagged } from '@/lib/run'
import type { Task } from '@/types/task'
import CompactLine from './CompactLine'
import { lineProps } from './lineProps'
import StatusLabel from './StatusLabel'

type ResultCardProps = {
  index: number
  task: Task
  session: RunSession
}

// 결과 한 줄. 확인할 곳이거나 고른 줄이면 펼치고, 아니면 한 줄로 줄여서 보여 준다.
export default function ResultCard({ index, task, session }: ResultCardProps) {
  const { sentences, selected, editing } = session
  const line = session.lines[index]
  const isSelected = selected === index
  const flagged = isFlagged(line)

  if (!flagged && !isSelected && editing !== index) return <CompactLine index={index} session={session} />
  const appliedRules = task.rules.filter((rule) => line.ruleIds.includes(rule.id))
  const cited = citedSentences(line, sentences)

  return (
    <Card
      as="li"
      {...lineProps(session, index, isSelected)}
      className={cn(
        'flex scroll-mt-40 cursor-pointer flex-col gap-3 border-l-4 transition-shadow',
        flagged ? 'border-flag-bar' : 'border-transparent',
        isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge size="md" className="text-secondary">
              {String(index + 1).padStart(2, '0')}
            </Badge>
            {line.editedText !== undefined && (
              <Badge size="md" tone="primary">
                고침
              </Badge>
            )}
          </div>
          {appliedRules.length > 0 && (
            <div className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
              <Icon name="rule" className="text-[14px] text-secondary" />
              적용된 규칙: {appliedRules.map((rule) => rule.text).join(' · ')}
            </div>
          )}
        </div>
        <StatusLabel status={line.status} sourceIds={line.sourceIds} missingTokens={line.missingTokens} />
      </div>

      {editing === index ? (
        <TextArea
          autoFocus
          tone="paper"
          rows={2}
          defaultValue={line.editedText ?? line.text}
          aria-label={`${index + 1}번 줄 고치기`}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => session.trackDraft(index, event.target.value)}
          onBlur={(event) => session.finishEdit(index, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault()
              event.currentTarget.blur()
            }
          }}
          className="resize-none p-3.5 ring-2 ring-primary"
        />
      ) : (
        <p className="rounded-lg bg-background p-3.5 text-body-md leading-relaxed">
          {line.editedText !== undefined
            ? line.editedText
            : splitByTokens(line.text, line.status === 'not_in_input' ? line.missingTokens : []).map((part, i) =>
                part.mark ? (
                  <mark
                    key={i}
                    title="자료에서 찾지 못한 값"
                    className="rounded-sm bg-flag-tint px-0.5 font-semibold text-flag-ink underline decoration-flag-icon decoration-2 underline-offset-4"
                  >
                    {part.text}
                  </mark>
                ) : (
                  part.text
                ),
              )}
        </p>
      )}

      {flagged && (
        <Notice tone="flag" icon="notification_important" className="p-3.5">
          <p className="leading-snug">
            <strong className="font-semibold text-flag-text">확인할 곳:</strong> {describeReason(line, sentences)}
          </p>
        </Notice>
      )}

      <div className="space-y-2 rounded-lg bg-surface-low p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-label-md text-secondary">
            <Icon name="menu_book" className="text-[16px]" />
            {cited.length > 0 ? `참고한 자료: ${cited.map((item) => circled(item.id)).join(' ')}` : '참고한 자료가 없어요'}
          </div>
          {cited.length > 0 && (
            <button
              type="button"
              data-tour="source-link"
              onClick={(event) => {
                event.stopPropagation()
                session.select(index)
                session.scrollToSentence(cited[0].id)
              }}
              className="inline-flex items-center gap-0.5 text-label-sm text-primary hover:underline"
            >
              자료에서 보기
              <Icon name="arrow_outward" className="text-[13px]" />
            </button>
          )}
        </div>
        {cited.map((item) => (
          <blockquote key={item.id} className="border-l-2 border-neutral-line pl-3 text-body-sm italic text-on-surface-variant">
            “{item.text}”
          </blockquote>
        ))}
      </div>

      <div className="flex items-center justify-end gap-1.5">
        {!flagged && editing !== index && (
          <Button
            size="sm"
            variant="ghost"
            icon="unfold_less"
            onClick={(event) => {
              event.stopPropagation()
              session.select(null)
            }}
          >
            접기
          </Button>
        )}
        {!session.finished && line.editedText !== undefined && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation()
              session.revertLine(index)
            }}
          >
            되돌리기
          </Button>
        )}
        {!session.finished && (
          <Button
            size="sm"
            icon="edit"
            className="px-3 py-1.5"
            onClick={(event) => {
              event.stopPropagation()
              session.startEdit(index)
            }}
          >
            고치기
          </Button>
        )}
      </div>
    </Card>
  )
}
