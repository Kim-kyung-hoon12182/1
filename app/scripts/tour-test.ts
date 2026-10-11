import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { TOUR_STEPS } from '../src/lib/tour.ts'

const read = (dir: string): string =>
  readdirSync(dir)
    .map((name) => {
      const path = join(dir, name)
      return statSync(path).isDirectory() ? read(path) : path.endsWith('.tsx') ? readFileSync(path, 'utf8') : ''
    })
    .join('\n')

const source = read(new URL('../src', import.meta.url).pathname)
const names = TOUR_STEPS.map((step) => step.target.match(/data-tour="([^"]+)"/)?.[1])

const CASES: { name: string; actual: unknown; expected: unknown }[] = [
  { name: '안내는 6단계', actual: TOUR_STEPS.length, expected: 6 },
  { name: '모든 단계에 요소 이름이 있다', actual: names.every(Boolean), expected: true },
  { name: '요소 이름이 겹치지 않는다', actual: new Set(names).size, expected: names.length },
  ...names.map((name) => ({ name: `화면에 data-tour="${name}"이 있다`, actual: source.includes(`data-tour="${name}"`), expected: true })),
  { name: '단계 화면은 tasks 다음 run', actual: TOUR_STEPS.map((step) => step.screen), expected: ['tasks', 'run', 'run', 'run', 'run', 'run'] },
  { name: '문구에 정확성을 보장하는 말이 없다', actual: TOUR_STEPS.some((step) => /정확해요|검증 완료|검토 완료|확인함|검토 기준/.test(step.title + step.body)), expected: false },
]

let failed = 0
for (const { name, actual, expected } of CASES) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected)
  if (!pass) failed += 1
  console.log(`${pass ? '통과' : '실패'} ${name}${pass ? '' : `: 기대 ${JSON.stringify(expected)}, 실제 ${JSON.stringify(actual)}`}`)
}
console.log(failed === 0 ? `\n${CASES.length}개 모두 통과` : `\n${failed}개 실패`)
process.exit(failed === 0 ? 0 : 1)
