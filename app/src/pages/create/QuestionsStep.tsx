import Button from '@/components/Button'
import Card from '@/components/Card'
import { Field, TextArea, TextInput } from '@/components/Field'
import Icon from '@/components/Icon'
import Notice from '@/components/Notice'
import { SAMPLES, SAMPLE_KEYS } from '@/data/sampleTasks'
import type { TaskDraft } from '@/hooks/useTaskDraft'
import { cn } from '@/lib/cn'
import { ANSWER_MAX, EXAMPLE_MAX } from '@/lib/limits'
import { QuestionsAside } from './Asides'
import { QUESTIONS } from './copy'

type QuestionsStepProps = {
  draft: TaskDraft
  onCancel: () => void
}

// 1단계: 질문 4개에 답한다
export default function QuestionsStep({ draft, onCancel }: QuestionsStepProps) {
  const { answers, sampleKey, loading } = draft

  return (
    <div className="grid items-start gap-6 lg:grid-cols-12">
      <Card as="section" padding="lg" className="relative flex flex-col gap-6 overflow-hidden lg:col-span-8">
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-surface-low p-3">
          <span className="flex items-center gap-1 text-label-sm text-on-surface-variant">
            <Icon name="bolt" className="text-[14px]" />
            예시로 시작:
          </span>
          {SAMPLE_KEYS.map((key) => (
            <Button
              key={key}
              size="sm"
              aria-pressed={sampleKey === key}
              className={cn(
                sampleKey === key ? 'bg-primary text-on-primary' : 'bg-surface-lowest hover:bg-primary hover:text-on-primary',
              )}
              onClick={() => draft.startFromSample(key)}
            >
              {SAMPLES[key].label}
            </Button>
          ))}
        </div>

        <Notice tone="info" icon="psychology" className="p-4">
          <h2 className="text-headline-sm text-on-surface">질문 4개에 답해 주세요</h2>
          <p className="mt-1 leading-relaxed">
            답한 내용으로 글을 쓸 때 지킬 규칙 초안을 만들어요. 다음 단계에서 직접 고칠 수 있어요.
          </p>
        </Notice>

        {QUESTIONS.map((question) => (
          <div key={question.field} className="space-y-6">
            <Field
              id={`q-${question.field}`}
              label={question.title}
              required
              hint={question.hint}
              counter={`${answers[question.field].length} / ${ANSWER_MAX}자`}
            >
              <TextInput
                id={`q-${question.field}`}
                className="mt-1"
                value={answers[question.field]}
                maxLength={ANSWER_MAX}
                onChange={(event) => draft.setAnswer(question.field, event.target.value)}
                placeholder={question.placeholder}
              />
            </Field>
            <hr className="border-surface-high" />
          </div>
        ))}

        <Field
          id="q-example"
          label="4. 예전에 잘 나온 결과가 있나요?"
          tag="선택 사항"
          hint="마음에 들었던 결과를 붙여 넣으면 규칙을 만들 때 참고해요. 없으면 비워 두세요."
        >
          <TextArea
            id="q-example"
            className="mt-1"
            rows={4}
            value={answers.example ?? ''}
            maxLength={EXAMPLE_MAX}
            onChange={(event) => draft.setAnswer('example', event.target.value)}
            placeholder="예전에 잘 나온 결과를 붙여 넣어 주세요."
          />
          <div className="text-right text-label-sm text-on-surface-variant">
            {(answers.example ?? '').length} / {EXAMPLE_MAX.toLocaleString()}자
          </div>
        </Field>

        <Notice tone="primary" icon="lightbulb">
          <strong>[규칙 만들기]</strong>를 누르면 답한 내용으로 규칙 5~8개를 만들어요. 다음 단계에서 고치거나 추가할 수 있고, 아직 작업이 저장된 건 아니에요.
        </Notice>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-surface-high pt-3 sm:flex-row">
          <Button size="lg" className="w-full px-6 py-2 sm:w-auto" onClick={onCancel}>
            취소하고 돌아가기
          </Button>
          <Button
            variant="primary"
            size="lg"
            iconEnd
            icon="arrow_forward"
            className="w-full bg-primary-container px-8 shadow-md hover:bg-primary sm:w-auto"
            onClick={draft.makeRules}
            disabled={!draft.canMakeRules || loading}
          >
            {draft.rulesReady ? '규칙 확인하기' : '규칙 만들기'}
          </Button>
        </div>

        {loading && <LoadingOverlay onCancel={draft.cancelLoading} />}
      </Card>

      <QuestionsAside />
    </div>
  )
}

function LoadingOverlay({ onCancel }: { onCancel: () => void }) {
  return (
    <div
      role="status"
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface-lowest/95 p-8 text-center backdrop-blur-[2px]"
    >
      <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface">
        <Icon name="auto_awesome" className="animate-pulse text-[32px] text-primary" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
      <h3 className="mb-1 text-headline-md">규칙을 만들고 있어요</h3>
      <p className="mb-4 max-w-md text-body-md text-on-surface-variant">
        답한 내용으로 규칙 초안을 쓰고 있어요. 보통 몇 초 걸려요.
      </p>
      <Button variant="ghost" size="sm" className="text-primary underline underline-offset-4" onClick={onCancel}>
        취소
      </Button>
    </div>
  )
}
