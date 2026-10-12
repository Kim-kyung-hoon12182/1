import { useState } from 'react'
import Button from '@/components/Button'
import Notice from '@/components/Notice'
import type { Run } from '@/types/task'

type EditedAfterAskProps = {
  run: Run
  onAnswer: (answer: 'yes' | 'no') => void
}

// 앱은 복사한 뒤 메일·문서에서 고친 것을 알 수 없다. 다음 실행을 시작할 때 한 번 물어 기록을 바로잡는다.
// 답하지 않아도 실행은 막지 않는다.
export default function EditedAfterAsk({ run, onAnswer }: EditedAfterAskProps) {
  const [hidden, setHidden] = useState(false)
  if (hidden) return null

  return (
    <Notice tone="info" icon="help" role="status" className="flex-wrap items-center rounded-xl">
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="font-semibold">지난번({run.number}회차) 결과를 복사한 뒤, 다른 곳에서 더 고치셨나요?</p>
        <p className="text-body-sm text-on-surface-variant">
          앱은 복사한 뒤에 고친 것은 알 수 없어요. 답은 "안 고친 기록"을 세는 데 쓰고, 답하지 않아도 실행할 수 있어요.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Button size="sm" onClick={() => onAnswer('no')}>
          고치지 않았어요
        </Button>
        <Button size="sm" onClick={() => onAnswer('yes')}>
          더 고쳤어요
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setHidden(true)}>
          나중에
        </Button>
      </div>
    </Notice>
  )
}
