import { useState } from 'react'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Dialog from '@/components/Dialog'
import RuleTextArea from '@/components/RuleTextArea'
import FreeformToggle from '@/components/FreeformToggle'
import IconButton from '@/components/IconButton'
import { RULES_BUDGET, rulesChars, ruleMaxLength } from '@/lib/limits'
import type { Rule, Task } from '@/types/task'

type RulesDialogProps = {
  task: Task
  onClose: () => void
  onAdd: (text: string) => void
  onUpdate: (ruleId: string, text: string) => void
  onSetFreeform: (ruleId: string, freeform: boolean) => void
  onRemove: (ruleId: string) => void
  /** 체험용 작업은 지울 수 없으므로 없으면 삭제 버튼을 보이지 않는다 */
  onRemoveTask?: () => void
}

// 규칙의 출처: 등록할 때 정했는지, 직접 더했는지, 몇 회차에 고친 내용에서 왔는지 (S6-1)
const originOf = (rule: Rule) =>
  rule.source === 'edit'
    ? { label: `${rule.fromRun ?? '?'}회차에 고친 내용에서`, tone: 'primary' as const }
    : rule.id.startsWith('u')
      ? { label: '직접 추가', tone: 'surface' as const }
      : { label: '등록할 때', tone: 'muted' as const }

// S6 규칙 목록(최소): 규칙을 보고 고치고 지우고 더한다
export default function RulesDialog({ task, onClose, onAdd, onUpdate, onSetFreeform, onRemove, onRemoveTask }: RulesDialogProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [newRule, setNewRule] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const startEdit = (rule: Rule) => {
    setEditingId(rule.id)
    setDraft(rule.text)
  }

  const finishEdit = () => {
    const text = draft.trim()
    if (editingId && text) onUpdate(editingId, text)
    setEditingId(null)
  }

  const addNew = () => {
    const text = newRule.trim()
    if (!text) return
    onAdd(text)
    setNewRule('')
  }

  return (
    <Dialog title={`${task.name}의 규칙`} onClose={onClose}>
      <p className="mb-3 text-body-sm text-on-surface-variant">
        규칙은 글을 쓸 때 지킬 약속이고, 앱이 결과를 판단하는 기준은 아니에요. 고치거나 지우면 다음 실행부터 반영돼요.
      </p>

      <p className="mb-2 text-label-md text-on-surface-variant" title="규칙이 너무 길어지면 AI에 보내는 요청이 한도를 넘어요">
        규칙 {task.rules.length}개 · {rulesChars(task.rules).toLocaleString()} / {RULES_BUDGET.toLocaleString()}자
      </p>

      {task.rules.length === 0 ? (
        <p className="rounded-lg bg-surface-low p-4 text-body-sm text-on-surface-variant">아직 규칙이 없어요. 아래에서 추가해 보세요.</p>
      ) : (
        <ol className="space-y-2">
          {task.rules.map((rule, index) => {
            const origin = originOf(rule)
            return (
              <li key={rule.id} className="rounded-lg border border-outline-variant p-3">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-label-md text-secondary">규칙 {index + 1}</span>
                  <Badge tone={origin.tone}>{origin.label}</Badge>
                </div>
                {editingId === rule.id ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <RuleTextArea
                      autoFocus
                      value={draft}
                      maxLength={ruleMaxLength(task.rules, rule.text.length)}
                      aria-label={`규칙 ${index + 1} 고치기`}
                      onChange={setDraft}
                      onSubmit={finishEdit}
                      onEscape={() => setEditingId(null)}
                    />
                    <div className="flex shrink-0 gap-1.5">
                      <Button size="sm" variant="primary" onClick={finishEdit} disabled={!draft.trim()}>
                        완료
                      </Button>
                      <Button size="sm" onClick={() => setEditingId(null)}>
                        취소
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-body-md">{rule.text}</p>
                    <div className="flex shrink-0">
                      <IconButton icon="edit" label={`규칙 ${index + 1} 고치기`} onClick={() => startEdit(rule)} />
                      <IconButton icon="delete" label={`규칙 ${index + 1} 삭제`} danger onClick={() => onRemove(rule.id)} />
                    </div>
                  </div>
                )}
                {editingId !== rule.id && (
                  <div className="mt-1.5">
                    <FreeformToggle checked={rule.freeform === true} label={`규칙 ${index + 1}`} onChange={(checked) => onSetFreeform(rule.id, checked)} />
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <RuleTextArea
          value={newRule}
          maxLength={ruleMaxLength(task.rules)}
          aria-label="새 규칙"
          placeholder={ruleMaxLength(task.rules) === 0 ? '규칙 글자 수 한도에 도달했어요. 규칙을 줄이면 더할 수 있어요.' : '예: 날짜는 YYYY-MM-DD 형식으로 쓴다'}
          onChange={setNewRule}
          onSubmit={addNew}
        />
        <Button className="shrink-0" icon="add" onClick={addNew} disabled={!newRule.trim()}>
          규칙 추가
        </Button>
      </div>

      {onRemoveTask && (
        <div className="mt-6 border-t border-outline-variant pt-4">
          {confirmDelete ? (
            <div role="alert" className="flex flex-col gap-2 rounded-lg bg-flag-soft p-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-body-sm font-semibold text-flag-text">이 작업의 규칙과 실행 기록이 모두 사라져요. 지울까요?</p>
              <div className="flex shrink-0 gap-1.5">
                <Button size="sm" variant="primary" onClick={onRemoveTask}>
                  지우기
                </Button>
                <Button size="sm" onClick={() => setConfirmDelete(false)}>
                  취소
                </Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="ghost" icon="delete" onClick={() => setConfirmDelete(true)}>
              작업 삭제
            </Button>
          )}
        </div>
      )}
    </Dialog>
  )
}
