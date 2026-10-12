import { useState } from 'react'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Card from '@/components/Card'
import { shortMaterial } from '@/lib/history'
import { editedPairs } from '@/lib/rules'
import type { HistoryEntry } from '@/lib/history'

type RunRowProps = {
  entry: HistoryEntry
  onRemove: () => void
  onRun: () => void
}

const formatDate = (iso: string) => {
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// 실행 기록 한 줄: 결과 상태와 자료, 눌러서 결과와 고친 곳을 읽는다
export default function RunRow({ entry, onRemove, onRun }: RunRowProps) {
  const { run, taskName, isDemo } = entry
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [copied, setCopied] = useState(false)
  const pairs = editedPairs(run.lines)

  async function copy() {
    try {
      await navigator.clipboard.writeText(run.finalText)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Card as="li" bordered className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-headline-sm">{taskName}</span>
        <span className="text-label-md text-secondary">{run.number}회차</span>
        <span className="text-label-md text-on-surface-variant">{formatDate(run.createdAt)}</span>
        {isDemo && <Badge tone="primary">예시</Badge>}
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <Badge size="md" tone={run.edited || run.editedAfter === 'yes' ? 'flag' : 'muted'}>
            {run.edited ? '고침' : run.editedAfter === 'yes' ? '복사 뒤 고침' : '안 고침'}
          </Badge>
          {run.passState === 'quick_pass' && <Badge size="md">빠르게 넘김</Badge>}
          {!run.copied && (
            <Badge size="md" tone="flagSoft" icon="warning">
              복사 안 됨
            </Badge>
          )}
        </div>
      </div>

      <p className="text-body-sm text-on-surface-variant">
        자료: {shortMaterial(run.input) || '(비어 있음)'} · 확인할 곳 {run.flaggedCount}개 · {run.elapsedSeconds}초
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" data-tour="run-detail" icon={open ? 'expand_less' : 'expand_more'} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {open ? '접기' : '결과 보기'}
        </Button>
        <Button size="sm" variant="ghost" icon="play_arrow" onClick={onRun}>
          이 작업 실행
        </Button>
        {confirming ? (
          <span role="alert" className="flex flex-wrap items-center gap-1.5 text-body-sm font-semibold text-flag-text">
            이 기록을 지울까요? 연속 안 고침 계산도 달라져요.
            <Button size="sm" variant="primary" onClick={onRemove}>
              지우기
            </Button>
            <Button size="sm" onClick={() => setConfirming(false)}>
              취소
            </Button>
          </span>
        ) : (
          <Button size="sm" variant="ghost" icon="delete" onClick={() => setConfirming(true)}>
            기록 삭제
          </Button>
        )}
      </div>

      {open && (
        <div className="space-y-3 rounded-lg bg-surface-low p-3">
          {run.finalText ? (
            <>
              <p className="text-label-md text-secondary">복사한 결과</p>
              <pre className="whitespace-pre-wrap break-words rounded-lg bg-background p-3 font-sans text-body-sm">{run.finalText}</pre>
              <Button size="sm" icon="content_copy" onClick={copy}>
                다시 복사
              </Button>
              {copied && <span className="ml-2 text-body-sm font-semibold text-primary">복사했어요</span>}
            </>
          ) : (
            <p className="text-body-sm text-on-surface-variant">저장된 결과가 없어요(예시로 미리 채운 기록이에요).</p>
          )}
          {pairs.length > 0 && (
            <div className="space-y-2">
              <p className="text-label-md text-secondary">고친 곳 {pairs.length}개</p>
              {pairs.map((pair, index) => (
                <div key={index} className="space-y-1 text-body-sm">
                  <p className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 rounded bg-neutral-soft px-1.5 text-label-sm text-neutral-text">전</span>
                    <span className="text-on-surface-variant line-through decoration-outline">{pair.before}</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 rounded bg-primary-fixed px-1.5 text-label-sm text-on-primary-fixed">후</span>
                    <span>{pair.after}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
