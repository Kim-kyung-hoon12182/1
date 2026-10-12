import type { ReactNode } from 'react'
import Icon from '@/components/Icon'
import Popover from '@/components/Popover'
import { SHOW_SOURCE_EVENT, type RunSession } from '@/hooks/useRunSession'
import { coverageOf } from '@/lib/coverage'
import type { Task } from '@/types/task'
import { LEGEND, SCOPE_NOTE } from './copy'
import CoverageNote from './CoverageNote'
import RulesPanel from './RulesPanel'

type StatusBarProps = {
  task: Task
  session: RunSession
  onGoToTasks: () => void
}

type ChipProps = { open: boolean; toggle: () => void; id: string; icon: string; children: ReactNode }

function Chip({ open, toggle, id, icon, children }: ChipProps) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={open ? id : undefined}
      onClick={toggle}
      className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-lowest px-2.5 py-1 text-label-md hover:bg-surface"
    >
      <Icon name={icon} className="text-[15px] text-secondary" />
      {children}
      <Icon name="info" className="text-[14px] text-outline" />
    </button>
  )
}

// 결과 위 한 줄 상태 바: 눌러서 여는 설명 셋(규칙, 참고 범위, 표시 읽는 법). 확인할 곳 수는 바로 위 요약 카드에 있어서 되풀이하지 않는다.
// 안내문을 목록 위에 쌓아 두는 대신 필요할 때만 열게 해서 첫 결과 줄이 위로 올라오게 한다.
export default function StatusBar({ task, session, onGoToTasks }: StatusBarProps) {
  const flagged = session.flagged.length
  const sent = task.rules.filter((rule) => rule.text.trim())
  const taught = sent.filter((rule) => rule.source === 'edit')
  const coverage = coverageOf(session.lines, session.sentences)
  const finished = session.finished !== null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover
        label="이번 실행의 규칙"
        trigger={(props) => (
          <Chip {...props} icon="bookmark">
            규칙 {sent.length}
            {taught.length > 0 ? ` · 내가 고친 것 ${taught.length}` : ''}
          </Chip>
        )}
      >
        <RulesPanel task={task} finished={finished} onGoToTasks={onGoToTasks} />
      </Popover>

      <Popover
        label="참고 범위"
        trigger={(props) => (
          <Chip {...props} icon="fact_check">
            {coverage.summary ? `자료 ${coverage.total}문장 → ${coverage.resultLines}줄 요약` : `참고 범위 ${coverage.referenced}/${coverage.total}`}
          </Chip>
        )}
      >
        <CoverageNote session={session} />
      </Popover>

      <Popover
        label="표시 읽는 법"
        trigger={(props) => (
          <Chip {...props} icon="help">
            표시 읽는 법
          </Chip>
        )}
      >
        <ul className="space-y-1.5">
          {LEGEND.map((item) => (
            <li key={item.status}>
              <strong className="font-semibold">{item.name}:</strong> <span className="text-on-surface-variant">{item.body}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 border-t border-outline-variant pt-2 text-on-surface-variant">{SCOPE_NOTE}</p>
      </Popover>

      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event(SHOW_SOURCE_EVENT))}
        className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-lowest px-2.5 py-1 text-label-md hover:bg-surface lg:hidden"
      >
        <Icon name="description" className="text-[15px] text-secondary" />
        자료 보기
      </button>

      <span className="text-label-sm text-on-surface-variant sm:ml-auto">
        {flagged === 0 ? '확인할 곳이 없어도 안전하다는 뜻은 아니에요.' : '초안이에요. 정확하다는 뜻이 아니에요.'}
      </span>
    </div>
  )
}
