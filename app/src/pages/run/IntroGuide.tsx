import Button from '@/components/Button'
import Card from '@/components/Card'
import Icon from '@/components/Icon'
import { cn } from '@/lib/cn'
import { GUIDE_STEPS } from './copy'

type IntroGuideProps = {
  /** 지금 몇 번째 단계인지 (1부터) */
  currentStep: number
  open: boolean
  onToggle: () => void
}

// 사용 순서를 한 줄로 보여 준다. 자세한 설명은 펼쳤을 때만 보여서 실행 영역을 화면 위쪽에 둔다.
export default function IntroGuide({ currentStep, open, onToggle }: IntroGuideProps) {
  return (
    <Card as="section" bordered padding="sm" className="mb-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="flex items-center gap-1 text-label-md">
          <Icon name="explore" className="text-[18px] text-primary" />
          사용 순서
        </span>
        <ol className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1">
          {GUIDE_STEPS.map((step, index) => {
            const active = currentStep === index + 1
            return (
              <li
                key={step.title}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'flex items-center gap-1.5 rounded-full py-0.5 pl-0.5 pr-2.5 text-label-md',
                  active ? 'bg-primary/10 text-primary' : 'text-on-surface-variant',
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-label-sm font-bold',
                    active ? 'bg-primary text-on-primary' : 'bg-surface-high text-secondary',
                  )}
                >
                  {index + 1}
                </span>
                {step.title}
              </li>
            )
          })}
        </ol>
        <Button
          size="sm"
          variant="ghost"
          icon={open ? 'expand_less' : 'expand_more'}
          aria-expanded={open}
          onClick={onToggle}
        >
          {open ? '접기' : '자세히'}
        </Button>
      </div>
      {open && (
        <ul className="mt-3 grid gap-3 border-t border-outline-variant pt-3 md:grid-cols-3">
          {GUIDE_STEPS.map((step, index) => (
            <li key={step.title} className="text-body-sm">
              <strong className="text-on-surface">
                {index + 1}. {step.title}
              </strong>
              <p className="mt-0.5 text-on-surface-variant">{step.body}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
