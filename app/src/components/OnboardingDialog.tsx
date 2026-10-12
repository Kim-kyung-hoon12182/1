import Button from '@/components/Button'
import Dialog from '@/components/Dialog'
import Icon from '@/components/Icon'

type OnboardingDialogProps = {
  onTour: () => void
  onSkip: () => void
}

const LOOP = [
  { icon: 'auto_awesome', label: 'AI가 씀' },
  { icon: 'edit', label: '내가 고침' },
  { icon: 'bookmark', label: '앱이 규칙으로 기억' },
  { icon: 'repeat', label: '다음엔 덜 고침' },
]

// S0 첫 방문 안내: 무엇을 하는 앱인지(고친 걸 기억해서 다음엔 덜 고치게), 저장·전송 범위, 주의를 알리고 안내 모드로 이어 준다
export default function OnboardingDialog({ onTour, onSkip }: OnboardingDialogProps) {
  return (
    <Dialog title="AI가 쓴 글을 고치면, 앱이 기억해요" onClose={onSkip}>
      <p className="mb-4 text-body-md text-on-surface-variant">
        매주 같은 보고서를 AI에게 시키고 같은 걸 고치고 있다면, 고친 내용을 규칙으로 남겨 다음엔 덜 고치게 해요.
      </p>

      <ol aria-label="이 앱이 하는 일" className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] sm:items-stretch">
        {LOOP.flatMap((item, index) => [
          <li key={item.label} className="flex flex-col items-center gap-1 rounded-lg border border-outline-variant bg-surface-lowest px-2 py-3 text-center">
            <Icon name={item.icon} className="text-[22px] text-primary" />
            <span className="text-body-sm leading-snug">{item.label}</span>
          </li>,
          index < LOOP.length - 1 && (
            <li key={`arrow-${index}`} aria-hidden className="hidden items-center text-outline sm:flex">
              <Icon name="arrow_forward" className="text-[18px]" />
            </li>
          ),
        ])}
      </ol>

      <div className="mb-4 space-y-1 rounded-lg bg-surface-low p-3 text-body-sm leading-relaxed">
        <p className="text-label-md text-secondary">예시</p>
        <p>
          고침: <span className="text-on-surface-variant line-through decoration-outline">매출이 1억 원으로 목표를 초과 달성했습니다.</span> → 자료에 없는 값은 "자료에 없음"으로 적음
        </p>
        <p>
          기억한 규칙: <span className="rounded bg-primary-fixed px-1.5 py-0.5 text-on-primary-fixed">메모에 없는 내용은 자료에 없다고 적는다</span>
        </p>
      </div>

      <div className="space-y-3 text-body-sm leading-relaxed text-on-surface-variant">
        <p>AI의 결과가 정확하다는 뜻은 아니에요. 확인할 곳을 표시하고, 고친 기록을 쌓아요.</p>
        <p>작업과 기록은 이 브라우저에만 저장돼요. 다른 기기에서는 보이지 않아요.</p>
        <p>
          작업을 등록하거나 실행할 때 입력한 답변·자료·규칙과, 규칙 후보를 만들 때의 고친 내용은 Google Gemini로 보내져요. 무료 이용 조건이라 보낸 내용을 Google이 서비스 개선에 쓰거나 사람이 볼 수 있어요. 저장되는 곳(이 브라우저)과 보내지는 곳은 달라요.
        </p>
        <p className="font-semibold text-on-surface">회사 기밀이나 개인정보는 넣지 마세요.</p>
      </div>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button onClick={onSkip}>바로 시작</Button>
        <Button variant="primary" icon="explore" onClick={onTour}>
          안내 따라 해 보기
        </Button>
      </div>
    </Dialog>
  )
}
