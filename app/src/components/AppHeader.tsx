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
  if (id === 'history') return '준비 중이에요'
  if (id === 'run' && !runAvailable) return '내 작업에서 하나를 골라 실행하면 열려요'
  return null
}

export default function AppHeader({ current, runAvailable, onNavigate, onStartTour }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface-lowest">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        <div className="flex h-full items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-headline-sm text-on-primary">
              믿
            </div>
            <span className="whitespace-nowrap text-headline-sm tracking-tight">믿고맡김</span>
          </div>
          <nav aria-label="주 메뉴" className="flex h-full items-center gap-4">
            {NAV_ITEMS.map((item) => {
              const isCurrent = item.id === current
              const reason = disabledReason(item.id, runAvailable)
              const base = 'flex h-full items-center whitespace-nowrap border-b-2 px-1 transition-colors'
              if (reason) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-disabled="true"
                    title={reason}
                    className={`${base} cursor-not-allowed border-transparent text-body-md text-outline`}
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
                  onClick={() => onNavigate(item.id)}
                  className={`${base} ${
                    isCurrent
                      ? 'border-primary text-headline-sm text-primary'
                      : 'border-transparent text-body-md text-on-surface-variant hover:text-on-surface'
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
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-body-sm font-semibold text-primary hover:bg-surface"
        >
          <Icon name="explore" className="text-[18px]" />
          사용 안내
        </button>
      </div>
    </header>
  )
}
