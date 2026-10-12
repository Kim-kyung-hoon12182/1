import Badge from '@/components/Badge'
import Card from '@/components/Card'
import Icon from '@/components/Icon'
import { trendOf } from '@/lib/history'
import type { Task } from '@/types/task'

const SHOWN_TAUGHT = 3
const TREND_RUNS = 5
const BAR_MAX_PX = 40

// 결과 위쪽: 이번 실행에 AI에게 보낸 규칙과, 그중 사용자가 고쳐서 생긴 규칙, 지난 회차별 고친 곳.
// "AI가 보낸 규칙"은 앱이 요청에 실제로 넣은 규칙이다. AI가 지켰다는 뜻이 아니다.
export default function RuleBand({ task, finished }: { task: Task; finished: boolean }) {
  const sent = task.rules.filter((rule) => rule.text.trim())
  const taught = sent.filter((rule) => rule.source === 'edit')
  const recent = task.runs.slice(-TREND_RUNS)
  const counts = trendOf(task.runs, TREND_RUNS)
  const peak = Math.max(...counts, 1)

  return (
    <Card as="section" padding="sm" className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="flex items-center gap-1.5 text-label-md text-on-surface-variant">
          <Icon name="bookmark" className="text-[16px] text-primary" />
          {finished ? `이 작업의 규칙 ${sent.length}개 · 다음 실행부터 AI에게 보내요` : `이번 실행에 AI에게 보낸 규칙 ${sent.length}개`}
        </p>
        {taught.length > 0 ? (
          <>
            <p className="text-body-md">
              그중 <strong className="font-semibold">내가 고쳐서 생긴 규칙은 {taught.length}개</strong>예요.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {taught.slice(0, SHOWN_TAUGHT).map((rule) => (
                <Badge key={rule.id} tone="primary" size="md">
                  {rule.text}
                  {rule.fromRun ? ` · ${rule.fromRun}회차` : ''}
                </Badge>
              ))}
              {taught.length > SHOWN_TAUGHT && <Badge size="md">외 {taught.length - SHOWN_TAUGHT}개</Badge>}
            </div>
          </>
        ) : (
          <p className="text-body-sm text-on-surface-variant">
            아직 고쳐서 생긴 규칙이 없어요. 글을 고치고 복사하면 규칙 후보가 나오고, 추가한 규칙은 여기에 쌓여요.
          </p>
        )}
      </div>

      {recent.length >= 2 && (
        <div className="shrink-0" aria-label="지난 회차별 고친 곳">
          <p className="mb-1.5 text-label-md text-on-surface-variant">지난 회차별 고친 곳</p>
          <div className="flex items-end gap-3">
            {recent.map((run, index) => (
              <div key={run.id} className="flex flex-col items-center gap-1">
                <span
                  aria-hidden
                  className="w-5 rounded-t bg-primary"
                  style={{ height: `${Math.max(Math.round((counts[index] / peak) * BAR_MAX_PX), 3)}px` }}
                />
                <span className="text-label-sm text-on-surface-variant">
                  {run.number}회 {counts[index]}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-1.5 text-label-sm text-outline">자료가 달라서 단순 비교는 어려워요.</p>
        </div>
      )}
    </Card>
  )
}
