// S3에 쓰는 안내 문구. 정확하다고 보증하는 표현은 쓰지 않는다.

export const GUIDE_STEPS = [
  { title: '재료 넣기', body: '메모나 자료를 붙여 넣으면 문장마다 번호가 붙어요.' },
  { title: 'AI가 글 쓰기', body: '재료에 있는 내용으로 줄마다 근거 위치를 짚어요.' },
  { title: '확인할 곳 보고 고치기', body: '표시된 줄과 짚은 재료를 직접 보고, 고친 뒤 복사해요.' },
]

export const LEGEND = [
  { status: 'has_source', name: '짚은 곳', body: 'AI가 근거라고 짚은 재료 위치예요. 뜻이 맞는지는 확인하지 않았어요.' },
  { status: 'needs_check', name: '근거 확인 필요', body: '짚은 재료가 없거나, 겹치는 낱말이 적거나, 뒤집는 말이 재료에 없어요.' },
  { status: 'not_in_input', name: '재료에 없음', body: '줄의 숫자·날짜·이름이 재료에서 보이지 않아요.' },
  { status: 'heading', name: '제목', body: '[제목]처럼 구분용으로 쓴 짧은 글이에요. 내용이 아니라서 재료와 맞춰 보지 않아요.' },
] as const

export const SCOPE_NOTE =
  '자동 검사는 숫자·날짜와 일부 이름(따옴표 안 글자, 영문 대문자 단어), 근거 위치만 봐요. 내용이 맞는지는 직접 확인해 주세요.'

export const READ_FIRST_NOTE = '확인할 곳 표시는 결과가 정확하다는 뜻이 아니에요. 앱이 검사한 범위만 알려드리니, 표시된 줄과 짚은 재료를 직접 확인해 주세요.'
