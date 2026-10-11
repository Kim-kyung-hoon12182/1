import Icon from '@/components/Icon'

export default function AppFooter() {
  return (
    <footer className="border-t border-outline-variant bg-surface-lowest py-3">
      <p className="mx-auto flex max-w-7xl items-start gap-1.5 px-4 text-body-sm text-on-surface-variant sm:px-8">
        <Icon name="shield_with_heart" className="mt-0.5 shrink-0 text-[16px] text-outline" />
        <span>
          회사 기밀이나 개인정보는 넣지 마세요. 작업과 규칙은 이 브라우저에만 저장되고, 규칙을 만들 때 입력한 답변과 실행할 때 넣은 재료는 Google Gemini API로 전송될 수 있어요.
        </span>
      </p>
    </footer>
  )
}
