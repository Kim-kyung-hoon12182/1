import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Card from '@/components/Card'
import { TextArea } from '@/components/Field'
import Icon from '@/components/Icon'
import Notice from '@/components/Notice'
import PanelHeader from '@/components/PanelHeader'
import type { RunSession } from '@/hooks/useRunSession'
import { cn } from '@/lib/cn'
import { circled, MAX_MATERIAL_CHARS } from '@/lib/material'
import { linesCiting } from '@/lib/run'
import type { Task } from '@/types/task'

type SourcePanelProps = {
  task: Task
  session: RunSession
}

// 왼쪽 칸: 실행 전에는 자료 입력, 실행 후에는 번호가 붙은 자료 문장
export default function SourcePanel({ task, session }: SourcePanelProps) {
  const { result, sentences, input } = session
  const counter = result
    ? `문장 ${sentences.length}개`
    : `${input.length.toLocaleString()} / ${MAX_MATERIAL_CHARS.toLocaleString()}자`

  return (
    <Card as="section" className="flex flex-col lg:sticky lg:top-20 lg:col-span-5">
      <PanelHeader
        step="1단계"
        icon="description"
        title="자료"
        description="글의 바탕이 될 메모나 자료를 붙여 넣으세요."
        aside={
          <Badge size="md" className="py-1">
            {counter}
          </Badge>
        }
      />
      {result ? <SentenceList session={session} /> : <MaterialInput task={task} session={session} />}
    </Card>
  )
}

function SentenceList({ session }: { session: RunSession }) {
  const { sentences, lines, highlighted, sentenceRefs } = session
  return (
    <ol className="relative max-h-[calc(100vh-17rem)] min-h-40 space-y-1.5 overflow-y-auto rounded-lg bg-background p-3 text-body-sm">
      {sentences.map((sentence, index) => {
        const citedBy = linesCiting(index + 1, lines)
        return (
          <li
            key={index}
            ref={(el) => {
              sentenceRefs.current[index] = el
            }}
            className={cn(
              'scroll-mt-24 rounded p-2 transition-colors',
              highlighted.has(index + 1) ? 'bg-mark ring-1 ring-mark-line' : 'hover:bg-surface-low',
            )}
          >
            <div className="mb-0.5 flex items-center justify-between gap-2">
              <span className="text-label-md text-outline">자료 {circled(index + 1)}</span>
              {citedBy.length > 0 && (
                <Badge icon="link" className="bg-surface-lowest shadow-xs">
                  결과 {citedBy.join('·')}번 줄의 근거
                </Badge>
              )}
            </div>
            <p>{sentence}</p>
          </li>
        )
      })}
    </ol>
  )
}

function MaterialInput({ task, session }: SourcePanelProps) {
  const { sample, input, notice, running } = session
  return (
    <>
      <div className="mb-2 flex items-center justify-between rounded-lg bg-surface-low px-3 py-2">
        {sample ? (
          <Button size="sm" variant="soft" icon="history_edu" title="예시 자료를 바로 입력해요" onClick={session.loadSample}>
            예시 자료 넣기
          </Button>
        ) : (
          <span />
        )}
        <Button size="sm" variant="ghost" icon="delete_outline" onClick={session.clearInput}>
          지우기
        </Button>
      </div>
      <TextArea
        tone="paper"
        value={input}
        readOnly={running}
        maxLength={MAX_MATERIAL_CHARS}
        onChange={(event) => session.setInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.nativeEvent.isComposing) {
            event.preventDefault()
            session.run()
          }
        }}
        aria-label="자료"
        placeholder="예: 이번 주에 한 일 메모"
        className="h-[clamp(9rem,calc(100vh-36rem),18rem)] text-body-sm"
      />
      {notice && (
        <Notice tone="flag" role="status" className="mt-3">
          {notice}
        </Notice>
      )}
      <div className="mt-4 flex flex-col gap-2">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="group rounded-xl py-3.5"
          onClick={session.run}
          disabled={!input.trim() || running}
        >
          <Icon name={running ? 'hourglass_top' : 'bolt'} className="text-[22px] transition-transform group-hover:scale-110" />
          {running ? '결과를 쓰고 있어요' : '실행하기'}
          {!running && <kbd className="hidden rounded bg-on-primary/20 px-1.5 py-0.5 text-label-sm md:inline">Ctrl + Enter</kbd>}
        </Button>
        <p className="px-1 text-label-sm text-on-surface-variant">이 작업의 규칙 {task.rules.length}개를 지키며 글을 써요.</p>
      </div>
    </>
  )
}
