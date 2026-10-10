import type { LineStatus } from '../src/lib/evidence.ts'

export type Kind = 'wrong_number' | 'wrong_flip' | 'wrong_added' | 'ok_verbatim' | 'ok_paraphrase' | 'ok_merge'

export type Case = { kind: Kind; line: string; sourceIds: number[]; expected: LineStatus }

export type Material = { name: string; sentences: string[]; cases: Case[] }

export const MATERIALS: Material[] = [
  {
    name: '주간보고 1',
    sentences: [
      '이번 주 A 프로젝트 디자인 시안 2종을 완료했습니다.',
      '고객 미팅은 총 2건 진행했습니다.',
      '다음 주 화요일에 개발팀과 일정 회의가 있습니다.',
    ],
    cases: [
      { kind: 'wrong_number', line: '고객 미팅은 총 3건 진행했습니다.', sourceIds: [2], expected: 'not_in_input' },
      { kind: 'wrong_flip', line: '고객 미팅 2건은 모두 실패했습니다.', sourceIds: [2], expected: 'needs_check' },
      { kind: 'wrong_added', line: 'A 프로젝트 디자인 시안 2종을 완료해 고객 승인까지 받았습니다.', sourceIds: [1], expected: 'needs_check' },
      { kind: 'ok_verbatim', line: 'A 프로젝트 디자인 시안 2종을 완료했습니다.', sourceIds: [1], expected: 'has_source' },
      { kind: 'ok_paraphrase', line: '고객과 미팅을 2건 진행했어요.', sourceIds: [2], expected: 'has_source' },
      { kind: 'ok_merge', line: '디자인 시안 2종을 완료하고 고객 미팅 2건을 진행했습니다.', sourceIds: [1, 2], expected: 'has_source' },
    ],
  },
  {
    name: '주간보고 2',
    sentences: [
      '9월 매출은 1억 2천만 원으로 집계됐습니다.',
      '신규 가입자는 340명 늘었습니다.',
      '결제 오류 문의가 지난주보다 줄었습니다.',
    ],
    cases: [
      { kind: 'wrong_number', line: '9월 매출은 1억 5천만 원으로 집계됐습니다.', sourceIds: [1], expected: 'not_in_input' },
      { kind: 'wrong_flip', line: '결제 오류 문의가 지난주보다 줄지 않았습니다.', sourceIds: [3], expected: 'needs_check' },
      { kind: 'wrong_added', line: '신규 가입자 340명 중 절반이 유료로 전환했습니다.', sourceIds: [2], expected: 'needs_check' },
      { kind: 'ok_verbatim', line: '신규 가입자는 340명 늘었습니다.', sourceIds: [2], expected: 'has_source' },
      { kind: 'ok_paraphrase', line: '9월 매출 집계 결과는 1억 2천만 원입니다.', sourceIds: [1], expected: 'has_source' },
      { kind: 'ok_merge', line: '매출 1억 2천만 원, 신규 가입자 340명 증가', sourceIds: [1, 2], expected: 'has_source' },
    ],
  },
  {
    name: 'TIL 1',
    sentences: [
      'React의 useEffect는 렌더링 이후에 실행된다.',
      '의존성 배열이 비어 있으면 처음 한 번만 실행된다.',
      '정리 함수는 컴포넌트가 사라질 때 호출된다.',
    ],
    cases: [
      { kind: 'wrong_number', line: 'useEffect는 렌더링 이후 100ms 뒤에 실행된다.', sourceIds: [1], expected: 'not_in_input' },
      { kind: 'wrong_flip', line: '의존성 배열이 비어 있으면 실행되지 않는다.', sourceIds: [2], expected: 'needs_check' },
      { kind: 'wrong_added', line: '정리 함수는 컴포넌트가 사라질 때 호출되며 메모리 누수를 자동으로 막아준다.', sourceIds: [3], expected: 'needs_check' },
      { kind: 'ok_verbatim', line: '정리 함수는 컴포넌트가 사라질 때 호출된다.', sourceIds: [3], expected: 'has_source' },
      { kind: 'ok_paraphrase', line: 'useEffect는 화면이 그려진 뒤 실행된다.', sourceIds: [1], expected: 'has_source' },
      { kind: 'ok_merge', line: 'useEffect는 렌더링 이후 실행되고, 의존성 배열이 비면 처음 한 번만 실행된다.', sourceIds: [1, 2], expected: 'has_source' },
    ],
  },
  {
    name: 'TIL 2',
    sentences: [
      'Git rebase는 커밋 기록을 한 줄로 정리한다.',
      '이미 공유한 브랜치에서는 rebase를 쓰지 않는 것이 좋다.',
      '충돌이 나면 수정 후 rebase --continue를 입력한다.',
    ],
    cases: [
      { kind: 'wrong_number', line: 'Git rebase는 커밋 기록을 3줄로 정리한다.', sourceIds: [1], expected: 'not_in_input' },
      { kind: 'wrong_flip', line: '이미 공유한 브랜치에서도 rebase를 써도 괜찮다.', sourceIds: [2], expected: 'needs_check' },
      { kind: 'wrong_added', line: '충돌이 나면 Git이 자동으로 수정한 뒤 rebase --continue를 실행한다.', sourceIds: [3], expected: 'needs_check' },
      { kind: 'ok_verbatim', line: 'Git rebase는 커밋 기록을 한 줄로 정리한다.', sourceIds: [1], expected: 'has_source' },
      { kind: 'ok_paraphrase', line: '공유된 브랜치라면 rebase는 피하는 게 좋다.', sourceIds: [2], expected: 'has_source' },
      { kind: 'ok_merge', line: 'rebase는 기록을 한 줄로 정리하지만, 이미 공유한 브랜치에서는 쓰지 않는 것이 좋다.', sourceIds: [1, 2], expected: 'has_source' },
    ],
  },
  {
    name: '자료 요약 1',
    sentences: [
      '보고서에 따르면 국내 직장인의 94.9%가 업무에 AI를 쓴다.',
      '가장 큰 어려움은 결과 신뢰성 부족으로 42.4%였다.',
      '조사는 2026년 4월부터 5월까지 877명을 대상으로 했다.',
    ],
    cases: [
      { kind: 'wrong_number', line: '가장 큰 어려움은 결과 신뢰성 부족으로 52.4%였다.', sourceIds: [2], expected: 'not_in_input' },
      { kind: 'wrong_flip', line: '국내 직장인의 94.9%가 업무에 AI를 쓰지 못한다.', sourceIds: [1], expected: 'needs_check' },
      { kind: 'wrong_added', line: '국내 직장인의 94.9%가 업무에 AI를 쓰며 생산성이 두 배로 올랐다.', sourceIds: [1], expected: 'needs_check' },
      { kind: 'ok_verbatim', line: '조사는 2026년 4월부터 5월까지 877명을 대상으로 했다.', sourceIds: [3], expected: 'has_source' },
      { kind: 'ok_paraphrase', line: '직장인 94.9%는 일할 때 AI를 활용한다.', sourceIds: [1], expected: 'has_source' },
      { kind: 'ok_merge', line: '877명 조사에서 AI를 쓰는 비율은 94.9%, 가장 큰 어려움은 신뢰성 부족(42.4%)이었다.', sourceIds: [1, 2, 3], expected: 'has_source' },
    ],
  },
  {
    name: '자료 요약 2',
    sentences: [
      '회사는 다음 달부터 재택근무를 주 2회로 줄인다.',
      '출근일은 팀별로 정한다.',
      '예외 신청은 인사팀에 메일로 하면 된다.',
    ],
    cases: [
      { kind: 'wrong_number', line: '회사는 다음 달부터 재택근무를 주 3회로 줄인다.', sourceIds: [1], expected: 'not_in_input' },
      { kind: 'wrong_flip', line: '출근일은 팀별로 정하지 않는다.', sourceIds: [2], expected: 'needs_check' },
      { kind: 'wrong_added', line: '예외 신청은 인사팀에 메일로 하면 되고, 팀장 승인이 필수다.', sourceIds: [3], expected: 'needs_check' },
      { kind: 'ok_verbatim', line: '출근일은 팀별로 정한다.', sourceIds: [2], expected: 'has_source' },
      { kind: 'ok_paraphrase', line: '다음 달부터 재택은 일주일에 2회만 가능하다.', sourceIds: [1], expected: 'has_source' },
      { kind: 'ok_merge', line: '재택근무는 주 2회로 줄고 출근일은 팀별로 정한다.', sourceIds: [1, 2], expected: 'has_source' },
    ],
  },
  {
    name: '회의록 1',
    sentences: [
      '출시일은 10월 16일로 확정했다.',
      'QA는 김민수 님이 맡는다.',
      '디자인 수정은 10월 13일까지 끝낸다.',
    ],
    cases: [
      { kind: 'wrong_number', line: '출시일은 10월 18일로 확정했다.', sourceIds: [1], expected: 'not_in_input' },
      { kind: 'wrong_flip', line: '출시일은 10월 16일로 확정하지 못했다.', sourceIds: [1], expected: 'needs_check' },
      { kind: 'wrong_added', line: 'QA는 이서연 님이 맡는다.', sourceIds: [2], expected: 'needs_check' },
      { kind: 'ok_verbatim', line: '디자인 수정은 10월 13일까지 끝낸다.', sourceIds: [3], expected: 'has_source' },
      { kind: 'ok_paraphrase', line: '10월 16일 출시가 확정됐다.', sourceIds: [1], expected: 'has_source' },
      { kind: 'ok_merge', line: '출시일은 10월 16일, 디자인 수정 마감은 10월 13일이다.', sourceIds: [1, 3], expected: 'has_source' },
    ],
  },
  {
    name: '회의록 2',
    sentences: [
      '랜딩 페이지 문구는 B안으로 가기로 했다.',
      '광고 예산은 300만 원을 유지한다.',
      '다음 회의는 금요일 오후 3시다.',
    ],
    cases: [
      { kind: 'wrong_number', line: '광고 예산은 500만 원을 유지한다.', sourceIds: [2], expected: 'not_in_input' },
      { kind: 'wrong_flip', line: '랜딩 페이지 문구는 B안으로 가지 않기로 했다.', sourceIds: [1], expected: 'needs_check' },
      { kind: 'wrong_added', line: '랜딩 페이지 문구는 B안으로 가기로 했고 영상도 새로 만든다.', sourceIds: [1], expected: 'needs_check' },
      { kind: 'ok_verbatim', line: '다음 회의는 금요일 오후 3시다.', sourceIds: [3], expected: 'has_source' },
      { kind: 'ok_paraphrase', line: '광고비는 지금처럼 300만 원이다.', sourceIds: [2], expected: 'has_source' },
      { kind: 'ok_merge', line: '문구는 B안으로 가고 광고 예산은 300만 원을 유지한다.', sourceIds: [1, 2], expected: 'has_source' },
    ],
  },
  {
    name: '공지',
    sentences: [
      '사내 워크숍은 11월 7일 금요일에 열린다.',
      '장소는 판교 본사 3층 대회의실이다.',
      '참석 여부는 11월 1일까지 알려 달라.',
    ],
    cases: [
      { kind: 'wrong_number', line: '장소는 판교 본사 5층 대회의실이다.', sourceIds: [2], expected: 'not_in_input' },
      { kind: 'wrong_flip', line: '사내 워크숍은 11월 7일 금요일에 열리지 않는다.', sourceIds: [1], expected: 'needs_check' },
      { kind: 'wrong_added', line: '참석 여부는 11월 1일까지 알려 달라. 불참하면 연차를 써야 한다.', sourceIds: [3], expected: 'needs_check' },
      { kind: 'ok_verbatim', line: '사내 워크숍은 11월 7일 금요일에 열린다.', sourceIds: [1], expected: 'has_source' },
      { kind: 'ok_paraphrase', line: '워크숍 장소는 판교 본사 3층 대회의실이에요.', sourceIds: [2], expected: 'has_source' },
      { kind: 'ok_merge', line: '11월 7일 워크숍에 참석하는지 11월 1일까지 알려 주세요.', sourceIds: [1, 3], expected: 'has_source' },
    ],
  },
  {
    name: '주간보고 3',
    sentences: [
      '이번 주 버그 12건 중 9건을 해결했다.',
      '남은 3건은 다음 주 수요일까지 처리한다.',
      '서버 응답 속도가 평균 20% 빨라졌다.',
    ],
    cases: [
      { kind: 'wrong_number', line: '이번 주 버그 12건 중 11건을 해결했다.', sourceIds: [1], expected: 'not_in_input' },
      { kind: 'wrong_flip', line: '서버 응답 속도가 평균 20% 느려졌다.', sourceIds: [3], expected: 'needs_check' },
      { kind: 'wrong_added', line: '남은 3건은 다음 주 수요일까지 처리하고 배포도 마친다.', sourceIds: [2], expected: 'needs_check' },
      { kind: 'ok_verbatim', line: '서버 응답 속도가 평균 20% 빨라졌다.', sourceIds: [3], expected: 'has_source' },
      { kind: 'ok_paraphrase', line: '버그 12건 가운데 9건은 고쳤다.', sourceIds: [1], expected: 'has_source' },
      { kind: 'ok_merge', line: '버그 9건을 해결했고 남은 3건은 다음 주 수요일까지 처리한다.', sourceIds: [1, 2], expected: 'has_source' },
    ],
  },
]
