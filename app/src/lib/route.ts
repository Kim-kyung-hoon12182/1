import type { SampleKey } from '@/types/task'

export type View =
  | { screen: 'tasks' }
  | { screen: 'create'; sampleKey?: SampleKey }
  | { screen: 'run'; taskId: string; prefill: boolean }
  | { screen: 'history' }

const SAMPLE_KEYS: SampleKey[] = ['report', 'til', 'summary', 'minutes']

// 화면을 주소의 # 뒤에 담아 뒤로가기·새로고침·링크가 되게 한다.
// 예: #/ (내 작업), #/create?sample=report, #/run/abc123?prefill=1
export const toHash = (view: View) => {
  if (view.screen === 'create') return view.sampleKey ? `#/create?sample=${view.sampleKey}` : '#/create'
  if (view.screen === 'history') return '#/history'
  if (view.screen === 'run') return `#/run/${encodeURIComponent(view.taskId)}${view.prefill ? '?prefill=1' : ''}`
  return '#/'
}

export const parseHash = (hash: string): View => {
  const [path, query = ''] = hash.replace(/^#/, '').split('?')
  const params = new URLSearchParams(query)
  if (path === '/history') return { screen: 'history' }
  if (path === '/create') {
    const sample = params.get('sample') as SampleKey | null
    return { screen: 'create', sampleKey: sample && SAMPLE_KEYS.includes(sample) ? sample : undefined }
  }
  const run = path.match(/^\/run\/([^/]+)$/)
  if (run) {
    try {
      return { screen: 'run', taskId: decodeURIComponent(run[1]), prefill: params.get('prefill') === '1' }
    } catch {
      return { screen: 'tasks' }
    }
  }
  return { screen: 'tasks' }
}
