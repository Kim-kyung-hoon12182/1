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

// 말풍선을 놓을 자리. 밝게 보이는 곳(누를 곳과 같이 보여 주는 곳)을 가리지 않는 자리를 아래, 위, 오른쪽, 왼쪽 순서로 찾고 없으면 화면 아래 가운데에 둔다.
export const placeBubble = ({ target, contexts, view, size, gap = 12 }: PlaceInput): BubblePosition => {
  const margin = 8
  const avoid = [target, ...contexts].map((box) => grow(box, 4))
  const clampX = (x: number) => Math.min(Math.max(x, margin), view.width - size.width - margin)
  const clampY = (y: number) => Math.min(Math.max(y, margin), view.height - size.height - margin)
  const candidates: { box: Box; position: BubblePosition }[] = [
    { box: { left: clampX(target.left), top: bottom(target) + gap, ...size }, position: { left: clampX(target.left), top: bottom(target) + gap } },
    { box: { left: clampX(target.left), top: target.top - gap - size.height, ...size }, position: { left: clampX(target.left), bottom: view.height - target.top + gap } },
    { box: { left: right(target) + gap, top: clampY(target.top), ...size }, position: { left: right(target) + gap, top: clampY(target.top) } },
    { box: { left: target.left - gap - size.width, top: clampY(target.top), ...size }, position: { left: target.left - gap - size.width, top: clampY(target.top) } },
  ]
  for (const { box, position } of candidates) {
    const inside = box.left >= margin && box.top >= margin && right(box) <= view.width - margin && bottom(box) <= view.height - margin
    if (inside && !avoid.some((area) => overlaps(box, area))) return position
  }
  return { left: Math.max((view.width - size.width) / 2, margin), bottom: 16 }
}
