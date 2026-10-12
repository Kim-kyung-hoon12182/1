import { grow, overlayClipPath, overlaps, placeBubble, type Box } from '../src/lib/tourLayout.ts'

const view = { width: 1280, height: 800 }
const size = { width: 320, height: 230 }
const box = (left: number, top: number, width: number, height: number): Box => ({ left, top, width, height })

const below = placeBubble({ target: box(100, 100, 200, 40), contexts: [], view, size })
const aboveFull = placeBubble({ target: box(100, 700, 200, 40), contexts: [], view, size })
// 실행하기 버튼(왼쪽 칸 아래)과 그 위의 자료 칸: 아래·위가 막히면 오른쪽
const withMaterial = placeBubble({ target: box(40, 700, 480, 50), contexts: [box(40, 260, 480, 400)], view, size })
const nowhere = placeBubble({ target: box(0, 0, 1280, 800), contexts: [], view, size })
// 폰 폭: 자료 칸 바로 아래의 실행하기 버튼. 자리가 없으면 밝은 곳은 양보하더라도 누를 곳은 가리면 안 된다
const phone = { width: 390, height: 800 }
const phoneTarget = grow(box(16, 600, 358, 52), 8)
const phoneBubble = placeBubble({ target: phoneTarget, contexts: [grow(box(16, 200, 358, 380), 6)], view: phone, size })
const phoneBox = { left: phoneBubble.left, top: phoneBubble.top ?? phone.height - (phoneBubble.bottom ?? 0) - size.height, ...size }
// 밝은 곳 전부를 피할 자리가 없으면 누를 곳만 피하는 자리(여기서는 아래)를 쓴다
const yielding = placeBubble({ target: box(100, 100, 200, 40), contexts: [box(0, 150, 1280, 640)], view, size })

const CASES: { name: string; actual: unknown; expected: unknown }[] = [
  { name: '겹침: 겹치는 두 상자', actual: overlaps(box(0, 0, 100, 100), box(50, 50, 100, 100)), expected: true },
  { name: '겹침: 맞닿기만 하면 아니다', actual: overlaps(box(0, 0, 100, 100), box(100, 0, 100, 100)), expected: false },
  { name: '키우기: 사방으로 pad만큼', actual: grow(box(10, 10, 20, 20), 5), expected: box(5, 5, 30, 30) },
  { name: '말풍선: 아래가 비면 아래', actual: below, expected: { left: 100, top: 152 } },
  { name: '말풍선: 아래가 막히면 위', actual: aboveFull, expected: { left: 100, bottom: 112 } },
  { name: '말풍선: 위가 자료 칸에 겹치면 오른쪽(밝은 곳을 가리지 않음)', actual: withMaterial.left !== undefined && withMaterial.left >= 520 && withMaterial.top !== undefined, expected: true },
  { name: '말풍선: 어디에도 못 놓으면(누를 곳이 화면을 다 차지) 위쪽 가운데', actual: nowhere, expected: { left: 480, top: 16 } },
  { name: '말풍선: 폰 폭에서도 누를 곳을 가리지 않는다', actual: overlaps(phoneBox, phoneTarget), expected: false },
  { name: '말풍선: 밝은 곳을 피할 수 없으면 그 곳은 양보하고 누를 곳만 피한다', actual: yielding, expected: { left: 100, top: 152 } },
  { name: '구멍 모양: 전체 사각형으로 시작한다', actual: overlayClipPath([], view).startsWith('path(evenodd, "M0 0H1280V800H0Z'), expected: true },
  { name: '구멍 모양: 구멍 수만큼 도형이 더해진다', actual: (overlayClipPath([box(10, 10, 100, 40), box(200, 200, 50, 50)], view).match(/Z/g) ?? []).length, expected: 3 },
  { name: '구멍 모양: 화면 밖에 있는 구멍은 뺀다', actual: (overlayClipPath([box(2000, 2000, 50, 50)], view).match(/Z/g) ?? []).length, expected: 1 },
  { name: '구멍 모양: 화면 밖으로 나간 구멍은 화면 안으로 자른다', actual: overlayClipPath([box(-20, 10, 100, 40)], view).includes('M10 10'), expected: true },
]

let failed = 0
for (const { name, actual, expected } of CASES) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected)
  if (!pass) failed += 1
  console.log(`${pass ? '통과' : '실패'} ${name}${pass ? '' : `: 기대 ${JSON.stringify(expected)}, 실제 ${JSON.stringify(actual)}`}`)
}
console.log(failed === 0 ? `\n${CASES.length}개 모두 통과` : `\n${failed}개 실패`)
process.exit(failed === 0 ? 0 : 1)
