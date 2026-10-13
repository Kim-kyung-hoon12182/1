import Button from '@/components/Button'
import Card from '@/components/Card'
import { TextInput } from '@/components/Field'
import Icon from '@/components/Icon'
import Notice from '@/components/Notice'
import { useRuleCandidate } from '@/hooks/useRuleCandidate'
import { RULE_MAX } from '@/lib/limits'
import { editedPairs } from '@/lib/rules'
import type { OutputLine, Rule, Run, Task } from '@/types/task'

type RuleCandidateCardProps = {
  task: Task
  run: Run
  lines: OutputLine[]
  onAddRule: (rule: Rule) => void
}

const SHOWN_CHARS = 70
const shorten = (text: string) => (text.length > SHOWN_CHARS ? `${text.slice(0, SHOWN_CHARS)}…` : text)

// S4 규칙 추가 확인: 고친 내용을 다음에도 지킬 규칙으로 남길지 묻는다 (F-05)
export default function RuleCandidateCard({ task, run, lines, onAddRule }: RuleCandidateCardProps) {
  const candidate = useRuleCandidate(task, run, lines, onAddRule)
  // 어떤 고침에서 나온 규칙인지 보여 줘야 규칙이 낯선 사람도 이유를 안다
  const pairs = editedPairs(lines)
  const taughtCount = task.rules.filter((rule) => rule.source === 'edit').length

  if (candidate.phase === 'none' || candidate.phase === 'closed') return null

  if (candidate.phase === 'empty' || candidate.phase === 'duplicate') {
    return (
      <Card as="section" bordered role="status" className="flex items-start gap-2 text-body-sm text-on-surface-variant">
        <Icon name="info" className="text-[18px] text-outline" />
        {candidate.phase === 'empty'
          ? '이번에 고친 곳은 이 자료에만 해당해서 규칙 후보가 없어요.'
          : '이번에 고친 내용은 이미 있는 규칙과 같아서 후보를 만들지 않았어요.'}
      </Card>
    )
  }

  if (candidate.phase === 'loading') {
    return (
      <Card as="section" bordered role="status" data-tour="rule-candidate" className="flex items-center gap-2 text-body-sm text-on-surface-variant">
        <Icon name="auto_awesome" className="animate-pulse text-[18px] text-primary" />
        고친 내용에서 규칙 후보를 만들고 있어요.
      </Card>
    )
  }

  if (candidate.phase === 'added') {
    return (
      <Card as="section" bordered role="status" data-tour="rule-added" className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary">
          <Icon name="bookmark" className="text-[18px]" />
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <h3 className="text-headline-sm">내가 가르친 규칙이 {taughtCount}개가 됐어요</h3>
          <p className="text-body-sm text-on-surface-variant">
            "{candidate.text.trim()}"를 다음 실행부터 AI에게 보내요. 규칙은 [내 작업]에서 고치거나 지울 수 있어요.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card as="section" bordered data-tour="rule-candidate" className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary">
          <Icon name="rule" className="text-[22px]" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="text-headline-sm">다음에도 이렇게 할까요?</h3>
          <p className="text-body-sm text-on-surface-variant">
            {candidate.manual
              ? '규칙 후보를 만들지 못했어요. 다음에도 적용할 내용을 한 줄로 적어 주세요.'
              : '고친 내용에서 뽑은 규칙 후보예요. 고쳐서 추가할 수 있고, 추가한 규칙만 다음 실행부터 반영돼요.'}
          </p>
        </div>
      </div>

      {pairs.length > 0 && (
        <div className="space-y-1.5 rounded-lg bg-surface-low p-3 text-body-sm">
          <p className="text-label-md text-secondary">
            이렇게 고쳤어요{pairs.length > 1 ? ` (${pairs.length}곳 중 첫 번째)` : ''}
          </p>
          <p className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 rounded bg-neutral-soft px-1.5 text-label-sm text-neutral-text">전</span>
            <span className="text-on-surface-variant line-through decoration-outline">{shorten(pairs[0].before)}</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 rounded bg-primary-fixed px-1.5 text-label-sm text-on-primary-fixed">후</span>
            <span>{shorten(pairs[0].after)}</span>
          </p>
        </div>
      )}

      <TextInput
        value={candidate.text}
        maxLength={RULE_MAX}
        aria-label="규칙 후보"
        placeholder="예: 금액은 만 원 단위로 쓴다"
        onChange={(event) => candidate.setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
            event.preventDefault()
            candidate.add()
          }
        }}
      />
      {candidate.duplicate && <p className="text-body-sm text-flag-text">이미 있는 규칙이에요.</p>}

      {run.isSample && (
        <Notice tone="info" icon="info">
          체험용 예시 결과는 규칙을 더해도 바뀌지 않아요. 직접 만든 작업에서는 다음 실행부터 반영돼요.
        </Notice>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button onClick={candidate.dismiss}>이번만</Button>
        <Button variant="primary" icon="add" data-tour="rule-add" disabled={!candidate.canAdd} onClick={candidate.add}>
          규칙 추가
        </Button>
      </div>
    </Card>
  )
}
