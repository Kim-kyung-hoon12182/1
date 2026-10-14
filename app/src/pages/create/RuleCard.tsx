import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Card from '@/components/Card'
import { TextInput } from '@/components/Field'
import FreeformToggle from '@/components/FreeformToggle'
import IconButton from '@/components/IconButton'
import { RULE_MAX } from '@/lib/limits'
import type { Rule } from '@/types/task'
import { RULE_LABEL, RULE_PLACEHOLDER } from './copy'

type RuleCardProps = {
  rule: Rule
  index: number
  /** "AI 제안", "직접 추가" 같은 출처 표시 */
  originLabel: string | null
  /** 연필로 고치는 중인지 */
  isEditing: boolean
  onChange: (text: string) => void
  onSetFreeform: (freeform: boolean) => void
  onRemove: () => void
  onStartEdit: () => void
  onCancelEdit: () => void
  onFinishEdit: () => void
}

// 규칙 하나. 글이 비어 있으면(직접 적을 칸) 바로 입력칸으로 보인다.
export default function RuleCard({
  rule,
  index,
  originLabel,
  isEditing,
  onChange,
  onSetFreeform,
  onRemove,
  onStartEdit,
  onCancelEdit,
  onFinishEdit,
}: RuleCardProps) {
  const isBlank = rule.text.trim() === ''
  const number = index + 1

  if (isEditing || isBlank) {
    return (
      <Card as="li" elevation="md" className="flex flex-col gap-3 ring-2 ring-primary">
        <div className="flex items-center gap-2">
          <Badge pill tone="solid" className="font-semibold">
            {isEditing ? '현재 고치는 중' : '규칙을 적어 주세요'}
          </Badge>
          <span className="text-label-sm text-primary">규칙 #{number}</span>
        </div>
        <div className="rounded-lg bg-surface-low p-3">
          <label htmlFor={`rule-${rule.id}`} className="mb-1 block text-label-md font-semibold">
            {RULE_LABEL}
          </label>
          <TextInput
            id={`rule-${rule.id}`}
            tone="lowest"
            className="h-10"
            autoFocus={isEditing}
            value={rule.text}
            maxLength={RULE_MAX}
            placeholder={RULE_PLACEHOLDER}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.nativeEvent.isComposing && !isBlank) {
                event.preventDefault()
                onFinishEdit()
              }
            }}
          />
        </div>
        <FreeformToggle checked={rule.freeform === true} label={`규칙 ${number}`} onChange={onSetFreeform} />
        <div className="flex items-center justify-between gap-2">
          <Button size="sm" variant="ghost" icon="delete" className="py-1.5 hover:text-flag-icon" onClick={onRemove}>
            삭제
          </Button>
          {isEditing && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="px-4 py-1.5" onClick={onCancelEdit}>
                변경 취소
              </Button>
              <Button size="sm" variant="primary" className="px-5 py-1.5" disabled={isBlank} onClick={onFinishEdit}>
                수정 완료
              </Button>
            </div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card as="li" className="flex items-start gap-3 transition-shadow hover:shadow">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-surface text-label-md text-secondary">
        {number}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-label-sm text-secondary">규칙 #{number}</span>
          {originLabel && (
            <Badge tone="primary" className="bg-surface-high font-semibold text-primary">
              {originLabel}
            </Badge>
          )}
        </div>
        <p className="text-headline-sm leading-snug">{rule.text}</p>
        <FreeformToggle checked={rule.freeform === true} label={`규칙 ${number}`} onChange={onSetFreeform} />
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <IconButton icon="edit" label={`규칙 ${number} 고치기`} onClick={onStartEdit} />
        <IconButton icon="delete" label={`규칙 ${number} 삭제`} danger onClick={onRemove} />
      </div>
    </Card>
  )
}
