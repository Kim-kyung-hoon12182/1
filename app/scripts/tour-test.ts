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
const nameOf = (selector?: string) => selector?.match(/data-tour="([^"]+)"/)?.[1]
const names = TOUR_STEPS.map((step) => nameOf(step.target))
const advanceNames = TOUR_STEPS.flatMap((step) => (step.advanceOn ? [nameOf(step.advanceOn)] : []))
const editNames = TOUR_STEPS.flatMap((step) => (step.context ?? []).map(nameOf).filter(Boolean))

const CASES: { name: string; actual: unknown; expected: unknown }[] = [
  { name: '안내는 16단계(11·12·13단계는 조건부)', actual: TOUR_STEPS.length, expected: 16 },
  { name: '11·12·13단계만 조건부', actual: TOUR_STEPS.map((step) => Boolean(step.optional)), expected: [false, false, false, false, false, false, false, false, false, false, true, true, true, false, false, false] },
  { name: '모든 단계에 요소 이름이 있다', actual: names.every(Boolean), expected: true },
  { name: '요소 이름이 겹치지 않는다', actual: new Set(names).size, expected: names.length },
  ...[...new Set([...names, ...advanceNames, ...editNames])].map((name) => ({ name: `화면에 data-tour="${name}"이 있다`, actual: source.includes(`data-tour="${name}"`) || source.includes(`data-tour={`) && source.includes(`'${name}'`), expected: true })),
  { name: '단계 화면은 tasks, run, history', actual: TOUR_STEPS.map((step) => step.screen), expected: ['tasks', 'run', 'run', 'run', 'run', 'run', 'run', 'run', 'run', 'run', 'run', 'run', 'run', 'run', 'history', 'history'] },
  { name: '[다음]으로 넘기는 단계는 10·12·16단계', actual: TOUR_STEPS.flatMap((step, i) => (step.manual ? [i + 1] : [])), expected: [10, 12, 16] },
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
