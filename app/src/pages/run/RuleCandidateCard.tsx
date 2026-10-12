import Button from '@/components/Button'
import Card from '@/components/Card'
import { TextInput } from '@/components/Field'
import Icon from '@/components/Icon'
import Notice from '@/components/Notice'
import { useRuleCandidate } from '@/hooks/useRuleCandidate'
import { RULE_MAX } from '@/lib/limits'
import type { OutputLine, Rule, Run, Task } from '@/types/task'

type RuleCandidateCardProps = {
  task: Task
  run: Run
  lines: OutputLine[]
  onAddRule: (rule: Rule) => void
}

// S4 규칙 추가 확인: 고친 내용을 다음에도 지킬 규칙으로 남길지 묻는다 (F-05)
export default function RuleCandidateCard({ task, run, lines, onAddRule }: RuleCandidateCardProps) {
  const candidate = useRuleCandidate(task, run, lines, onAddRule)

  if (candidate.phase === 'none' || candidate.phase === 'closed') return null

  if (candidate.phase === 'loading') {
    return (
      <Card as="section" bordered role="status" className="flex items-center gap-2 text-body-sm text-on-surface-variant">
        <Icon name="auto_awesome" className="animate-pulse text-[18px] text-primary" />
        고친 내용에서 규칙 후보를 만들고 있어요.
      </Card>
    )
  }

  if (candidate.phase === 'added') {
    return (
      <Card as="section" bordered role="status" className="flex items-center gap-2 text-body-sm font-semibold text-primary">
        <Icon name="rule" className="text-[18px]" />
        규칙에 추가했어요. 다음 실행부터 이 규칙을 지켜 글을 써요.
      </Card>
    )
  }

  return (
    <Card as="section" bordered className="space-y-3">
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
        <Button variant="primary" icon="add" disabled={!candidate.canAdd} onClick={candidate.add}>
          규칙 추가
        </Button>
      </div>
    </Card>
  )
}
