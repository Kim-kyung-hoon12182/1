import { useRef, useState } from 'react'
import { SAMPLES } from '@/data/sampleTasks'
import { generateRules } from '@/lib/api'
import { NAME_MAX } from '@/lib/limits'
import { toRules } from '@/lib/rules'
import { suggestTaskName } from '@/lib/taskName'
import type { Answers, Rule, SampleKey, Task } from '@/types/task'

export type Phase = 'questions' | 'rules'
type RuleOrigin = 'ai' | 'sample' | 'blank'

const EMPTY_ANSWERS: Answers = { what: '', materials: '', shape: '', example: '' }
const SAMPLE_RULES_NOTICE = 'AI에 연결하지 못해서 준비해 둔 예시 규칙을 넣었어요.'
const BLANK_RULES_NOTICE = '규칙 초안을 만들지 못했어요. 직접 적어 주세요.'

const blankRules = (): Rule[] => [1, 2, 3].map((n) => ({ id: `r${n}`, text: '', source: 'setup' as const }))

// 직접 추가한 규칙은 id가 u로 시작한다
export const isUserAdded = (rule: Rule) => rule.id.startsWith('u')

// 새 작업 등록(S2)의 상태와 동작: 질문 답하기 → 규칙 만들기 → 규칙 고치기 → 저장
export function useTaskDraft(initialSampleKey: SampleKey | undefined, onSaved: (task: Task) => void) {
  const initialSample = initialSampleKey ? SAMPLES[initialSampleKey] : undefined
  const [sampleKey, setSampleKey] = useState(initialSampleKey)
  const [answers, setAnswers] = useState<Answers>(initialSample?.answers ?? EMPTY_ANSWERS)
  const [name, setName] = useState(initialSample?.name ?? '')
  const [phase, setPhase] = useState<Phase>('questions')
  const [loading, setLoading] = useState(false)
  const [rules, setRules] = useState<Rule[]>([])
  const [origin, setOrigin] = useState<RuleOrigin>('ai')
  const [notice, setNotice] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [backupText, setBackupText] = useState('')
  const [newRule, setNewRule] = useState('')
  const [generatedFor, setGeneratedFor] = useState('')
  const requestId = useRef(0)

  const answersKey = JSON.stringify(answers)
  const canMakeRules = Boolean(answers.what.trim() && answers.materials.trim() && answers.shape.trim())
  const filledRules = rules.filter((rule) => rule.text.trim())
  const canSave = Boolean(name.trim() && filledRules.length > 0)
  // 답변이 그대로면 이미 만든(고친) 규칙을 다시 만들지 않는다
  const rulesReady = rules.length > 0 && generatedFor === answersKey

  function startFromSample(key: SampleKey) {
    const sample = SAMPLES[key]
    setSampleKey(key)
    setAnswers(sample.answers)
    setName(sample.name)
  }

  const setAnswer = (field: keyof Answers, value: string) => setAnswers((prev) => ({ ...prev, [field]: value }))

  async function makeRules() {
    if (rulesReady) return setPhase('rules')

    const id = ++requestId.current
    setLoading(true)
    const result = await generateRules(answers)
    if (id !== requestId.current) return // 취소했거나 더 새로운 요청이 있다
    setLoading(false)

    if (!result.failed) {
      setRules(toRules(result.texts))
      setOrigin('ai')
      setNotice('')
    } else if (sampleKey) {
      setRules(SAMPLES[sampleKey].rules.map((rule) => ({ ...rule })))
      setOrigin('sample')
      setNotice(SAMPLE_RULES_NOTICE)
    } else {
      setRules(blankRules())
      setOrigin('blank')
      setNotice(BLANK_RULES_NOTICE)
    }
    setEditingId(null)
    setGeneratedFor(answersKey)
    setName((prev) => prev || suggestTaskName(answers.what, NAME_MAX))
    setPhase('rules')
  }

  function cancelLoading() {
    requestId.current++
    setLoading(false)
  }

  const updateRule = (id: string, text: string) =>
    setRules((prev) => prev.map((rule) => (rule.id === id ? { ...rule, text } : rule)))

  const setFreeform = (id: string, freeform: boolean) =>
    setRules((prev) => prev.map((rule) => (rule.id === id ? { ...rule, freeform: freeform || undefined } : rule)))

  const removeRule = (id: string) => setRules((prev) => prev.filter((rule) => rule.id !== id))

  function startEdit(rule: Rule) {
    setBackupText(rule.text)
    setEditingId(rule.id)
  }

  function cancelEdit() {
    if (editingId) updateRule(editingId, backupText)
    setEditingId(null)
  }

  function addRule() {
    const text = newRule.trim()
    if (!text) return
    setRules((prev) => [...prev, { id: `u${crypto.randomUUID().slice(0, 8)}`, text, source: 'setup' }])
    setNewRule('')
  }

  function save() {
    if (!canSave) return
    onSaved({
      id: crypto.randomUUID(),
      name: name.trim(),
      sampleKey,
      answers: { ...answers, example: answers.example?.trim() || undefined },
      rules: filledRules.map((rule) => ({ ...rule, text: rule.text.trim() })),
      runs: [],
      handsOff: false,
      createdAt: new Date().toISOString(),
    })
  }

  return {
    sampleKey,
    answers,
    name,
    setName,
    phase,
    setPhase,
    loading,
    rules,
    origin,
    notice,
    editingId,
    newRule,
    setNewRule,
    canMakeRules,
    filledRules,
    canSave,
    rulesReady,
    startFromSample,
    setAnswer,
    makeRules,
    cancelLoading,
    updateRule,
    setFreeform,
    removeRule,
    startEdit,
    cancelEdit,
    finishEdit: () => setEditingId(null),
    addRule,
    save,
  }
}

export type TaskDraft = ReturnType<typeof useTaskDraft>
