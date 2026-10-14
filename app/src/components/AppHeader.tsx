import Icon from '@/components/Icon'


export type Screen = 'run' | 'tasks' | 'history'

type NavItem = {
  id: Screen
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'run', label: '작업 실행' },
  { id: 'tasks', label: '내 작업' },
  { id: 'history', label: '실행 이력' },
]

type AppHeaderProps = {
  current: Screen
  runAvailable: boolean
  onNavigate: (screen: Screen) => void
  onStartTour: () => void
}

// 화면이 없는 메뉴는 눌리지 않게 둔다. 작업 실행은 실행 중인 작업이 있을 때만 쓸 수 있다.
const disabledReason = (id: Screen, runAvailable: boolean) => {
  if (id === 'run' && !runAvailable) return '내 작업에서 하나를 골라 실행하면 열려요'
  return null
}

export default function AppHeader({ current, runAvailable, onNavigate, onStartTour }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface-lowest">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        <div className="flex h-full min-w-0 items-center gap-2 sm:gap-8">
          {/* 로고를 누르면 첫 화면(내 작업)으로 간다. 복사하지 않은 결과가 있으면 나가기 확인이 먼저 뜬다 */}
          <button type="button" aria-label="또시켰네 첫 화면(내 작업)으로" onClick={() => onNavigate('tasks')} className="shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-primary">
            <img src="/logo-header.png" alt="" width="120" height="48" className="h-9 w-auto sm:h-12" />
          </button>
          <nav aria-label="주 메뉴" className="flex h-full items-center gap-3 sm:gap-4">
            {NAV_ITEMS.map((item) => {
              const isCurrent = item.id === current
              const reason = disabledReason(item.id, runAvailable)
              const base = 'flex h-full shrink-0 items-center whitespace-nowrap border-b-2 px-0.5 text-body-sm transition-colors sm:px-1 sm:text-body-md'
              if (reason) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-disabled="true"
                    title={reason}
                    className={`${base} cursor-not-allowed border-transparent text-outline`}
                  >
                    {item.label}
                  </button>
                )
              }
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isCurrent ? 'page' : undefined}
                  data-tour={item.id === 'history' ? 'nav-history' : undefined}
                  onClick={() => onNavigate(item.id)}
                  className={`${base} ${
                    isCurrent
                      ? 'border-primary font-semibold text-primary'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>
        <button
          type="button"
          onClick={onStartTour}
          aria-label="사용 안내"
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-body-sm font-semibold text-primary hover:bg-surface"
        >
          <Icon name="explore" className="text-[18px]" />
          <span className="hidden sm:inline">사용 안내</span>
        </button>
      </div>
    </header>
  )
}
