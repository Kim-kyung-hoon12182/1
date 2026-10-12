// S3에 쓰는 안내 문구. 정확하다고 보증하는 표현은 쓰지 않는다.

export const GUIDE_STEPS = [
  { title: '자료 넣기', body: '메모나 자료를 붙여 넣으면 문장마다 번호가 붙어요.' },
  { title: '글 쓰기', body: '자료에 있는 내용으로 쓰고, 줄마다 근거로 삼은 문장을 표시해요.' },
  { title: '확인할 곳 보고 고치기', body: '표시된 줄과 참고한 자료를 직접 보고, 고친 뒤 복사해요.' },
]

export const LEGEND = [
  { status: 'has_source', name: '참고한 곳', body: 'AI가 근거라고 참고한 자료 위치예요. 뜻이 맞는지는 확인하지 않았어요.' },
  { status: 'needs_check', name: '근거 확인 필요', body: '참고한 자료가 없거나, 겹치는 낱말이 적거나, 뒤집는 말이 자료에 없어요.' },
  { status: 'not_in_input', name: '자료에 없음', body: '줄의 숫자·날짜·이름이 자료에서 보이지 않아요.' },
  { status: 'heading', name: '제목', body: '[제목]처럼 구분용으로 쓴 짧은 글이에요. 내용이 아니라서 자료와 맞춰 보지 않아요.' },
] as const

export const SCOPE_NOTE =
  '자동 검사는 숫자·날짜와 일부 이름(따옴표 안 글자, 영문 대문자 단어), 근거 위치만 봐요. 내용이 맞는지는 직접 확인해 주세요. 결과에서 빠진 내용은 알려 주지 못해요.'

export const READ_FIRST_NOTE = '확인할 곳 표시는 결과가 정확하다는 뜻이 아니에요. 앱이 검사한 범위만 알려 주니, 표시된 줄과 참고한 자료를 직접 확인하세요.'
