import { useRef, useState } from 'react'
import Icon from '@/components/Icon'
import { SAMPLES, SAMPLE_KEYS } from '@/data/sampleTasks'
import { generateRules } from '@/lib/api'
import { toRules } from '@/lib/rules'
import type { Answers, Rule, SampleKey, Task } from '@/types/task'

type TaskCreatePageProps = {
  initialSampleKey?: SampleKey
  onCancel: () => void
  onSaved: (task: Task) => void
}

const SHORT_MAX = 300
const EXAMPLE_MAX = 2000
const NAME_MAX = 20
const RULE_MAX = 200

const EMPTY_ANSWERS: Answers = { what: '', materials: '', shape: '', example: '' }

const blankRules = (): Rule[] =>
  [1, 2, 3].map((n) => ({ id: `r${n}`, text: '', source: 'setup' as const }))

const QUESTIONS = [
  {
    field: 'what',
    title: '1. 어떤 일을 반복하나요?',
    hint: '반복해서 AI에게 맡기고 싶은 일을 적어 주세요.',
    placeholder: '예: 매주 팀장님께 내는 주간보고를 써요.',
  },
  {
    field: 'materials',
    title: '2. 어떤 재료를 쓰나요?',
    hint: '실행할 때마다 붙여 넣을 재료의 종류를 적어 주세요.',
    placeholder: '예: 지난주 업무 메모',
  },
  {
    field: 'shape',
    title: '3. 결과는 어떤 모양인가요?',
    hint: '결과물의 분량, 말투, 구성을 적어 주세요.',
    placeholder: '예: 500자 안팎, 보고체, 완료한 일과 예정된 일을 나눠서',
  },
] as const

