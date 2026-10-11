import Card from '@/components/Card'
import DataNotice from '@/components/DataNotice'
import Icon from '@/components/Icon'
import StepList from '@/components/StepList'
import { AFTER_REGISTER_STEPS, QUESTIONS_TIPS, RULE_TIPS } from './copy'

function IconTile({ icon }: { icon: string }) {
  return (
    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
      <Icon name={icon} className="text-[16px]" />
    </div>
  )
}

// 카드 제목 앞에 붙는 아이콘
function TitleIcon({ icon }: { icon: string }) {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-primary">
      <Icon name={icon} className="text-[18px]" />
    </div>
  )
}

// 1단계(질문) 오른쪽: 쓰는 요령, 등록 뒤 흐름, 저장·전송 안내
export function QuestionsAside() {
  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:col-span-4">
      <Card padding="none" className="space-y-3 p-5">
        <div className="flex items-center gap-1 text-primary">
          <Icon name="tips_and_updates" className="text-[22px]" />
          <h3 className="text-headline-sm text-on-surface">처음이라면 이렇게 써 보세요</h3>
        </div>
        {QUESTIONS_TIPS.map((tip, index) => (
          <div key={tip.title}>
            {index > 0 && <div className="mb-3 h-px w-full bg-surface-high" />}
            <div className="flex items-start gap-2">
              <IconTile icon={tip.icon} />
              <div className="space-y-0.5">
                <h4 className="text-label-md">{tip.title}</h4>
                <p className="text-body-sm leading-relaxed text-on-surface-variant">{tip.body}</p>
              </div>
            </div>
          </div>
        ))}
      </Card>

      <Card padding="none" className="space-y-3 p-5">
        <div className="flex items-center gap-1">
          <Icon name="timeline" className="text-[20px] text-primary" />
          <h3 className="text-headline-sm">등록한 뒤에는 이렇게 써요</h3>
        </div>
        <StepList steps={AFTER_REGISTER_STEPS} />
        <p className="text-body-sm leading-relaxed text-on-surface-variant">
          한 번 등록하면 <strong>[내 작업]</strong>에서 <strong>[실행하기]</strong>로 같은 작업을 계속할 수 있어요.
        </p>
      </Card>
      <DataNotice />
    </aside>
  )
}

// 2단계(규칙) 오른쪽: 규칙 쓰는 방법, 저장 뒤 쓰임, 저장·전송 안내
export function RulesAside({ ruleCount }: { ruleCount: number }) {
  const usage = [
    { title: '새 재료 넣기', body: '이번 주 메모나 자료를 붙여 넣어요' },
    { title: `규칙 ${ruleCount}개를 지켜 글 쓰기`, body: 'AI가 규칙에 맞춰 줄마다 근거 위치를 짚어요' },
    { title: '확인할 곳 보고 고치기', body: '재료에서 못 찾은 값이나 근거가 약한 줄을 표시해요' },
  ]

  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:col-span-4">
      <Card padding="none" className="space-y-3 p-5">
        <div className="flex items-center gap-2 border-b border-surface-low pb-2">
          <TitleIcon icon="menu_book" />
          <h3 className="text-headline-sm">규칙 쓰는 방법</h3>
        </div>
        {RULE_TIPS.map((tip, index) => (
          <div key={tip.title} className="flex items-start gap-2">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface text-label-sm font-bold text-primary">
              {index + 1}
            </div>
            <div className="flex flex-col">
              <h4 className="text-label-md">{tip.title}</h4>
              <p className="text-body-sm text-on-surface-variant">{tip.body}</p>
            </div>
          </div>
        ))}
      </Card>

      <Card padding="none" className="space-y-3 p-5">
        <div className="flex items-center gap-2">
          <TitleIcon icon="schema" />
          <h3 className="text-headline-sm">이 규칙은 어떻게 쓰이나요?</h3>
        </div>
        <p className="text-body-sm text-on-surface-variant">저장한 뒤 실행할 때마다 이렇게 쓰여요.</p>
        <StepList steps={usage} />
        <p className="text-body-sm text-on-surface-variant">
          표시는 앱이 검사한 범위만 알려줘요. 내용이 맞는지는 직접 확인해 주세요.
        </p>
      </Card>
      <DataNotice />
    </aside>
  )
}
