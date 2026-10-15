import { useState } from 'react'
import Spinner from '@/components/Spinner'
import Button from '@/components/Button'
import Dialog from '@/components/Dialog'
import { TextInput } from '@/components/Field'
import Notice from '@/components/Notice'
import type { RunSession } from '@/hooks/useRunSession'
import { generateRuleCandidate } from '@/lib/api'
import { ruleMaxLength } from '@/lib/limits'
import { DELETED_AFTER, editedPairs, hasRule } from '@/lib/rules'
import type { Rule, Task } from '@/types/task'

type Phase = 'idle' | 'loading' | 'ready' | 'none' | 'added'

type LeaveWithEditsDialogProps = {
  task: Task
  session: RunSession
  onAddRule: (rule: Rule) => void
  onCancel: () => void
  onLeave: () => void
}

const SHOWN_PAIRS = 3
const SHOWN_CHARS = 40
const shorten = (text: string) => (text.length > SHOWN_CHARS ? `${text.slice(0, SHOWN_CHARS)}…` : text)

// 고친 곳이 있는 결과를 복사하지 않고 떠나기 전에 한 번 묻는다. 고침이 조용히 사라지지 않게 하려는 것이다.
// 고친 내용은 같은 자료로 다시 실행할 때 AI에게 "이번 실행의 정정"으로 보내고(규칙이 아니다), 규칙으로 남길 만하면 여기서 바로 남길 수 있다.
export default function LeaveWithEditsDialog({ task, session, onAddRule, onCancel, onLeave }: LeaveWithEditsDialogProps) {
  const pairs = editedPairs(session.lines)
  const [phase, setPhase] = useState<Phase>('idle')
  const [text, setText] = useState('')
  const [manual, setManual] = useState(false)
  const trimmed = text.trim()
  const duplicate = hasRule(task.rules, trimmed)
  const room = ruleMaxLength(task.rules)
  const overBudget = trimmed.length > room

  async function suggest() {
    setPhase('loading')
    const candidate = await generateRuleCandidate(pairs, task.rules)
    if (candidate === null) {
      setManual(true)
      setPhase('ready')
    } else if (candidate === '' || hasRule(task.rules, candidate)) {
      setPhase('none')
    } else {
      setText(candidate)
      setPhase('ready')
    }
  }

  function add() {
    if (!trimmed || duplicate || overBudget) return
    onAddRule({ id: `e${crypto.randomUUID().slice(0, 8)}`, text: trimmed, source: 'edit', fromRun: task.runs.length + 1 })
    setPhase('added')
  }

  return (
    <Dialog title={`고친 곳 ${pairs.length}개가 있어요`} onClose={onCancel}>
      <div className="space-y-4">
        <p className="text-body-md">
          복사하지 않고 자료를 다시 입력하면 이 결과는 사라져요. 고친 내용은 <strong className="font-semibold">같은 자료로 다시 실행할 때 AI에게 함께 보내요.</strong> 이번 실행에만 쓰고 규칙으로 남기지는 않아요.
        </p>

        <ul className="space-y-1.5 rounded-lg bg-surface-low p-3 text-body-sm">
          {pairs.slice(0, SHOWN_PAIRS).map((pair, index) => (
            <li key={index} className="flex flex-wrap gap-x-2">
              <span className="text-on-surface-variant line-through decoration-outline">{shorten(pair.before)}</span>
              <span aria-hidden>→</span>
              <span>{pair.after === DELETED_AFTER ? '삭제함' : shorten(pair.after)}</span>
            </li>
          ))}
          {pairs.length > SHOWN_PAIRS && <li className="text-on-surface-variant">외 {pairs.length - SHOWN_PAIRS}곳</li>}
        </ul>

        <div className="space-y-2">
          <p className="text-label-md text-secondary">다음에도 같은 고침을 하게 될 것 같다면 규칙으로 남길 수 있어요.</p>
          {phase === 'idle' && (
            <Button size="sm" icon="rule" onClick={suggest}>
              규칙 후보 보기
            </Button>
          )}
          {phase === 'loading' && (
            <p role="status" className="flex items-center gap-2 text-body-sm text-on-surface-variant">
              <Spinner />
              고친 내용에서 규칙 후보를 만들고 있어요.
            </p>
          )}
          {phase === 'none' && <p className="text-body-sm text-on-surface-variant">이번 자료에만 해당하는 고침이라 규칙 후보가 없어요.</p>}
          {phase === 'ready' && (
            <div className="space-y-2">
              {manual && <p className="text-body-sm text-on-surface-variant">규칙 후보를 만들지 못했어요. 다음에도 적용할 내용을 한 줄로 적어 주세요.</p>}
              <TextInput
                value={text}
                maxLength={Math.max(room, text.length)}
                aria-label="규칙 후보"
                placeholder="예: 금액은 만 원 단위로 쓴다"
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                    event.preventDefault()
                    add()
                  }
                }}
              />
              {duplicate && <p className="text-body-sm text-flag-text">이미 있는 규칙이에요.</p>}
              {overBudget && <p className="text-body-sm text-flag-text">규칙 글자 수 한도({room.toLocaleString()}자 남음)를 넘어요. 후보를 줄이거나 [내 작업]에서 규칙을 정리해 주세요.</p>}
              <Button size="sm" variant="primary" icon="add" disabled={!trimmed || duplicate || overBudget} onClick={add}>
                규칙 추가
              </Button>
            </div>
          )}
          {phase === 'added' && (
            <Notice tone="primary" icon="bookmark" role="status">
              규칙에 추가했어요. 다음 실행부터 AI에게 보내요.
            </Notice>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button onClick={onCancel}>취소</Button>
          <Button variant="primary" onClick={onLeave}>
            이대로 다시 입력
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
