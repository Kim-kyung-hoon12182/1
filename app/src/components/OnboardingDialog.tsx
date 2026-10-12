import Button from '@/components/Button'
import Dialog from '@/components/Dialog'

type OnboardingDialogProps = {
  onTour: () => void
  onSkip: () => void
}

// S0 첫 방문 안내: 무엇을 하는 앱인지, 저장·전송 범위, 주의를 알리고 안내 모드로 이어 준다
export default function OnboardingDialog({ onTour, onSkip }: OnboardingDialogProps) {
  return (
    <Dialog title="AI가 쓴 글, 확인할 곳을 표시해 줘요" onClose={onSkip}>
      <img
        src="/logo-full.png"
        alt="또시켰네 - 시키는 건 한 번, 반복은 그만."
        width="480"
        height="192"
        className="mx-auto mb-4 h-32 w-auto"
      />
      <p className="mb-4 text-center text-body-md font-semibold text-on-surface">
        고쳤는지를 작업마다 기록하고, 고친 내용은 확인한 뒤 규칙으로 남겨요. 안 고친 기록이 쌓이면 맡겨볼 만한 때를 알려 줘요.
      </p>
      <div className="space-y-3 text-body-sm leading-relaxed text-on-surface-variant">
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
