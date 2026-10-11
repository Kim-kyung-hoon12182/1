type Step = { title: string; body: string }

// 번호가 붙은 세로 안내 목록
export default function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="space-y-2">
      {steps.map((step, index) => (
        <li key={step.title} className="flex items-start gap-2 rounded-lg bg-surface-low p-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-label-sm font-semibold text-on-primary">
            {index + 1}
          </span>
          <div className="flex flex-col">
            <span className="text-label-md">{step.title}</span>
            <span className="text-body-sm text-on-surface-variant">{step.body}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}
