import type { Rule } from '../types/task.ts'

// 글을 쓸 때 AI가 지킬 공통 지시. 앱이 AI에 보내는 실행 요청(runPrompt.ts)과 다른 곳에 붙여 넣는 지시문(handoff.ts)이 같은 문장을 쓴다.
// 줄마다 근거 번호를 붙이는 약속과 JSON 형식은 앱 안에서만 필요해서 runPrompt.ts에 따로 둔다.
export const FREEFORM_MARK = '[자료 밖 허용]'

const hasFreeform = (rules: Pick<Rule, 'text' | 'freeform'>[]) => rules.some((rule) => rule.freeform && rule.text.trim())

// inApp: 앱 안의 실행 요청이면 줄마다 지킨 규칙 번호(ruleIds)를 받는 문장을 넣는다. 다른 곳에 붙여 넣는 지시문에는 필요 없다.
export const commonDirectives = (rules: Pick<Rule, 'text' | 'freeform'>[], inApp = true) => [
  '- 자료에 없는 숫자, 이름, 사실은 쓰지 마세요. 모르는 부분은 "[확인 필요]"라고 쓰세요.',
  ...(hasFreeform(rules)
    ? [`- ${FREEFORM_MARK}이 붙은 규칙을 지키는 줄만 자료에 없는 의견, 느낀 점, 다짐을 써도 됩니다.${inApp ? ' 그 줄의 ruleIds에 그 규칙 번호를 넣으세요.' : ''} 자료에 있는 사실처럼 쓰지 말고, 숫자와 이름은 그 줄에서도 자료에 없는 것을 쓰지 마세요.`]
    : []),
  '- 자료의 조심스러운 표현(가능성이 있다, ~할 수 있다, 추정, 일부)은 단정으로 바꾸지 말고 그대로 유지하세요.',
  '- 날짜와 숫자는 자료에 적힌 표기 그대로 쓰세요(예: 2026. 09. 23.을 2026년 9월 23일로 바꾸지 마세요).',
  '- 자료의 시제와 사실 상태를 바꾸지 마세요. 이미 끝난 일은 끝난 일로, 계획이나 예정은 계획이나 예정으로 그대로 쓰세요.',
  '- 결과는 줄 단위로 쓰고, 한 줄에는 하나의 내용만 담으세요.',
  '- 소제목이 필요하면 "[완료한 일]"처럼 대괄호로 감싼 짧은 줄로만 쓰세요. "여기까지예요" 같은 맺음 문장은 쓰지 마세요.',
]
