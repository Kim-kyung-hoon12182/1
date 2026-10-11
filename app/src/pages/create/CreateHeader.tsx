import Badge from '@/components/Badge'
import Icon from '@/components/Icon'
import PageHeader from '@/components/PageHeader'
import type { Phase } from '@/hooks/useTaskDraft'
import { cn } from '@/lib/cn'

const STEPS = [
  { step: 1, label: '질문 답하기' },
  { step: 2, label: '규칙 확인·저장' },
]

const PHASE_STEP: Record<Phase, number> = { questions: 1, rules: 2 }

type CreateHeaderProps = {
  phase: Phase
  /** 한 단계 뒤로 (2단계면 질문으로, 1단계면 목록으로) */
  onBack: () => void
}

// 위쪽 경로 표시와 제목, 단계 표시줄
export default function CreateHeader({ phase, onBack }: CreateHeaderProps) {
  const inRules = phase === 'rules'

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 py-1 text-body-sm text-on-surface-variant hover:text-primary"
        >
          <Icon name="arrow_back" className="text-[18px]" />
          {inRules ? '1단계: 질문 답하기로 돌아가기' : '내 작업 목록으로 돌아가기'}
        </button>
        <nav aria-label="현재 위치" className="hidden items-center gap-1 text-label-sm text-on-surface-variant sm:flex">
          <span>내 작업</span>
          <span className="text-outline-variant">/</span>
          <span className={cn(!inRules && 'text-headline-sm text-primary')}>새 작업 등록</span>
          {inRules && (
            <>
              <span className="text-outline-variant">/</span>
              <span className="text-headline-sm text-primary">규칙 확인·수정</span>
            </>
          )}
        </nav>
      </div>

      <PageHeader
        card
        eyebrow={
          <div className="flex items-center gap-2">
            <Badge pill icon="auto_awesome" className="bg-surface-high text-primary">
              {inRules ? '규칙 초안' : '질문에 답하면 규칙을 만들어요'}
            </Badge>
            <span className="text-label-sm text-on-surface-variant">{PHASE_STEP[phase]} / 2단계</span>
          </div>
        }
        title={inRules ? '규칙 확인·수정' : '새 작업 등록'}
        description={
          inRules
            ? '초안을 읽어 보고 고칠 곳을 고친 뒤 저장하세요. 저장한 규칙만 이 작업에 쓰여요.'
            : '반복하는 일을 한 번 등록해 두면, 다음부터는 재료만 넣고 실행해요.'
        }
        actions={<Stepper current={PHASE_STEP[phase]} />}
      />
    </>
  )
}

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 rounded-xl bg-surface-low p-1">
      {STEPS.map(({ step, label }, index) => {
        const done = step < current
        const active = step === current
        return (
          <li key={step} className="flex items-center gap-2">
            {index > 0 && <Icon name="trending_flat" className="text-[16px] text-secondary" />}
            <span
              aria-current={active ? 'step' : undefined}
              className={cn(
                'flex items-center gap-1 rounded-lg px-3 py-1 text-label-md',
                active && 'bg-primary-container text-on-primary shadow-sm',
                done && 'bg-surface-lowest text-on-surface-variant shadow-xs',
                !active && !done && 'text-on-surface-variant',
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-label-sm',
                  active && 'bg-surface-lowest font-bold text-primary',
                  done && 'bg-neutral-line text-white',
                  !active && !done && 'bg-surface-high',
                )}
              >
                {done ? <Icon name="check" className="text-[13px]" /> : step}
              </span>
              <span className={cn(done && 'line-through')}>
                {step}단계: {label}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
