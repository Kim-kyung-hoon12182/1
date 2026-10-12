import { useEffect, useMemo, useRef, useState } from 'react'
import { getSample } from '@/data/sampleTasks'
import { generateRun, type ApiErrorCode } from '@/lib/api'
import { LEAVE_UNFINISHED_MESSAGE } from '@/lib/leave'
import { buildSampleResult, finalTextOf, flaggedIndexes, type RunResult } from '@/lib/run'
import { buildRunRecord } from '@/lib/runRecord'
import type { OutputLine, Run, Task } from '@/types/task'

type CopyState = 'idle' | 'done' | 'failed'

// 실패해도 자료는 그대로 남아 있다 (F-03)
// 카드가 차례로 나타나는 시간(마지막 카드가 다 나타날 때까지)
const REVEAL_MS = 1500

const RUN_FAILURE_NOTICE: Record<ApiErrorCode, string> = {
  no_key: 'AI 키가 설정되지 않아서 실행할 수 없어요. 예시 작업의 예시 자료는 키 없이도 돼요.',
  rate_limit: '지금 사용하는 사람이 많아요. 1분 뒤에 다시 실행해 주세요. 자료는 그대로 남아 있어요.',
  upstream: 'AI 응답을 받지 못했어요. 잠시 뒤 다시 실행해 주세요. 자료는 그대로 남아 있어요.',
  bad_request: '자료가 너무 길거나 형식이 맞지 않아요. 자료를 줄여서 다시 실행해 주세요.',
  network: '연결에 실패했어요. 인터넷 연결을 확인하고 다시 실행해 주세요. 자료는 그대로 남아 있어요.',
}

