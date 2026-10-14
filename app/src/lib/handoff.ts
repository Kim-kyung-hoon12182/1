import type { Task } from '../types/task.ts'
import { commonDirectives, FREEFORM_MARK } from './directives.ts'

// 받침이 있으면 "을", 없으면 "를". 한글로 끝나지 않으면 둘 다 보여 준다.
export const withObjectParticle = (word: string) => {
  const code = word.trim().charCodeAt(word.trim().length - 1)
  if (code < 0xac00 || code > 0xd7a3) return `${word}을(를)`
  return `${word}${(code - 0xac00) % 28 === 0 ? '를' : '을'}`
}

type HandoffTask = Pick<Task, 'name' | 'answers' | 'rules'>

// 다른 곳(예약 작업 등)에 붙여 넣을 지시문 (정의서 F-08). AI를 쓰지 않고 앱이 규칙과 답변으로 조립한다.
// 앱이 AI에 보내는 실행 요청과 같은 공통 지시를 쓴다(directives.ts). 줄마다 근거 번호를 받는 약속과 JSON 형식은 앱 안에서만 필요해서 넣지 않는다.
// 이름 끝의 "(체험)" 같은 괄호 표기는 지시문에 넣지 않는다
const plainName = (name: string) => name.replace(/\s*\([^)]*\)\s*$/, '').trim() || name.trim()

export const buildHandoffPrompt = (task: HandoffTask) => {
  const rules = task.rules.filter((rule) => rule.text.trim())
  return [
    `매주 "${plainName(task.name)}" 글을 써 주세요.`,
    '',
    '[결과 모양]',
    task.answers.shape.trim(),
    '',
    '[지킬 규칙]',
    ...rules.map((rule, index) => `${index + 1}. ${rule.text.trim()}${rule.freeform ? ` ${FREEFORM_MARK}` : ''}`),
    '',
    '[자료]',
    `메모는 실행할 때마다 이 지시문 아래에 붙여 넣을게요. 제가 적어 둔 자료 설명: "${task.answers.materials.trim()}"`,
    '',
    '[공통으로 지킬 것]',
    ...commonDirectives(rules, false),
  ].join('\n')
}