export default function TaskCreatePage({ initialSampleKey, onCancel, onSaved }: TaskCreatePageProps) {
  const initialSample = initialSampleKey ? SAMPLES[initialSampleKey] : undefined
  const [sampleKey, setSampleKey] = useState<SampleKey | undefined>(initialSampleKey)
  const [answers, setAnswers] = useState<Answers>(initialSample?.answers ?? EMPTY_ANSWERS)
  const [name, setName] = useState(initialSample?.name ?? '')
  const [phase, setPhase] = useState<'questions' | 'rules'>('questions')
  const [loading, setLoading] = useState(false)
  const [rules, setRules] = useState<Rule[]>([])
  const [notice, setNotice] = useState('')
  const requestId = useRef(0)

  const canMakeRules = Boolean(answers.what.trim() && answers.materials.trim() && answers.shape.trim())
  const filledRules = rules.filter((rule) => rule.text.trim())
  const canSave = Boolean(name.trim() && filledRules.length > 0)

  function startFromSample(key: SampleKey) {
    const sample = SAMPLES[key]
    setSampleKey(key)
    setAnswers(sample.answers)
    setName(sample.name)
  }

  function setAnswer(field: keyof Answers, value: string) {
    setAnswers((prev) => ({ ...prev, [field]: value }))
  }

  async function makeRules() {
    const id = ++requestId.current
    setLoading(true)
    const result = await generateRules(answers)
    if (id !== requestId.current) return
    setLoading(false)

    if (!result.failed) {
      setRules(toRules(result.texts))
      setNotice('')
    } else if (sampleKey) {
      setRules(SAMPLES[sampleKey].rules.map((rule) => ({ ...rule })))
      setNotice('AI에 연결하지 못해 준비해 둔 예시 규칙을 보여드려요.')
    } else {
      setRules(blankRules())
      setNotice('규칙을 만들지 못했어요. 직접 적어주셔도 돼요.')
    }
    setName((prev) => prev || answers.what.trim().slice(0, NAME_MAX))
    setPhase('rules')
  }

  function cancelLoading() {
    requestId.current++
    setLoading(false)
  }

  function updateRule(id: string, text: string) {
    setRules((prev) => prev.map((rule) => (rule.id === id ? { ...rule, text } : rule)))
  }

  function addRule() {
    setRules((prev) => [...prev, { id: `u${Date.now().toString(36)}`, text: '', source: 'setup' }])
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

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-16 sm:px-8">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1 py-1 text-body-sm text-on-surface-variant hover:text-primary"
        >
          <Icon name="arrow_back" className="text-[18px]" />
          내 작업 목록으로 돌아가기
        </button>
        <div className="hidden items-center gap-1 text-label-sm text-on-surface-variant sm:flex">
          <span>내 작업</span>
          <span className="text-outline-variant">/</span>
          <span className="text-headline-sm text-primary">새 작업 등록</span>
        </div>
      </div>

      <header className="mb-6 rounded-xl bg-surface-lowest p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 rounded bg-surface px-2 py-0.5 text-label-sm text-primary">
              <Icon name="auto_awesome" className="text-[14px]" />
              질문에 답하면 규칙을 만들어 드려요
            </div>
            <h1 className="text-headline-lg tracking-tight">새 작업 등록</h1>
            <p className="text-body-md text-on-surface-variant">
              반복해서 하는 일을 한 번 등록해 두면, 다음부터는 재료만 넣어 실행할 수 있어요.
            </p>
          </div>
          <ol className="flex items-center gap-2 self-start rounded-lg bg-surface-low p-1 lg:self-center">
            {[
              { step: 1, label: '질문 답하기', active: phase === 'questions' },
              { step: 2, label: '규칙 확인·수정', active: phase === 'rules' },
            ].map((item, index) => (
              <li key={item.step} className="flex items-center gap-2">
                {index > 0 && <Icon name="chevron_right" className="text-[18px] text-outline-variant" />}
                <span
                  aria-current={item.active ? 'step' : undefined}
                  className={`flex items-center gap-1 rounded px-3 py-1 text-label-md ${
                    item.active ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-label-sm ${
                      item.active ? 'bg-white/20' : 'bg-surface-high'
                    }`}
                  >
                    {item.step}
                  </span>
                  {item.step}단계: {item.label}
                  {item.active ? ' (현재)' : ''}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <section className="relative flex flex-col gap-6 overflow-hidden rounded-xl bg-surface-lowest p-6 shadow-sm lg:col-span-8">
          {phase === 'questions' ? (
            <>
              <div className="flex flex-wrap items-center gap-2 rounded-lg bg-surface-low p-3">
                <span className="flex items-center gap-1 text-label-sm text-on-surface-variant">
                  <Icon name="bolt" className="text-[14px]" />
                  예시로 시작:
                </span>
                {SAMPLE_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => startFromSample(key)}
                    className={`rounded px-2.5 py-1 text-label-md transition-colors ${
                      sampleKey === key
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-lowest text-on-surface hover:bg-primary hover:text-on-primary'
                    }`}
                  >
                    {SAMPLES[key].label}
                  </button>
                ))}
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-surface-low p-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon name="psychology" className="text-[20px]" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-headline-sm">프롬프트 작성법을 몰라도 괜찮아요</h2>
                  <p className="text-body-sm leading-relaxed text-on-surface-variant">
                    아래 질문에 편하게 답해 주시면, AI가 글을 쓸 때 지킬 규칙을 만들어 드려요. 규칙은 다음 단계에서 직접 고칠 수 있어요.
                  </p>
                </div>
              </div>

              {QUESTIONS.map((question, index) => (
                <div key={question.field} className="space-y-1">
                  {index > 0 && <div className="mb-5 h-px w-full bg-surface-high" />}
                  <div className="flex items-center justify-between">
                    <label htmlFor={`q-${question.field}`} className="flex items-center gap-1 text-headline-sm">
                      {question.title}
                      <span className="font-bold text-red-700" title="꼭 입력해 주세요">
                        *
                      </span>
                    </label>
                    <span className="text-label-sm text-on-surface-variant">
                      {answers[question.field].length} / {SHORT_MAX}자
                    </span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant">{question.hint}</p>
                  <input
                    id={`q-${question.field}`}
                    value={answers[question.field]}
                    maxLength={SHORT_MAX}
                    onChange={(event) => setAnswer(question.field, event.target.value)}
                    placeholder={question.placeholder}
                    className="mt-1 h-11 w-full rounded bg-surface-low px-3 text-body-md outline-none placeholder:text-outline focus:bg-surface-lowest focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ))}

              <div className="space-y-1">
                <div className="mb-5 h-px w-full bg-surface-high" />
                <div className="flex items-center justify-between">
                  <label htmlFor="q-example" className="flex items-center gap-2 text-headline-sm">
                    4. 예전에 잘 나온 결과가 있나요?
                  </label>
                  <span className="rounded bg-surface-high px-1.5 py-0.5 text-label-sm text-on-surface-variant">
                    선택 사항
                  </span>
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  마음에 들었던 결과를 붙여 넣으면 규칙을 만들 때 참고해요. 없으면 비워 두셔도 돼요.
                </p>
                <textarea
                  id="q-example"
                  value={answers.example ?? ''}
                  maxLength={EXAMPLE_MAX}
                  rows={4}
                  onChange={(event) => setAnswer('example', event.target.value)}
                  placeholder="예전에 잘 나온 결과를 붙여 넣어 주세요."
                  className="mt-1 w-full resize-y rounded bg-surface-low p-3 text-body-md outline-none placeholder:text-outline focus:bg-surface-lowest focus:ring-2 focus:ring-primary/30"
                />
                <div className="text-right text-label-sm text-on-surface-variant">
                  {(answers.example ?? '').length} / {EXAMPLE_MAX.toLocaleString()}자
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-surface p-3">
                <Icon name="lightbulb" className="mt-0.5 shrink-0 text-[20px] text-primary" />
                <p className="text-body-sm leading-normal">
                  <strong>[규칙 만들기]</strong>를 누르면 답변을 바탕으로 AI가 글을 쓸 때 지킬 규칙 5~8개를 만들어 줘요. 다음 단계에서 규칙을 고치거나 추가할 수 있고, 아직 작업이 저장된 것은 아니에요.
                </p>
              </div>

              <div className="flex flex-col items-center justify-between gap-3 border-t border-surface-high pt-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full rounded bg-surface-low px-6 py-2 text-headline-sm hover:bg-surface sm:w-auto"
                >
                  취소하고 돌아가기
                </button>
                <button
                  type="button"
                  onClick={makeRules}
                  disabled={!canMakeRules || loading}
                  className="flex w-full items-center justify-center gap-2 rounded bg-primary-container px-8 py-3 text-headline-sm text-on-primary shadow-md transition-all hover:bg-primary disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                >
                  규칙 만들기
                  <Icon name="arrow_forward" className="text-[20px]" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <h2 className="text-headline-md">만들어진 규칙 · 쓰면서 고쳐도 돼요</h2>
                <p className="text-body-sm text-on-surface-variant">
                  규칙은 AI가 글을 쓸 때 지키는 약속이에요. 앱이 결과가 맞는지 판단하는 기준은 아니에요. 고치고 싶은 규칙은 바로 수정하세요.
                </p>
              </div>

              {notice && (
                <p role="status" className="rounded-lg bg-orange-50 p-3 text-body-sm text-orange-900">
                  {notice}
                </p>
              )}

              <ul className="space-y-2">
                {rules.map((rule, index) => (
                  <li key={rule.id} className="flex items-center gap-2 rounded-lg bg-surface-low p-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-surface-lowest text-label-md text-secondary">
                      {index + 1}
                    </span>
                    <input
                      value={rule.text}
                      maxLength={RULE_MAX}
                      onChange={(event) => updateRule(rule.id, event.target.value)}
                      aria-label={`규칙 ${index + 1}`}
                      placeholder="예: 숫자는 메모에 있는 것만 쓴다"
                      className="h-9 min-w-0 flex-1 rounded bg-surface-lowest px-3 text-body-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      type="button"
                      onClick={() => setRules((prev) => prev.filter((item) => item.id !== rule.id))}
                      className="inline-flex shrink-0 items-center gap-0.5 rounded px-2 py-1 text-label-md text-secondary hover:bg-surface"
                    >
                      <Icon name="delete_outline" className="text-[16px]" />
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={addRule}
                className="inline-flex w-fit items-center gap-1 text-label-md text-primary hover:text-primary-container"
              >
                <Icon name="add_circle" className="text-[16px]" />
                규칙 추가
              </button>

              <div className="space-y-1 border-t border-surface-high pt-4">
                <label htmlFor="task-name" className="flex items-center gap-1 text-headline-sm">
                  작업 이름
                  <span className="font-bold text-red-700" title="꼭 입력해 주세요">
                    *
                  </span>
                </label>
                <input
                  id="task-name"
                  value={name}
                  maxLength={NAME_MAX}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="예: 주간보고"
                  className="h-11 w-full rounded bg-surface-low px-3 text-body-md outline-none focus:bg-surface-lowest focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="flex flex-col items-center justify-between gap-3 border-t border-surface-high pt-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setPhase('questions')}
                  className="w-full rounded bg-surface-low px-6 py-2 text-headline-sm hover:bg-surface sm:w-auto"
                >
                  이전으로
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={!canSave}
                  className="flex w-full items-center justify-center gap-2 rounded bg-primary-container px-8 py-3 text-headline-sm text-on-primary shadow-md transition-all hover:bg-primary disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                >
                  저장하고 실행
                  <Icon name="arrow_forward" className="text-[20px]" />
                </button>
              </div>
            </>
          )}

          {loading && (
            <div
              role="status"
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface-lowest/95 p-8 text-center backdrop-blur-[2px]"
            >
              <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface">
                <Icon name="auto_awesome" className="animate-pulse text-[32px] text-primary" />
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
              <h3 className="mb-1 text-headline-md">규칙을 만들고 있어요</h3>
              <p className="mb-4 max-w-md text-body-md text-on-surface-variant">
                입력하신 답변을 바탕으로 AI가 글을 쓸 때 지킬 규칙을 정리하고 있어요. 잠시만 기다려 주세요.
              </p>
              <button type="button" onClick={cancelLoading} className="text-body-sm text-primary underline underline-offset-4">
                취소
              </button>
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:col-span-4">
          <div className="space-y-3 rounded-xl bg-surface-lowest p-5 shadow-sm">
            <div className="flex items-center gap-1 text-primary">
              <Icon name="tips_and_updates" className="text-[22px]" />
              <h3 className="text-headline-sm text-on-surface">처음이라면 이렇게 써 보세요</h3>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                <Icon name="chat" className="text-[16px]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-label-md">완벽한 문장이 아니어도 돼요</h4>
                <p className="text-body-sm leading-relaxed text-on-surface-variant">
                  동료에게 일을 인수인계하듯 평소 쓰는 말로 적어 주세요.
                </p>
              </div>
            </div>
            <div className="h-px w-full bg-surface-high" />
            <div className="flex items-start gap-2">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                <Icon name="tune" className="text-[16px]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-label-md">규칙은 2단계에서 고칠 수 있어요</h4>
                <p className="text-body-sm leading-relaxed text-on-surface-variant">
                  지금 쓴 내용은 초안이에요. AI가 만든 규칙을 보고 빼거나 더할 수 있어요.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl bg-surface-lowest p-5 shadow-sm">
            <div className="flex items-center gap-1">
              <Icon name="timeline" className="text-[20px] text-primary" />
              <h3 className="text-headline-sm">등록한 뒤에는 이렇게 써요</h3>
            </div>
            <ol className="space-y-3 rounded-lg bg-surface-low p-3">
              {[
                { title: '질문에 답하기', body: '지금 화면에서 작업을 설명해요' },
                { title: '규칙 확인하고 저장', body: 'AI가 쓸 때 지킬 규칙을 정해요' },
                { title: '재료 넣고 실행', body: '다음부터는 재료만 붙여 넣으면 돼요' },
              ].map((item, index) => (
                <li key={item.title} className="flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary text-label-sm font-semibold text-on-primary">
                    {index + 1}
                  </span>
                  <div>
                    <div className="text-label-md">{item.title}</div>
                    <div className="text-label-sm text-on-surface-variant">{item.body}</div>
                  </div>
                </li>
              ))}
            </ol>
            <p className="text-body-sm leading-relaxed text-on-surface-variant">
              한 번 등록하면 <strong>[내 작업]</strong>에서 <strong>[실행하기]</strong>로 같은 작업을 계속할 수 있어요.
            </p>
          </div>

          <div className="space-y-1.5 rounded-xl bg-surface p-4 shadow-sm">
            <div className="flex items-center gap-1">
              <Icon name="info" className="text-[18px] text-outline" />
              <span className="text-headline-sm">저장과 전송 안내</span>
            </div>
            <p className="text-body-sm leading-relaxed text-on-surface-variant">
              작성한 작업과 규칙은 이 브라우저에만 저장돼요. 규칙을 만들 때 입력한 답변은 Google Gemini API로 전송돼요. 무료 이용 조건이라 입력 내용이 Google 서비스 개선에 쓰일 수 있고, 사람이 검토할 수도 있어요.
            </p>
            <p className="text-body-sm font-semibold leading-relaxed">
              회사 기밀이나 개인정보는 넣지 마세요.
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}
