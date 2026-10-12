import { parseHash, toHash, type View } from '../src/lib/route.ts'

const VIEWS: { name: string; view: View; hash: string }[] = [
  { name: '내 작업', view: { screen: 'tasks' }, hash: '#/' },
  { name: '새 작업', view: { screen: 'create' }, hash: '#/create' },
  { name: '예시로 시작', view: { screen: 'create', sampleKey: 'report' }, hash: '#/create?sample=report' },
  { name: '실행', view: { screen: 'run', taskId: 'abc', prefill: false }, hash: '#/run/abc' },
  { name: '예시 자료를 채워 실행', view: { screen: 'run', taskId: 'demo', prefill: true }, hash: '#/run/demo?prefill=1' },
  { name: '실행 이력', view: { screen: 'history' }, hash: '#/history' },
  { name: '작업 하나의 실행 이력', view: { screen: 'history', taskId: 'abc' }, hash: '#/history?task=abc' },
  { name: '특수문자 id', view: { screen: 'run', taskId: 'a/b c', prefill: false }, hash: '#/run/a%2Fb%20c' },
]

const CASES: { name: string; actual: unknown; expected: unknown }[] = [
  ...VIEWS.flatMap(({ name, view, hash }) => [
    { name: `${name}: 화면 → 주소`, actual: toHash(view), expected: hash },
    { name: `${name}: 주소 → 화면`, actual: parseHash(hash), expected: view },
  ]),
  { name: '주소가 비어 있으면 내 작업', actual: parseHash(''), expected: { screen: 'tasks' } },
  { name: '알 수 없는 주소는 내 작업', actual: parseHash('#/nowhere'), expected: { screen: 'tasks' } },
  { name: '없는 예시 이름은 무시', actual: parseHash('#/create?sample=zzz'), expected: { screen: 'create', sampleKey: undefined } },
  { name: '깨진 인코딩은 내 작업', actual: parseHash('#/run/%E0%A4%A'), expected: { screen: 'tasks' } },
  { name: 'id 없는 실행 주소는 내 작업', actual: parseHash('#/run/'), expected: { screen: 'tasks' } },
]

let failed = 0
for (const { name, actual, expected } of CASES) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected)
  if (!pass) failed += 1
  console.log(`${pass ? '통과' : '실패'} ${name}${pass ? '' : `: 기대 ${JSON.stringify(expected)}, 실제 ${JSON.stringify(actual)}`}`)
}
console.log(failed === 0 ? `\n${CASES.length}개 모두 통과` : `\n${failed}개 실패`)
process.exit(failed === 0 ? 0 : 1)
