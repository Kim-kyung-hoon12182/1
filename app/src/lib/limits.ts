// 입력 글자 수 한도 (정의서 S2)
export const ANSWER_MAX = 300
export const EXAMPLE_MAX = 2000
export const NAME_MAX = 20
export const RULE_MAX = 200

// 한 작업의 규칙 글자 수 합계 한도. 요청 전체 한도(REQUEST_MAX_CHARS) 안에 자료·질문 답변·고친 내용이 함께 들어가므로 규칙이 한없이 길어지지 않게 한다.
export const RULES_BUDGET = 3000
// AI에 보내는 요청 전체의 한도. 서버(api/generate.ts)의 MAX_INPUT_CHARS와 같은 값으로 맞춘다.
export const REQUEST_MAX_CHARS = 16000

type TextOwner = { text: string }

export const rulesChars = (rules: TextOwner[]) => rules.reduce((sum, rule) => sum + rule.text.length, 0)

// 규칙 하나에 쓸 수 있는 글자 수. 고치는 중인 규칙은 자기 글자 수(ownLength)를 빼고 계산한다.
export const ruleMaxLength = (rules: TextOwner[], ownLength = 0) => Math.max(0, Math.min(RULE_MAX, RULES_BUDGET - (rulesChars(rules) - ownLength)))
