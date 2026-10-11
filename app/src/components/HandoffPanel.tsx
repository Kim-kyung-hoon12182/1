import { useState } from 'react'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import Notice from '@/components/Notice'
import RunChips from '@/components/RunChips'
import { buildHandoffPrompt } from '@/lib/handoff'
import { countStreak } from '@/lib/streak'
import type { Task } from '@/types/task'

type HandoffPanelProps = {
  task: Task
  /** [나중에]를 눌렀을 때 */
  onClose: () => void
  /** 지시문 영역을 처음부터 펼칠지 */
  defaultOpen?: boolean
}

const SETUP_STEPS = [
  '아래 지시문을 복사해요.',
  '쓰는 AI 서비스(예: ChatGPT)의 예약 작업 기능에서 새 작업을 만들고 지시문을 붙여 넣어요.',
  '실행 주기를 정하고, 실행될 때마다 자료(메모)를 직접 붙여 넣어요.',
]

type CopyState = 'idle' | 'done' | 'failed'

// S5 맡겨볼 만한 때 (정의서 S5, F-07, F-08). 안 고친 기록이 연속으로 쌓였을 때 다른 곳에 맡기는 방법을 알려 준다.
// 확인 생략(F-13)은 아직 없어서 "다른 곳에 맡기기"만 선택지로 둔다.
export default function HandoffPanel({ task, onClose, defaultOpen = false }: HandoffPanelProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const streak = countStreak(task.runs)
  const prompt = buildHandoffPrompt(task)

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopyState('done')
    } catch {
      setCopyState('failed')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
          <Icon name="handshake" className="text-[22px]" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <Badge pill tone="primary" className="font-semibold">
            맡겨볼 만한 때예요
          </Badge>
          <h3 className="text-headline-sm">
            이 작업은 최근 {streak}번 연속 안 고치고 썼어요. 맡겨볼까요?
          </h3>
          <p className="text-body-sm text-on-surface-variant">
            안 고친 기록이 쌓였다는 뜻이지, 결과가 정확하다는 뜻은 아니에요. 맡길지는 직접 정하세요.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-label-sm text-on-surface-variant">전체 기록</span>
        <RunChips runs={task.runs} limit={task.runs.length} />
      </div>

      <div className="rounded-lg border border-outline-variant bg-surface-low p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-headline-sm">다른 곳에 맡기기</h4>
            <p className="text-body-sm text-on-surface-variant">
              이 작업의 규칙으로 만든 지시문을 예약 작업에 붙여 넣어 정기적으로 실행할 수 있어요.
            </p>
          </div>
          <Button
            icon={open ? 'expand_less' : 'expand_more'}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? '지시문 접기' : '지시문 보기'}
          </Button>
        </div>

        {open && (
          <div className="mt-4 space-y-3">
            <ol className="space-y-1.5">
              {SETUP_STEPS.map((step, index) => (
                <li key={step} className="flex items-start gap-2 text-body-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-label-sm font-bold text-on-primary">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <div className="rounded-lg bg-inverse-surface p-4 text-inverse-on-surface shadow-inner">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-label-sm opacity-70">지시문 (앱이 규칙과 답변으로 만들었어요)</span>
              </div>
              <pre className="select-all whitespace-pre-wrap text-body-sm leading-relaxed">{prompt}</pre>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary" icon="content_copy" onClick={copyPrompt}>
                지시문 복사
              </Button>
              {copyState === 'done' && (
                <span role="status" className="text-body-sm font-semibold text-primary">
                  복사했어요
                </span>
              )}
            </div>
            {copyState === 'failed' && (
              <Notice tone="flag" icon="warning" role="status">
                복사하지 못했어요. 위 글을 직접 선택해서 복사해 주세요.
              </Notice>
            )}

            <Notice tone="info" icon="info">
              예약 작업은 메모를 스스로 가져오지 못해서 <strong>메모는 직접 붙여 넣어야 해요.</strong> 서비스마다 메뉴 이름과 위치가 달라서, 자세한 방법은 쓰는 서비스의 안내를 확인해 주세요. 이 앱이 외부 서비스에 자동으로 보내거나 연결하지는 않아요.
            </Notice>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" onClick={onClose}>
          나중에
        </Button>
      </div>
    </div>
  )
}
