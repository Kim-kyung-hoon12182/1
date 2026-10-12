// 회차별 고친 줄 수를 막대로 보여 준다. 색만이 아니라 숫자도 함께 적는다.
export default function TrendBars({ counts }: { counts: number[] }) {
  const max = Math.max(...counts, 1)
  return (
    <div className="flex items-end gap-1.5" role="img" aria-label={`회차별 고친 줄 수: ${counts.join(', ')}`}>
      {counts.map((count, index) => (
        <div key={index} className="flex w-7 flex-col items-center gap-0.5">
          <span className="text-label-sm text-on-surface-variant">{count}</span>
          <div
            className={count === 0 ? 'h-1 w-full rounded-sm bg-neutral-line' : 'w-full rounded-sm bg-flag-bar'}
            style={count === 0 ? undefined : { height: `${Math.max((count / max) * 40, 6)}px` }}
          />
        </div>
      ))}
    </div>
  )
}
