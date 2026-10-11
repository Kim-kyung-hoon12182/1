// S2에 쓰는 질문과 안내 문구

export const QUESTIONS = [
  {
    field: 'what',
    title: '1. 어떤 일을 반복하나요?',
    hint: '반복해서 AI에게 맡기고 싶은 일을 적어 주세요.',
    placeholder: '예: 매주 팀장님께 내는 주간보고를 써요.',
  },
  {
    field: 'materials',
    title: '2. 어떤 재료를 쓰나요?',
    hint: '실행할 때마다 붙여 넣을 재료의 종류를 적어 주세요.',
    placeholder: '예: 지난주 업무 메모',
  },
  {
    field: 'shape',
    title: '3. 결과는 어떤 모양인가요?',
    hint: '결과물의 분량, 말투, 구성을 적어 주세요.',
    placeholder: '예: 500자 안팎, 보고체, 완료한 일과 예정된 일을 나눠서',
  },
] as const

export const RECAP_FIELDS = [
  { field: 'what', icon: 'repeat', label: '하는 일' },
  { field: 'materials', icon: 'input', label: '재료' },
  { field: 'shape', icon: 'table_chart', label: '결과 모양' },
] as const

export const QUESTIONS_TIPS = [
  { icon: 'chat', title: '완벽한 문장이 아니어도 돼요', body: '동료에게 일을 인수인계하듯 평소 쓰는 말로 적어 주세요.' },
  { icon: 'tune', title: '규칙은 2단계에서 고칠 수 있어요', body: '지금 쓴 내용은 초안이에요. AI가 만든 규칙을 보고 빼거나 더할 수 있어요.' },
]

export const AFTER_REGISTER_STEPS = [
  { title: '질문에 답하기', body: '지금 화면에서 작업을 설명해요' },
  { title: '규칙 확인하고 저장', body: 'AI가 쓸 때 지킬 규칙을 정해요' },
  { title: '재료 넣고 실행', body: '다음부터는 재료만 붙여 넣으면 돼요' },
]

export const RULE_TIPS = [
  {
    title: '"~한다"처럼 지시하듯 써요',
    body: '"숫자는 메모에 있는 것만 쓴다"처럼 AI가 글을 쓸 때 지킬 행동을 한 문장으로 적어 주세요.',
  },
  {
    title: '모호한 표현보다 구체적인 조건',
    body: '"적당히 짧게" 대신 "500자 안팎으로 쓴다"처럼 분명한 조건이 더 잘 지켜져요.',
  },
  {
    title: '저장한 규칙만 적용돼요',
    body: 'AI가 제안한 규칙도 저장 전에 직접 확인한 것만 이 작업에 쓰여요.',
  },
]

export const RULE_PLACEHOLDER = '예: 숫자는 메모에 있는 것만 쓴다'
export const RULE_LABEL = '규칙 내용 (AI가 지킬 행동을 한 문장으로)'