// 작업 하나를 실행하는 동안의 상태와 동작 (S3). [복사하고 끝내기]를 누르면 onRecord로 실행 기록을 넘긴다 (F-06).
export function useRunSession(task: Task, prefillMaterial: boolean, onRecord: (run: Run) => void) {
  const sample = getSample(task.sampleKey)
  const [input, setInput] = useState(prefillMaterial && sample ? sample.material : '')
  const [result, setResult] = useState<RunResult | null>(null)
  const [notice, setNotice] = useState('')
  const [running, setRunning] = useState(false)
  const [isSampleResult, setIsSampleResult] = useState(false)
  // 결과가 도착한 직후 잠깐만 카드를 차례로 보여 준다
  const [revealing, setRevealing] = useState(false)
  const revealTimer = useRef<number>(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [editing, setEditing] = useState<number | null>(null)
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const [cardScrollTarget, setCardScrollTarget] = useState<{ index: number } | null>(null)
  const [finished, setFinished] = useState<Run | null>(null)
  const shownAt = useRef(0)
  const sentenceRefs = useRef<(HTMLLIElement | null)[]>([])
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const fallbackRef = useRef<HTMLTextAreaElement>(null)
  // 고치는 중인 글. [복사하고 끝내기]를 누를 때 아직 확정 전이면 이 글까지 반영한다
  const draftRef = useRef<{ index: number; value: string } | null>(null)

  useEffect(() => () => window.clearTimeout(revealTimer.current), [])

  const lines = useMemo(() => result?.lines ?? [], [result])
  const sentences = result?.sentences ?? []
  const flagged = useMemo(() => flaggedIndexes(lines), [lines])
  const highlighted = new Set(selected === null ? [] : lines[selected]?.sourceIds)
  const finalText = finalTextOf(lines)
  // 지금 고른 줄이 확인할 곳 중 몇 번째인지 (고르지 않았거나 확인할 곳이 아니면 0)
  const flaggedPosition = selected === null ? 0 : flagged.indexOf(selected) + 1

  // 자료 칸 안에서만 움직인다. 화면 전체가 스크롤되면 지금 보던 결과 줄이 밀려난다.
  const scrollToSentence = (id: number) => {
    const sentence = sentenceRefs.current[id - 1]
    const list = sentence?.parentElement
    if (!sentence || !list) return
    const top = sentence.offsetTop - list.clientHeight / 2 + sentence.offsetHeight / 2
    list.scrollTo({ top, behavior: 'smooth' })
  }

  // 줄을 고르면 자료 칸이 그 줄이 참고한 자료로 옮겨 간다 (S3-5). 줄을 고칠 때마다 움직이지 않도록 선택이 바뀔 때만 실행한다.
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

  function showResult(next: RunResult, isSample: boolean) {
    setNotice('')
    setResult(next)
    setIsSampleResult(isSample)
    shownAt.current = Date.now()
    resetView()
    setRevealing(true)
    window.clearTimeout(revealTimer.current)
    revealTimer.current = window.setTimeout(() => setRevealing(false), REVEAL_MS)
  }

  // 체험용 작업의 예시 자료는 AI 없이 예시 결과를 보여 주고(F-09), 그 밖의 자료는 AI에 보낸다(F-03)
  async function run() {
    const material = input.trim()
    if (!material || running) return
    if (sample && material === sample.material) return showResult(buildSampleResult(sample, material), true)
    setRunning(true)
    setNotice('')
    const outcome = await generateRun(task, material)
    setRunning(false)
    if (outcome.result) showResult(outcome.result, false)
    else setNotice(RUN_FAILURE_NOTICE[outcome.code])
  }

  function backToInput() {
    // 복사하지 않은 결과가 있으면 지우기 전에 묻는다
    if (result && !finished && !window.confirm(LEAVE_UNFINISHED_MESSAGE)) return
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
  const editedTextOf = (index: number, value: string) => {
    const next = value.trim()
    return next && next !== lines[index].text ? next : undefined
  }

  function finishEdit(index: number, value: string) {
    updateLine(index, { editedText: editedTextOf(index, value) })
    draftRef.current = null
    setEditing(null)
  }

  const trackDraft = (index: number, value: string) => {
    draftRef.current = { index, value }
  }

  const revertLine = (index: number) => updateLine(index, { editedText: undefined })

  // 줄 삭제: 고치던 중이면 그 글은 접어 두고(고친 글은 남겨 되돌리면 살아난다) 줄을 뺀다
  function deleteLine(index: number) {
    if (finished) return
    if (editing === index) {
      draftRef.current = null
      setEditing(null)
    }
    updateLine(index, { deleted: true })
    if (selected === index) setSelected(null)
  }

  const restoreLine = (index: number) => updateLine(index, { deleted: undefined })

  function goToFlagged(direction: 'first' | 'next') {
    if (flagged.length === 0) return
    const target =
      direction === 'first' || selected === null ? flagged[0] : (flagged.find((index) => index > selected) ?? flagged[0])
    setSelected(target)
    setCardScrollTarget({ index: target })
  }

  async function copyText(text = finalText) {
    try {
      await navigator.clipboard.writeText(text)
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
    // 고치던 줄이 아직 확정 전이면(입력칸에 커서가 있는 채로 눌렀을 때) 그 글까지 반영한다
    const draft = draftRef.current
    const current =
      editing !== null && draft?.index === editing
        ? lines.map((line, i) => (i === editing ? { ...line, editedText: editedTextOf(editing, draft.value) } : line))
        : lines
    const text = finalTextOf(current)
    const copied = await copyText(text)
    const record = buildRunRecord({
      id: crypto.randomUUID(),
      number: task.runs.length + 1,
      input: input.trim(),
      sentences,
      lines: current,
      flaggedCount: flagged.length,
      elapsedMs: Date.now() - shownAt.current,
      copied,
      finalText: text,
      isSample: isSampleResult,
      createdAt: new Date().toISOString(),
    })
    draftRef.current = null
    setResult((prev) => (prev ? { ...prev, lines: current } : prev))
    setEditing(null)
    onRecord(record)
    setFinished(record)
  }

  return {
    sample,
    input,
    setInput,
    result,
    notice,
    running,
    revealing,
    isSampleResult,
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
    trackDraft,
    revertLine,
    deleteLine,
    restoreLine,
    goToFlagged,
    copyText,
    copyAndFinish,
  }
}

export type RunSession = ReturnType<typeof useRunSession>
