import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Card from '@/components/Card'
import { Field, TextInput } from '@/components/Field'
import Icon from '@/components/Icon'
import Notice from '@/components/Notice'
import { isUserAdded, type TaskDraft } from '@/hooks/useTaskDraft'
import { NAME_MAX, RULE_MAX } from '@/lib/limits'
import type { Rule } from '@/types/task'
import { RulesAside } from './Asides'
import { RECAP_FIELDS, RULE_LABEL } from './copy'
import RuleCard from './RuleCard'

// 2단계: AI가 만든 규칙을 확인하고 고쳐서 저장한다
export default function RulesStep({ draft }: { draft: TaskDraft }) {
  const ruleCount = draft.filledRules.length

  const originLabel = (rule: Rule) => {
    if (isUserAdded(rule)) return '직접 추가'
    if (draft.origin === 'ai') return 'AI 제안'
    return draft.origin === 'sample' ? '예시 규칙' : null
  }

  return (
    <div className="flex flex-col gap-6">
      <TaskRecap draft={draft} />

      <div className="flex flex-col items-start justify-between gap-3 rounded-xl bg-gradient-to-r from-surface-low via-surface-lowest to-surface-low p-5 shadow-sm md:flex-row md:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary shadow-sm">
            <Icon name="edit_note" className="text-[20px]" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-headline-sm">아래 규칙은 답한 내용으로 만든 초안이에요</h2>
            <p className="max-w-4xl text-body-sm leading-relaxed text-on-surface-variant">
              규칙은 글을 쓸 때 지킬 약속이고, 앱이 결과를 판단하는 기준은 아니에요. 맞지 않는 규칙은 지우거나 고치고, 빠진 규칙은 직접 추가하세요.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-lg bg-surface-lowest px-3 py-2 shadow-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="text-label-md font-semibold">규칙 {ruleCount}개</span>
        </div>
      </div>

      {draft.notice && (
        <Notice tone="flag" role="status">
          {draft.notice}
        </Notice>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-8">
          <Card padding="sm" className="flex items-center gap-2">
            <h3 className="text-headline-sm font-bold">규칙 목록</h3>
            <Badge pill tone="surface" className="font-semibold text-primary">
              {ruleCount}개
            </Badge>
            <span className="text-label-sm text-on-surface-variant">연필 아이콘으로 고치고, 휴지통으로 삭제해요.</span>
          </Card>

          <ul className="flex flex-col gap-2">
            {draft.rules.map((rule, index) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                index={index}
                originLabel={originLabel(rule)}
                isEditing={draft.editingId === rule.id}
                onChange={(text) => draft.updateRule(rule.id, text)}
                onRemove={() => draft.removeRule(rule.id)}
                onStartEdit={() => draft.startEdit(rule)}
                onCancelEdit={draft.cancelEdit}
                onFinishEdit={draft.finishEdit}
              />
            ))}
          </ul>

          <AddRuleCard draft={draft} />
        </div>

        <RulesAside ruleCount={ruleCount} />
      </div>

      <Card as="section" elevation="md" className="flex flex-col items-center justify-between gap-3 p-5 md:flex-row">
        <Button icon="arrow_back" className="w-full md:w-auto" onClick={() => draft.setPhase('questions')}>
          질문으로 돌아가기
        </Button>
        <p className="flex items-center gap-1.5 text-center text-body-sm text-on-surface-variant md:text-left">
          <Icon name="info" className="shrink-0 text-[18px] text-primary" />
          <span>
            <strong>[저장하고 실행]</strong>을 누르면 이 작업이 <strong>[내 작업]</strong>에 저장되고, 이어서 자료를 넣어 실행할 수 있어요.
          </span>
        </p>
        <Button
          variant="primary"
          size="lg"
          iconEnd
          icon="arrow_forward"
          className="w-full px-8 shadow-md md:w-auto"
          onClick={draft.save}
          disabled={!draft.canSave}
        >
          저장하고 실행
        </Button>
      </Card>
    </div>
  )
}

// 1단계에서 답한 내용을 요약하고 작업 이름을 정한다
function TaskRecap({ draft }: { draft: TaskDraft }) {
  return (
    <Card className="flex flex-col items-start justify-between gap-4 p-5 md:flex-row md:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-primary">
          <Icon name="assignment_turned_in" className="text-[24px]" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <label htmlFor="task-name" className="flex items-center gap-1 text-label-sm text-on-surface-variant">
            <Badge tone="surface" className="bg-surface-high font-medium text-primary">
              등록할 작업
            </Badge>
            작업 이름
            <span className="font-bold text-flag-icon" title="꼭 입력해 주세요">
              *
            </span>
          </label>
          <TextInput
            id="task-name"
            className="h-10 max-w-md text-headline-sm"
            value={draft.name}
            maxLength={NAME_MAX}
            placeholder="예: 주간보고"
            onChange={(event) => draft.setName(event.target.value)}
          />
          <div className="flex flex-wrap items-center gap-2">
            {RECAP_FIELDS.map((item) => (
              <Badge key={item.field} icon={item.icon} className="max-w-full bg-surface-low text-on-surface-variant">
                <span className="truncate">
                  {item.label}: {draft.answers[item.field]}
                </span>
              </Badge>
            ))}
          </div>
        </div>
      </div>
      <Button size="sm" variant="tonal" icon="visibility" className="px-3 py-2 text-primary" onClick={() => draft.setPhase('questions')}>
        입력 내용 다시 보기
      </Button>
    </Card>
  )
}

function AddRuleCard({ draft }: { draft: TaskDraft }) {
  return (
    <Card as="section" padding="none" className="flex flex-col gap-3 p-5">
      <div className="flex items-center gap-1 text-headline-sm">
        <Icon name="add_circle" className="text-[20px] text-primary" />
        직접 새 규칙 추가
      </div>
      <Field id="new-rule" label={<span className="text-label-sm font-normal text-on-surface-variant">{RULE_LABEL}</span>}>
        <TextInput
          id="new-rule"
          className="h-10"
          value={draft.newRule}
          maxLength={RULE_MAX}
          placeholder="예: 날짜는 YYYY-MM-DD 형식으로 쓴다"
          onChange={(event) => draft.setNewRule(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
              event.preventDefault()
              draft.addRule()
            }
          }}
        />
      </Field>
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-1 text-body-sm text-on-surface-variant">
          <Icon name="lightbulb" className="text-[16px] text-primary" />
          "~한다"처럼 분명한 행동으로 적으면 더 잘 지켜져요.
        </p>
        <Button variant="soft" icon="add" className="px-4" disabled={!draft.newRule.trim()} onClick={draft.addRule}>
          규칙 추가
        </Button>
      </div>
    </Card>
  )
}
