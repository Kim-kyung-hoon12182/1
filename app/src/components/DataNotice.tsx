import Card from '@/components/Card'
import Icon from '@/components/Icon'

// 저장 위치와 전송 위치를 나눠 알린다 (정의서 2절, S0-3·S0-4)
export default function DataNotice() {
  return (
    <Card elevation="sm" className="space-y-1.5 bg-surface">
      <div className="flex items-center gap-1">
        <Icon name="info" className="text-[18px] text-outline" />
        <span className="text-headline-sm">저장과 전송 안내</span>
      </div>
      <p className="text-body-sm leading-relaxed text-on-surface-variant">
        작업과 규칙은 이 브라우저에만 저장돼요. 규칙을 만들 때 쓴 답변과, 실행할 때 넣은 자료·규칙, 규칙 후보를 만들 때의 고친 내용은 Google Gemini로 보내져요. 무료 이용 조건이라 보낸 내용을 Google이 서비스 개선에 쓰거나 사람이 볼 수 있어요.
      </p>
      <p className="text-body-sm font-semibold leading-relaxed">회사 기밀이나 개인정보는 넣지 마세요.</p>
    </Card>
  )
}
