type FreeformToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  /** 같은 화면에 여러 개 있을 때 구분하는 이름(화면 읽기 프로그램용) */
  label: string
}

// 규칙 하나에 붙이는 "자료 밖 허용" 표시. 켜면 그 규칙을 지킨 줄은 자료에 없는 의견·느낀 점을 써도 되고, 앱도 "근거 확인 필요"로 걸지 않는다.
export default function FreeformToggle({ checked, onChange, label }: FreeformToggleProps) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-1.5 text-label-md text-on-surface-variant" title="자료에 없는 의견이나 느낀 점을 이 규칙의 줄에서는 써도 돼요. 숫자와 이름은 그래도 자료와 맞춰 봐요.">
      <input type="checkbox" className="h-4 w-4 accent-primary" checked={checked} aria-label={`${label}: 자료에 없는 의견도 허용`} onChange={(event) => onChange(event.target.checked)} />
      자료에 없는 의견도 허용
    </label>
  )
}
