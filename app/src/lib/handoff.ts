import type { Task } from '@/types/task'

// 받침이 있으면 "을", 없으면 "를". 한글로 끝나지 않으면 둘 다 보여 준다.
export const withObjectParticle = (word: string) => {
  const code = word.trim().charCodeAt(word.trim().length - 1)
  if (code < 0xac00 || code > 0xd7a3) return `${word}을(를)`
  return `${word}${(code - 0xac00) % 28 === 0 ? '를' : '을'}`
}

type HandoffTask = Pick<Task, 'name' | 'answers' | 'rules'>

// 다른 곳(예약 작업 등)에 붙여 넣을 지시문 (정의서 F-08). AI를 쓰지 않고 앱이 규칙과 답변으로 조립한다.
// 이름 끝의 "(체험)" 같은 괄호 표기는 지시문에 넣지 않는다
const plainName = (name: string) => name.replace(/\s*\([^)]*\)\s*$/, '').trim() || name.trim()

export const buildHandoffPrompt = (task: HandoffTask) => {
  const rules = task.rules.map((rule) => rule.text.trim()).filter(Boolean)
  return [
    `매주 ${withObjectParticle(plainName(task.name))} 써 주세요.`,
    '',
    '[결과 모양]',
    task.answers.shape.trim(),
    '',
    '[지킬 규칙]',
    ...rules.map((rule, index) => `${index + 1}. ${rule}`),
    '',
    '[자료]',
    `제가 ${withObjectParticle(task.answers.materials)} 붙여 넣으면 그걸로만 써 주세요. 자료에 없는 숫자나 이름은 쓰지 말고, 모르는 부분은 [확인 필요]라고 표시해 주세요.`,
  ].join('\n')
}
