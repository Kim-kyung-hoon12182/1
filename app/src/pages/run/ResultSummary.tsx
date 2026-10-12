import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Icon from '@/components/Icon'
import Notice from '@/components/Notice'
import type { RunSession } from '@/hooks/useRunSession'
import { countByStatus, countDeleted } from '@/lib/run'
import { LEGEND, SCOPE_NOTE } from './copy'

// 결과 위쪽: 줄 상태 집계, 확인할 곳으로 이동, 표시 읽는 법, 검사 범위 안내
export default function ResultSummary({ session }: { session: RunSession }) {
  const { lines, flagged, flaggedPosition } = session

  return (
    <>
      <Card elevation="md" padding="sm" className="space-y-2 lg:sticky lg:top-20 lg:z-20">
        <div className="flex flex-col justify-between gap-2 border-b border-outline-variant pb-2 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <Badge tone="solid" className="font-semibold">
              2·3단계
            </Badge>
            <h2 className="text-headline-sm">결과와 참고한 자료</h2>
          </div>
          {flagged.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="mr-1 text-label-md text-on-surface-variant">
                {flaggedPosition > 0 ? `확인할 곳 ${flaggedPosition} / ${flagged.length}` : `확인할 곳 ${flagged.length}개`}
              </span>
              <Button size="sm" data-tour="goto-first" onClick={() => session.goToFlagged('first')}>
                첫 번째로 이동
              </Button>
              <Button size="sm" onClick={() => session.goToFlagged('next')}>
                다음 확인할 곳
              </Button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge size="md">전체 {lines.length}줄</Badge>
          <Badge size="md" tone="muted" icon="link">
            참고한 곳 {countByStatus(lines, 'has_source')}줄
          </Badge>
          {countByStatus(lines, 'heading') > 0 && (
            <Badge size="md" icon="title">
              제목 {countByStatus(lines, 'heading')}줄
            </Badge>
          )}
          <Badge size="md" tone="flagSoft" icon="warning">
            근거 확인 필요 {countByStatus(lines, 'needs_check')}줄
          </Badge>
          <Badge size="md" tone="flag" icon="error">
            자료에 없음 {countByStatus(lines, 'not_in_input')}줄
          </Badge>
          {countDeleted(lines) > 0 && (
            <Badge size="md" icon="delete">
              삭제 {countDeleted(lines)}줄
            </Badge>
          )}
        </div>
      </Card>

      <details className="group rounded-lg border border-outline-variant bg-surface-low p-2.5 text-label-sm">
        <summary className="flex cursor-pointer list-none items-center gap-1 font-semibold">
          <Icon name="help" className="text-[15px] text-primary" />
          표시는 이렇게 읽어요
          <Icon name="expand_more" className="ml-auto text-[18px] transition-transform group-open:rotate-180" />
        </summary>
        <ul className="mt-2 grid gap-2 text-on-surface-variant sm:grid-cols-2 lg:grid-cols-4">
          {LEGEND.map((item) => (
            <li key={item.status}>
              <strong className="text-on-surface">{item.name}:</strong> {item.body}
            </li>
          ))}
        </ul>
      </details>

      <Notice tone="flag" icon="info" className="items-center rounded-xl">
        <strong className="font-semibold">
          {flagged.length === 0 ? '자동 검사에서 따로 확인할 곳을 찾지 못했어요. ' : '초안이에요. '}
        </strong>
        {SCOPE_NOTE}
      </Notice>
    </>
  )
}
