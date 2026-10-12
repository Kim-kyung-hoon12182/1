import { useEffect, useState } from 'react'
import { generateRuleCandidate } from '@/lib/api'
import { editedPairs, hasRule } from '@/lib/rules'
import type { OutputLine, Rule, Run, Task } from '@/types/task'

// none: 고친 줄이 없거나 이번 자료에만 해당해서 카드를 안 띄움 / loading / ready / added / closed
type Phase = 'none' | 'loading' | 'ready' | 'added' | 'closed'

// F-05: 기록이 끝난 뒤 고친 줄이 있으면 규칙 후보 한 줄을 받아 사용자가 확인하게 한다.
// 사용자가 [규칙 추가]를 누른 것만 저장하고, 누르지 않은 후보는 반영되지 않는다.
export function useRuleCandidate(task: Task, run: Run, lines: OutputLine[], onAddRule: (rule: Rule) => void) {
  const [phase, setPhase] = useState<Phase>(run.edited ? 'loading' : 'none')
  const [text, setText] = useState('')
  // AI가 후보를 못 줬을 때는 빈 입력칸을 보여 주고 직접 적게 한다
  const [manual, setManual] = useState(false)

  useEffect(() => {
    if (!run.edited) return
    let current = true
    generateRuleCandidate(editedPairs(lines), task.rules).then((candidate) => {
      if (!current) return
      if (candidate === null) {
        setManual(true)
        setPhase('ready')
      } else if (candidate === '' || hasRule(task.rules, candidate)) {
        setPhase('none')
      } else {
        setText(candidate)
        setPhase('ready')
      }
    })
    return () => {
      current = false
    }
  }, [run.id])

  const trimmed = text.trim()
  const duplicate = hasRule(task.rules, trimmed)

  function add() {
    if (!trimmed || duplicate) return
    onAddRule({ id: `e${crypto.randomUUID().slice(0, 8)}`, text: trimmed, source: 'edit', fromRun: run.number })
    setPhase('added')
  }

  return { phase, text, setText, manual, canAdd: trimmed !== '' && !duplicate, duplicate, add, dismiss: () => setPhase('closed') }
}
