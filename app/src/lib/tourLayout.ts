export type Box = { top: number; left: number; width: number; height: number }
export type Viewport = { width: number; height: number }

const right = (box: Box) => box.left + box.width
const bottom = (box: Box) => box.top + box.height

export const grow = (box: Box, pad: number): Box => ({
  left: box.left - pad,
  top: box.top - pad,
  width: box.width + pad * 2,
  height: box.height + pad * 2,
})

export const overlaps = (a: Box, b: Box) => a.left < right(b) && right(a) > b.left && a.top < bottom(b) && bottom(a) > b.top

export const contains = (outer: Box, inner: Box) =>
  outer.left <= inner.left && outer.top <= inner.top && right(outer) >= right(inner) && bottom(outer) >= bottom(inner)

// outer에서 hole을 뺀 나머지를 위·아래·왼쪽·오른쪽 띠로 나눈다(hole은 outer 안에 있어야 한다)
export const splitAround = (outer: Box, hole: Box): Box[] => {
  const strips: Box[] = [
    { left: outer.left, top: outer.top, width: outer.width, height: hole.top - outer.top },
    { left: outer.left, top: bottom(hole), width: outer.width, height: bottom(outer) - bottom(hole) },
    { left: outer.left, top: hole.top, width: hole.left - outer.left, height: hole.height },
    { left: right(hole), top: hole.top, width: right(outer) - right(hole), height: hole.height },
  ]
  return strips.filter((strip) => strip.width > 0 && strip.height > 0)
}

// 화면 안으로 자른다
const clamp = (box: Box, view: Viewport): Box => {
  const left = Math.max(box.left, 0)
  const top = Math.max(box.top, 0)
  return { left, top, width: Math.max(Math.min(right(box), view.width) - left, 0), height: Math.max(Math.min(bottom(box), view.height) - top, 0) }
}

const roundedRect = (box: Box, radius: number) => {
  const r = Math.min(radius, box.width / 2, box.height / 2)
  const { left: x, top: y, width: w, height: h } = box
  return `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}Z`
}

// 화면 전체에서 밝게 보일 곳을 뚫은 모양(clip-path). 덮개는 이 모양 밖에만 있어서 뚫린 곳은 그대로 눌린다.
export const overlayClipPath = (holes: Box[], view: Viewport, radius = 10) => {
  const shapes = holes.map((hole) => clamp(hole, view)).filter((hole) => hole.width > 0 && hole.height > 0)
  return `path(evenodd, "M0 0H${view.width}V${view.height}H0Z ${shapes.map((shape) => roundedRect(shape, radius)).join(' ')}")`
}

type PlaceInput = { target: Box; contexts: Box[]; view: Viewport; size: { width: number; height: number }; gap?: number }
export type BubblePosition = { left: number; top?: number; bottom?: number }

// 말풍선을 놓을 자리. 아래, 위, 오른쪽, 왼쪽 순서로 찾는다. 먼저 밝게 보이는 곳 전부를 피하는 자리를, 없으면 누를 곳만 피하는 자리를 찾고,
// 그래도 없으면 화면 아래(누를 곳이 거기 있으면 위) 가운데에 둔다. 누를 곳은 어떤 경우에도 가리지 않는다.
export const placeBubble = ({ target, contexts, view, size, gap = 12 }: PlaceInput): BubblePosition => {
  const margin = 8
  const clampX = (x: number) => Math.min(Math.max(x, margin), view.width - size.width - margin)
  const clampY = (y: number) => Math.min(Math.max(y, margin), view.height - size.height - margin)
  const candidates: { box: Box; position: BubblePosition }[] = [
    { box: { left: clampX(target.left), top: bottom(target) + gap, ...size }, position: { left: clampX(target.left), top: bottom(target) + gap } },
    { box: { left: clampX(target.left), top: target.top - gap - size.height, ...size }, position: { left: clampX(target.left), bottom: view.height - target.top + gap } },
    { box: { left: right(target) + gap, top: clampY(target.top), ...size }, position: { left: right(target) + gap, top: clampY(target.top) } },
    { box: { left: target.left - gap - size.width, top: clampY(target.top), ...size }, position: { left: target.left - gap - size.width, top: clampY(target.top) } },
  ]
  const fits = (box: Box, avoid: Box[]) =>
    box.left >= margin && box.top >= margin && right(box) <= view.width - margin && bottom(box) <= view.height - margin && !avoid.some((area) => overlaps(box, area))
  const strict = [target, ...contexts].map((box) => grow(box, 4))
  const loose = [grow(target, 4)]
  for (const avoid of [strict, loose]) {
    const found = candidates.find(({ box }) => fits(box, avoid))
    if (found) return found.position
  }
  const left = Math.max((view.width - size.width) / 2, margin)
  const bottomBox: Box = { left, top: view.height - 16 - size.height, ...size }
  return overlaps(bottomBox, loose[0]) ? { left, top: 16 } : { left, bottom: 16 }
}
