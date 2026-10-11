import { useEffect, useMemo, useRef, useState } from 'react'
import { getSample } from '@/data/sampleTasks'
import { buildSampleResult, finalTextOf, flaggedIndexes, type RunResult } from '@/lib/run'
import { buildRunRecord } from '@/lib/runRecord'
import type { OutputLine, Run, Task } from '@/types/task'

type CopyState = 'idle' | 'done' | 'failed'

const NO_SAMPLE_NOTICE = 'AI 연결 전이라 이 작업은 아직 실행할 수 없어요. 예시 작업은 바로 실행해 볼 수 있어요.'
const SAMPLE_ONLY_NOTICE = 'AI 연결 전이라 지금은 예시 재료로만 실행할 수 있어요.'

// 작업 하나를 실행하는 동안의 상태와 동작 (S3). [복사하고 끝내기]를 누르면 onRecord로 실행 기록을 넘긴다 (F-06).
export function useRunSession(task: Task, prefillMaterial: boolean, onRecord: (run: Run) => void) {
  const sample = getSample(task.sampleKey)
  const [input, setInput] = useState(prefillMaterial && sample ? sample.material : '')
  const [result, setResult] = useState<RunResult | null>(null)
  const [notice, setNotice] = useState('')
  const [selected, setSelected] = useState<number | null>(null)
  const [editing, setEditing] = useState<number | null>(null)
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const [cardScrollTarget, setCardScrollTarget] = useState<{ index: number } | null>(null)
  const [finished, setFinished] = useState<Run | null>(null)
  const shownAt = useRef(0)
  const sentenceRefs = useRef<(HTMLLIElement | null)[]>([])
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const fallbackRef = useRef<HTMLTextAreaElement>(null)

  const lines = useMemo(() => result?.lines ?? [], [result])
  const sentences = result?.sentences ?? []
  const flagged = useMemo(() => flaggedIndexes(lines), [lines])
  const highlighted = new Set(selected === null ? [] : lines[selected]?.sourceIds)
  const finalText = finalTextOf(lines)
  // 지금 고른 줄이 확인할 곳 중 몇 번째인지 (고르지 않았거나 확인할 곳이 아니면 0)
  const flaggedPosition = selected === null ? 0 : flagged.indexOf(selected) + 1

  // 재료 칸 안에서만 움직인다. 화면 전체가 스크롤되면 지금 보던 결과 줄이 밀려난다.
  const scrollToSentence = (id: number) => {
    const sentence = sentenceRefs.current[id - 1]
    const list = sentence?.parentElement
    if (!sentence || !list) return
    const top = sentence.offsetTop - list.clientHeight / 2 + sentence.offsetHeight / 2
    list.scrollTo({ top, behavior: 'smooth' })
  }

  // 줄을 고르면 재료 칸이 그 줄이 짚은 재료로 옮겨 간다 (S3-5). 줄을 고칠 때마다 움직이지 않도록 선택이 바뀔 때만 실행한다.
  useEffect(() => {
    if (selected === null) return
    const firstId = lines[selected]?.sourceIds[0]
    if (firstId) scrollToSentence(firstId)
  }, [selected])

  // [첫 번째로 이동]·[다음 확인할 곳]: 카드가 펼쳐진 뒤에 화면 가운데로 가져온다
  useEffect(() => {
    if (cardScrollTarget) cardRefs.current[cardScrollTarget.index]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [cardScrollTarget])

  useEffect(() => {
    if (copyState === 'failed') fallbackRef.current?.select()
  }, [copyState])

  const resetView = () => {
    setSelected(null)
    setEditing(null)
    setCopyState('idle')
    setFinished(null)
  }

  function loadSample() {
    if (sample) setInput(sample.material)
    setNotice('')
  }

  function clearInput() {
    setInput('')
    setNotice('')
  }

  function run() {
    if (!input.trim()) return
    if (!sample) return setNotice(NO_SAMPLE_NOTICE)
    if (input.trim() !== sample.material) return setNotice(SAMPLE_ONLY_NOTICE)
    setNotice('')
    setResult(buildSampleResult(sample, input.trim()))
    shownAt.current = Date.now()
    resetView()
  }

  function backToInput() {
    setResult(null)
    resetView()
  }

  function updateLine(index: number, patch: Partial<OutputLine>) {
    if (finished) return
    setResult((prev) =>
      prev ? { ...prev, lines: prev.lines.map((line, i) => (i === index ? { ...line, ...patch } : line)) } : prev,
    )
    setCopyState('idle')
  }

  function startEdit(index: number) {
    if (finished) return
    setSelected(index)
    setEditing(index)
  }

  // 글이 바뀌지 않았거나 비웠으면 고친 것으로 치지 않는다
  function finishEdit(index: number, value: string) {
    const next = value.trim()
    updateLine(index, { editedText: next && next !== lines[index].text ? next : undefined })
    setEditing(null)
  }

  const revertLine = (index: number) => updateLine(index, { editedText: undefined })

  function goToFlagged(direction: 'first' | 'next') {
    if (flagged.length === 0) return
    const target =
      direction === 'first' || selected === null ? flagged[0] : (flagged.find((index) => index > selected) ?? flagged[0])
    setSelected(target)
    setCardScrollTarget({ index: target })
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(finalText)
      setCopyState('done')
      return true
    } catch {
      setCopyState('failed')
      return false
    }
  }

  // F-06 순서: ① 복사 ② 복사가 실패해도 기록은 확정(성공 여부는 copied에 남김) ③ 다음 행동 안내
  async function copyAndFinish() {
    if (!result || finished) return
    const copied = await copyText()
    const record = buildRunRecord({
      id: crypto.randomUUID(),
      number: task.runs.length + 1,
      input: input.trim(),
      sentences,
      lines,
      flaggedCount: flagged.length,
      elapsedMs: Date.now() - shownAt.current,
      copied,
      finalText,
      isSample: true,
      createdAt: new Date().toISOString(),
    })
    onRecord(record)
    setFinished(record)
  }

  return {
    sample,
    input,
    setInput,
    result,
    notice,
    lines,
    sentences,
    flagged,
    flaggedPosition,
    highlighted,
    selected,
    editing,
    copyState,
    finished,
    finalText,
    sentenceRefs,
    cardRefs,
    fallbackRef,
    select: setSelected,
    scrollToSentence,
    loadSample,
    clearInput,
    run,
    backToInput,
    startEdit,
    finishEdit,
    revertLine,
    goToFlagged,
    copyText,
    copyAndFinish,
  }
}

export type RunSession = ReturnType<typeof useRunSession>
