import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/components/Icon'
import RunChips from '@/components/RunChips'
import { getSample, type Sample } from '@/data/sampleTasks'
import { checkLine, hasUnbackedFlip, type LineStatus } from '@/lib/evidence'
import { MAX_MATERIAL_CHARS, circled, splitSentences } from '@/lib/material'
import type { OutputLine, Task } from '@/types/task'

type Result = {
  sentences: string[]
  lines: OutputLine[]
}

type CopyState = 'idle' | 'done' | 'failed'

const STEPS = [
  { title: '1단계: 재료 넣기', body: '메모나 자료를 붙여 넣으면 문장마다 번호가 붙어요.' },
  { title: '2단계: AI가 글 쓰기', body: '재료에 있는 내용으로 줄마다 근거 위치를 짚어요.' },
  { title: '3단계: 확인할 곳 보고 고치기', body: '표시된 줄과 짚은 재료를 직접 보고, 고친 뒤 복사해요.' },
]

const LEGEND = [
  { status: 'has_source', name: '짚은 곳', body: 'AI가 근거라고 짚은 재료 위치예요. 뜻이 맞는지는 확인하지 않았어요.' },
  { status: 'needs_check', name: '근거 확인 필요', body: '짚은 재료가 없거나, 겹치는 낱말이 적거나, 뒤집는 말이 재료에 없어요.' },
  { status: 'not_in_input', name: '재료에 없음', body: '줄의 숫자·날짜·이름이 재료에서 보이지 않아요.' },
] as const

const SCOPE_NOTE =
  '자동 검사는 숫자·날짜와 일부 이름(따옴표 안 글자, 영문 대문자 단어), 근거 위치만 봐요. 내용이 맞는지는 직접 확인해 주세요.'

const buildSampleResult = (sample: Sample, material: string): Result => {
  const sentences = splitSentences(material)
  const lines = sample.lines.map((line) => {
    const { status, missingTokens } = checkLine(line.text, line.sourceIds, sentences)
    return { ...line, status, missingTokens }
  })
  return { sentences, lines }
}

const describeReason = (line: OutputLine, sentences: string[]) => {
  if (line.status === 'not_in_input') {
    return `재료에서 찾지 못한 값이 있어요: ${line.missingTokens.join(', ')}. 재료에 실제로 있는 값인지 확인해 주세요.`
  }
  const cited = line.sourceIds.map((id) => sentences[id - 1]).filter(Boolean)
  if (cited.length === 0) return 'AI가 근거로 짚은 재료가 없어요.'
  if (hasUnbackedFlip(line.text, cited.join(' '))) {
    return '이 줄에는 짚은 재료에 없는 "실패·못·않·없" 같은 뒤집는 말이 들어 있어요. 뜻이 바뀌지 않았는지 확인해 주세요.'
  }
  return '짚은 재료와 겹치는 낱말이 적어요. 다른 문장을 짚은 건 아닌지 확인해 주세요.'
}

function StatusLabel({ status, sourceIds, missingTokens }: Pick<OutputLine, 'status' | 'sourceIds' | 'missingTokens'>) {
  if (status === 'has_source') {
    return (
      <span
        title="AI가 이 줄의 근거라고 짚은 재료예요. 뜻이 맞는지는 확인하지 않았어요"
        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-label-md text-slate-600"
      >
        <Icon name="link" className="text-[15px]" />
        짚은 곳 {sourceIds.map(circled).join(' ')}
      </span>
    )
  }
  if (status === 'not_in_input') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-label-md text-orange-900">
        <Icon name="error" className="text-[15px] text-orange-600" />
        재료에 없음: {missingTokens.join(', ')}
      </span>
    )
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-label-md text-orange-900 ring-1 ring-orange-200">
      <Icon name="warning" className="text-[15px] text-orange-600" />
      근거 확인 필요
    </span>
  )
}

const countBy = (lines: OutputLine[], status: LineStatus) => lines.filter((line) => line.status === status).length

type RunPageProps = {
  task: Task
  prefillMaterial: boolean
}

