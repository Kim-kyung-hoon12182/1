import { checkLine } from '../src/lib/evidence.ts'
import { MATERIALS } from './overlap-fixture.ts'

const THRESHOLDS = [0.2, 0.3, 0.4]
const verbose = process.argv.includes('--verbose')

for (const threshold of THRESHOLDS) {
  let wrongGotSource = 0
  let okDowngraded = 0
  let numberCaught = 0
  let numberTotal = 0
  let wrongTotal = 0
  let okTotal = 0
  const misses: string[] = []

  for (const material of MATERIALS) {
    for (const testCase of material.cases) {
      const result = checkLine(testCase.line, testCase.sourceIds, material.sentences, threshold)
      const isWrong = testCase.kind.startsWith('wrong')
      if (isWrong) wrongTotal++
      else okTotal++
      if (testCase.kind === 'wrong_number') {
        numberTotal++
        if (result.status === 'not_in_input') numberCaught++
      }
      if (isWrong && result.status === 'has_source') wrongGotSource++
      if (!isWrong && result.status !== 'has_source') okDowngraded++
      if (result.status !== testCase.expected) {
        misses.push(
          `  [${material.name}] ${testCase.kind} 기대 ${testCase.expected} → 실제 ${result.status} (겹침 ${result.overlap.toFixed(2)}${result.missingTokens.length ? `, 없음: ${result.missingTokens.join(', ')}` : ''}) ${testCase.line}`,
        )
      }
    }
  }

  console.log(
    `기준값 ${threshold}: 틀린 줄 중 근거① ${wrongGotSource}/${wrongTotal}, 정상 줄 중 내려감 ${okDowngraded}/${okTotal}, 재료에 없는 숫자 탐지 ${numberCaught}/${numberTotal}`,
  )
  if (verbose) console.log(misses.join('\n'))
}