export default function RunPage({ task, prefillMaterial }: RunPageProps) {
  const sample = getSample(task.sampleKey)
  const [input, setInput] = useState(prefillMaterial && sample ? sample.material : '')
  const [result, setResult] = useState<Result | null>(null)
  const [notice, setNotice] = useState('')
  const [selected, setSelected] = useState<number | null>(null)
  const [editing, setEditing] = useState<number | null>(null)
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const sentenceRefs = useRef<(HTMLLIElement | null)[]>([])
  const fallbackRef = useRef<HTMLTextAreaElement>(null)

  const lines = result?.lines ?? []
  const sentences = result?.sentences ?? []
  const flagged = useMemo(
    () => lines.flatMap((line, index) => (line.status === 'has_source' ? [] : [index])),
    [lines],
  )
  const highlighted = new Set(selected === null ? [] : lines[selected]?.sourceIds)
  const finalText = lines.map((line) => line.editedText ?? line.text).join('\n')
  const currentStep = result ? 3 : 1

  useEffect(() => {
    if (selected === null) return
    const firstId = lines[selected]?.sourceIds[0]
    if (firstId) sentenceRefs.current[firstId - 1]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [selected])

  useEffect(() => {
    if (copyState === 'failed') fallbackRef.current?.select()
  }, [copyState])

  function loadSample() {
    if (sample) setInput(sample.material)
    setNotice('')
  }

  function run() {
    if (!input.trim()) return
    if (!sample) {
      setNotice('AI 연결 전이라 이 작업은 아직 실행할 수 없어요. 예시 작업은 바로 실행해 볼 수 있어요.')
      return
    }
    if (input.trim() !== sample.material) {
      setNotice('AI 연결 전이라 지금은 예시 재료로만 실행할 수 있어요.')
      return
    }
    setNotice('')
    setResult(buildSampleResult(sample, input.trim()))
    setSelected(null)
    setEditing(null)
    setCopyState('idle')
  }

  function backToInput() {
    setResult(null)
    setSelected(null)
    setEditing(null)
    setCopyState('idle')
  }

  function updateLine(index: number, patch: Partial<OutputLine>) {
    setResult((prev) =>
      prev ? { ...prev, lines: prev.lines.map((line, i) => (i === index ? { ...line, ...patch } : line)) } : prev,
    )
    setCopyState('idle')
  }

  function finishEdit(index: number, value: string) {
    const next = value.trim()
    updateLine(index, { editedText: next && next !== lines[index].text ? next : undefined })
    setEditing(null)
  }

  function goToFlagged(direction: 'first' | 'next') {
    if (flagged.length === 0) return
    if (direction === 'first' || selected === null) {
      setSelected(flagged[0])
      return
    }
    setSelected(flagged.find((index) => index > selected) ?? flagged[0])
  }

  async function copyAndFinish() {
    try {
      await navigator.clipboard.writeText(finalText)
      setCopyState('done')
    } catch {
      setCopyState('failed')
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-16 sm:px-8">
        <section className="mb-6 rounded-xl bg-surface-lowest p-6 shadow-sm">
          <div className="mb-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="max-w-4xl space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-surface-high px-2.5 py-0.5 text-label-sm text-on-surface-variant">
                  <Icon name="folder_open" className="text-[13px]" />
                  {task.isDemo ? '예시 작업' : '내 작업'} · {task.runs.length + 1}회차
                </span>
                {result && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-label-sm font-semibold ${
                      flagged.length > 0 ? 'bg-orange-100 text-orange-900' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {flagged.length > 0 && <span className="h-2 w-2 rounded-full bg-orange-500" />}
                    확인할 곳 {flagged.length}개
                  </span>
                )}
                {result && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-fixed px-2.5 py-0.5 text-label-sm text-on-primary-fixed">
                    예시 결과예요
                  </span>
                )}
              </div>
              <h1 className="text-headline-lg tracking-tight">{task.name}</h1>
              <p className="text-body-md leading-relaxed text-on-surface-variant">
                AI가 쓴 글에서 확인할 곳을 짚어드려요. 고친 내용은 다음부터 반영되고, 안 고친 기록이 쌓이면 맡겨볼 만한 때를 알려드려요.
              </p>
              {task.runs.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-label-sm text-on-surface-variant">최근 기록</span>
                  <RunChips runs={task.runs} />
                </div>
              )}
            </div>
            {result && (
              <button
                type="button"
                onClick={backToInput}
                className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg bg-surface px-3.5 py-2 text-body-sm hover:bg-surface-high lg:self-center"
              >
                <Icon name="restart_alt" className="text-[17px] text-secondary" />
                재료 다시 입력
              </button>
            )}
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-surface-low p-3.5 text-body-sm text-on-surface-variant">
            <Icon name="policy" className="mt-0.5 shrink-0 text-[20px] text-primary" />
            <div className="flex-1">
              <span className="font-semibold text-on-surface">꼭 읽어 주세요:</span> 확인할 곳 표시는 결과가 정확하다는 뜻이 아니에요.
              앱이 검사한 범위만 알려드리니, 표시된 줄과 짚은 재료를 직접 확인해 주세요.
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-xl border border-outline-variant bg-surface-lowest p-4 shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-outline-variant pb-3 lg:flex-row lg:items-center">
            <div className="flex items-center gap-2">
              <Icon name="explore" className="text-[22px] text-primary" />
              <h2 className="text-headline-sm">이렇게 사용해요</h2>
              <span className="rounded-full bg-primary-fixed px-2 py-0.5 text-label-sm font-semibold text-on-primary-fixed">
                처음 오셨나요?
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              왼쪽에 재료를 넣고 실행하면, 오른쪽에 줄마다 짚은 재료와 확인할 곳이 나와요.
            </p>
          </div>
          <ol className="grid gap-3 pt-3 md:grid-cols-3">
            {STEPS.map((step, index) => {
              const active = currentStep === index + 1
              return (
                <li
                  key={step.title}
                  aria-current={active ? 'step' : undefined}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${
                    active ? 'border-primary/30 bg-primary/10' : 'border-outline-variant bg-surface-low'
                  }`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-label-md font-bold text-on-primary">
                    {index + 1}
                  </span>
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-1.5 text-label-md">
                      <span className={active ? 'text-primary' : 'text-on-surface'}>{step.title}</span>
                      {active && (
                        <span className="rounded bg-primary px-1.5 text-[10px] text-on-primary">현재 단계</span>
                      )}
                    </div>
                    <p className="text-label-sm text-on-surface-variant">{step.body}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-12">
          <section className="flex flex-col rounded-xl bg-surface-lowest p-4 shadow-sm lg:col-span-5">
            <div className="mb-3 flex items-start justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary-fixed px-2 py-0.5 text-label-sm font-semibold text-on-primary-fixed">
                    1단계
                  </span>
                  <Icon name="description" className="text-[20px] text-primary" />
                  <h2 className="text-headline-sm">재료</h2>
                </div>
                <p className="text-label-sm text-on-surface-variant">
                  AI가 글을 쓸 때 근거로 삼을 메모나 자료를 붙여 넣어 주세요.
                </p>
              </div>
              <span className="rounded bg-surface px-2 py-1 text-label-md text-secondary">
                {result
                  ? `문장 ${sentences.length}개`
                  : `${input.length.toLocaleString()} / ${MAX_MATERIAL_CHARS.toLocaleString()}자`}
              </span>
            </div>

            {result ? (
              <ol className="max-h-[560px] space-y-1.5 overflow-y-auto rounded-lg bg-background p-3 text-body-sm">
                {sentences.map((sentence, index) => {
                  const citedBy = lines.flatMap((line, lineIndex) =>
                    line.sourceIds.includes(index + 1) ? [lineIndex + 1] : [],
                  )
                  return (
                    <li
                      key={index}
                      ref={(el) => {
                        sentenceRefs.current[index] = el
                      }}
                      className={`rounded p-2 transition-colors ${
                        highlighted.has(index + 1) ? 'bg-yellow-100 ring-1 ring-yellow-300' : 'hover:bg-surface-low'
                      }`}
                    >
                      <div className="mb-0.5 flex items-center justify-between gap-2">
                        <span className="text-label-md text-outline">재료 {circled(index + 1)}</span>
                        {citedBy.length > 0 && (
                          <span className="inline-flex items-center gap-1 rounded bg-surface-lowest px-1.5 py-0.5 text-label-sm text-secondary shadow-xs">
                            <Icon name="link" className="text-[12px]" />
                            결과 {citedBy.join('·')}번 줄이 짚음
                          </span>
                        )}
                      </div>
                      <p>{sentence}</p>
                    </li>
                  )
                })}
              </ol>
            ) : (
              <>
                <div className="mb-2 flex items-center justify-between rounded-lg bg-surface-low px-3 py-2 text-body-sm">
                  {sample ? (
                    <button
                      type="button"
                      onClick={loadSample}
                      title="예시 재료를 바로 입력해요"
                      className="inline-flex items-center gap-1 rounded bg-surface-high px-2.5 py-1 font-medium text-primary hover:bg-surface"
                    >
                      <Icon name="history_edu" className="text-[16px]" />
                      예시 재료 불러오기 (체험하기)
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setInput('')
                      setNotice('')
                    }}
                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-outline hover:bg-orange-50 hover:text-orange-900"
                  >
                    <Icon name="delete_outline" className="text-[16px]" />
                    지우기
                  </button>
                </div>
                <textarea
                  value={input}
                  maxLength={MAX_MATERIAL_CHARS}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.nativeEvent.isComposing) {
                      event.preventDefault()
                      run()
                    }
                  }}
                  placeholder="이번 주에 한 일을 메모처럼 붙여 넣어 주세요."
                  className="h-72 w-full resize-y rounded-lg bg-background p-3 text-body-sm leading-relaxed outline-none ring-1 ring-outline-variant focus:ring-2 focus:ring-primary/40"
                />
                {notice && (
                  <p role="status" className="mt-3 rounded-lg bg-orange-50 p-2.5 text-body-sm text-orange-900">
                    {notice}
                  </p>
                )}
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={run}
                    disabled={!input.trim()}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-headline-sm text-on-primary shadow-sm transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Icon name="bolt" className="text-[22px] transition-transform group-hover:scale-110" />
                    실행하기
                    <kbd className="hidden rounded bg-on-primary/20 px-1.5 py-0.5 text-label-sm md:inline">
                      Ctrl + Enter
                    </kbd>
                  </button>
                  <p className="px-1 text-label-sm text-on-surface-variant">
                    이 작업의 규칙 {task.rules.length}개를 지키며 글을 써요.
                  </p>
                </div>
              </>
            )}
          </section>

          <section className="space-y-4 lg:col-span-7">
            {!result ? (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-lowest p-8 text-center">
                <Icon name="article" className="text-[40px] text-outline" />
                <p className="mt-2 text-headline-sm">아직 결과가 없어요</p>
                <p className="mt-1 max-w-md text-body-sm text-on-surface-variant">
                  재료를 넣고 [실행하기]를 누르면 줄마다 짚은 재료와 확인할 곳이 여기에 나와요. 처음이라면 [예시 재료 불러오기]로 먼저 체험해 보세요.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2 rounded-xl bg-surface-lowest p-3 shadow-md lg:sticky lg:top-20 lg:z-20">
                  <div className="flex flex-col justify-between gap-2 border-b border-outline-variant pb-2 md:flex-row md:items-center">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-primary px-2 py-0.5 text-label-sm font-semibold text-on-primary">
                        2·3단계
                      </span>
                      <h2 className="text-headline-sm">결과와 짚은 재료</h2>
                    </div>
                    {flagged.length > 0 && (
                      <div className="flex items-center gap-1.5 text-label-md">
                        <button
                          type="button"
                          onClick={() => goToFlagged('first')}
                          className="rounded bg-surface px-2.5 py-1 hover:bg-surface-high"
                        >
                          첫 번째로 이동
                        </button>
                        <button
                          type="button"
                          onClick={() => goToFlagged('next')}
                          className="rounded bg-surface px-2.5 py-1 hover:bg-surface-high"
                        >
                          다음 확인할 곳
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded bg-surface px-2.5 py-1 text-label-md">전체 {lines.length}줄</span>
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-label-md text-slate-600">
                      <Icon name="link" className="text-[15px]" />
                      짚은 곳 {countBy(lines, 'has_source')}줄
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-orange-50 px-2.5 py-1 text-label-md text-orange-900 ring-1 ring-orange-200">
                      <Icon name="warning" className="text-[15px] text-orange-600" />
                      근거 확인 필요 {countBy(lines, 'needs_check')}줄
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-orange-100 px-2.5 py-1 text-label-md text-orange-900">
                      <Icon name="error" className="text-[15px] text-orange-600" />
                      재료에 없음 {countBy(lines, 'not_in_input')}줄
                    </span>
                  </div>
                </div>

                <div className="space-y-1 rounded-lg border border-outline-variant bg-surface-low p-2.5 text-label-sm">
                  <div className="flex items-center gap-1 font-semibold">
                    <Icon name="help" className="text-[15px] text-primary" />
                    표시는 이렇게 읽어요
                  </div>
                  <ul className="grid gap-2 text-on-surface-variant sm:grid-cols-3">
                    {LEGEND.map((item) => (
                      <li key={item.status}>
                        <strong className="text-on-surface">{item.name}:</strong> {item.body}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-orange-50/80 p-3">
                  <Icon name="info" className="shrink-0 text-[22px] text-orange-600" />
                  <p className="flex-1 text-body-sm text-orange-950">
                    <strong className="font-semibold">
                      {flagged.length === 0 ? '자동 검사에서 따로 확인할 곳을 찾지 못했어요. ' : '초안이에요. '}
                    </strong>
                    {SCOPE_NOTE}
                  </p>
                </div>

                <ul className="space-y-4">
                  {lines.map((line, index) => {
                    const isSelected = selected === index
                    const isFlagged = line.status !== 'has_source'
                    const appliedRules = task.rules.filter((rule) => line.ruleIds.includes(rule.id))
                    const cited = line.sourceIds.flatMap((id) =>
                      sentences[id - 1] ? [{ id, text: sentences[id - 1] }] : [],
                    )
                    return (
                      <li
                        key={index}
                        onClick={() => setSelected(index)}
                        tabIndex={0}
                        aria-current={isSelected}
                        onKeyDown={(event) => {
                          if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                            event.preventDefault()
                            setSelected(index)
                          }
                        }}
                        className={`flex cursor-pointer flex-col gap-3 rounded-xl border-l-4 bg-surface-lowest p-4 shadow-sm transition-shadow ${
                          isFlagged ? 'border-orange-400' : 'border-transparent'
                        } ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-surface px-2 py-0.5 text-label-md text-secondary">
                                {String(index + 1).padStart(2, '0')}
                              </span>
                              {line.editedText !== undefined && (
                                <span className="rounded bg-primary-fixed px-2 py-0.5 text-label-md text-on-primary-fixed">
                                  고침
                                </span>
                              )}
                            </div>
                            {appliedRules.length > 0 && (
                              <div className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
                                <Icon name="rule" className="text-[14px] text-secondary" />
                                적용된 규칙: {appliedRules.map((rule) => rule.text).join(' · ')}
                              </div>
                            )}
                          </div>
                          <StatusLabel
                            status={line.status}
                            sourceIds={line.sourceIds}
                            missingTokens={line.missingTokens}
                          />
                        </div>

                        {editing === index ? (
                          <textarea
                            autoFocus
                            defaultValue={line.editedText ?? line.text}
                            onClick={(event) => event.stopPropagation()}
                            onBlur={(event) => finishEdit(index, event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                                event.preventDefault()
                                event.currentTarget.blur()
                              }
                            }}
                            className="w-full resize-none rounded-lg bg-background p-3.5 text-body-md leading-relaxed outline-none ring-2 ring-primary"
                            rows={2}
                          />
                        ) : (
                          <p className="rounded-lg bg-background p-3.5 text-body-md leading-relaxed">
                            {line.editedText ?? line.text}
                          </p>
                        )}

                        {isFlagged && (
                          <div className="flex items-start gap-2.5 rounded-lg bg-orange-50 p-3.5 text-orange-950">
                            <Icon
                              name="notification_important"
                              className="mt-0.5 shrink-0 text-[19px] text-orange-600"
                            />
                            <p className="text-body-sm leading-snug">
                              <strong className="font-semibold text-orange-900">확인할 곳:</strong>{' '}
                              {describeReason(line, sentences)}
                            </p>
                          </div>
                        )}

                        <div className="space-y-2 rounded-lg bg-surface-low p-3.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-label-md text-secondary">
                              <Icon name="menu_book" className="text-[16px]" />
                              {cited.length > 0
                                ? `짚은 재료: ${cited.map((item) => circled(item.id)).join(' ')}`
                                : '짚은 재료가 없어요'}
                            </div>
                            {cited.length > 0 && (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  setSelected(index)
                                  sentenceRefs.current[cited[0].id - 1]?.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'center',
                                  })
                                }}
                                className="inline-flex items-center gap-0.5 text-label-sm text-primary hover:underline"
                              >
                                재료에서 보기
                                <Icon name="arrow_outward" className="text-[13px]" />
                              </button>
                            )}
                          </div>
                          {cited.map((item) => (
                            <blockquote
                              key={item.id}
                              className="border-l-2 border-slate-400 pl-3 text-body-sm italic text-on-surface-variant"
                            >
                              “{item.text}”
                            </blockquote>
                          ))}
                        </div>

                        <div className="flex items-center justify-end gap-1.5 text-label-md">
                          {line.editedText !== undefined && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                updateLine(index, { editedText: undefined })
                              }}
                              className="rounded px-2.5 py-1 text-secondary hover:bg-surface"
                            >
                              되돌리기
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              setSelected(index)
                              setEditing(index)
                            }}
                            className="inline-flex items-center gap-1 rounded bg-surface px-3 py-1.5 hover:bg-surface-high"
                          >
                            <Icon name="edit" className="text-[15px]" />
                            고치기
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>

                <section className="flex flex-col items-center justify-between gap-3 rounded-xl bg-surface-lowest p-4 shadow-sm md:flex-row">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary">
                      <Icon name="content_copy" className="text-[22px]" />
                    </div>
                    <div>
                      <h3 className="text-headline-sm">다 봤다면 복사해서 쓰세요</h3>
                      <p className="text-body-sm text-on-surface-variant">
                        AI 결과는 정답을 보장하지 않아요. 고친 내용까지 반영해서 복사하고, 쓰기 전에 확인할 곳을 한 번 더 살펴보세요.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={copyAndFinish}
                    className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-body-sm font-semibold text-on-primary shadow-sm hover:bg-primary-container md:w-auto"
                  >
                    <Icon name="content_copy" className="text-[18px]" />
                    복사하고 끝내기
                  </button>
                </section>
                {copyState === 'done' && (
                  <p role="status" className="text-body-sm font-semibold text-primary">
                    복사했어요
                  </p>
                )}
                {copyState === 'failed' && (
                  <div role="status" className="rounded-xl bg-surface-lowest p-4 shadow-sm">
                    <p className="text-body-sm text-orange-900">복사하지 못했어요. 아래 글을 직접 복사해 주세요.</p>
                    <textarea
                      ref={fallbackRef}
                      readOnly
                      value={finalText}
                      className="mt-2 h-32 w-full rounded bg-background p-2 text-body-sm ring-1 ring-outline-variant"
                    />
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <footer className="border-t border-outline-variant bg-surface-lowest py-3">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-8 text-body-sm text-on-surface-variant">
          <Icon name="shield_with_heart" className="text-[16px] text-outline" />
          회사 기밀이나 개인정보는 넣지 마세요. 작업과 규칙은 이 브라우저에만 저장돼요. 지금은 예시 모드라 재료는 AI로 전송하지 않아요.
        </div>
      </footer>
    </div>
  )
}
