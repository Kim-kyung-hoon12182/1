import type { Answers, OutputLine, Rule, SampleKey, Run, Task } from '@/types/task'

type SampleLine = Pick<OutputLine, 'text' | 'sourceIds' | 'ruleIds'>

export type Sample = {
  key: SampleKey
  label: string
  name: string
  answers: Answers
  rules: Rule[]
  sentences: string[]
  material: string
  lines: SampleLine[]
}

const rules = (texts: string[]): Rule[] => texts.map((text, index) => ({ id: `r${index + 1}`, text, source: 'setup' }))

const defineSample = (sample: Omit<Sample, 'material'>): Sample => ({ ...sample, material: sample.sentences.join('\n') })

// 예시마다 결과 줄 중 하나는 자료에 없는 숫자, 하나는 근거가 약한 문장이다 (F-09).
export const SAMPLES: Record<SampleKey, Sample> = {
  report: defineSample({
    key: 'report',
    label: '업무보고',
    name: '주간보고',
    answers: {
      what: '매주 팀장님께 내는 주간보고를 써요.',
      materials: '지난주 업무 메모',
      shape: '500자 안팎, 보고체, 완료한 일과 예정된 일을 나눠서',
    },
    rules: rules([
      '존댓말 보고체로 쓴다',
      '숫자는 메모에 있는 것만 쓴다',
      '완료한 일과 예정된 일을 나눠 쓴다',
      '500자 안팎으로 쓴다',
      '메모에 없는 평가는 쓰지 않는다',
    ]),
    sentences: [
      '월요일에는 A 프로젝트 마무리 작업을 끝냈습니다.',
      '화요일 매출은 9천만 원을 기록했습니다.',
      '수요일에는 고객 미팅 2건을 진행했습니다.',
      '목요일에는 신규 기능 QA를 진행했고 버그 3건을 수정했습니다.',
      '금요일에는 주간 회의에서 다음 주 일정을 공유했습니다.',
    ],
    lines: [
      { text: '이번 주 A 프로젝트 마무리 작업을 완료했습니다.', sourceIds: [1], ruleIds: ['r1', 'r3'] },
      { text: '화요일 매출은 9천만 원입니다.', sourceIds: [2], ruleIds: ['r1', 'r2'] },
      { text: '수요일에는 고객 미팅 2건을 진행했습니다.', sourceIds: [3], ruleIds: ['r1', 'r2'] },
      { text: '목요일에는 QA를 마치고 버그 3건을 수정했습니다.', sourceIds: [4], ruleIds: ['r1', 'r2'] },
      { text: '매출이 1억 원으로 목표를 초과 달성했습니다.', sourceIds: [2], ruleIds: ['r1', 'r2'] },
      { text: '전반적으로 팀 분위기가 매우 좋았습니다.', sourceIds: [5], ruleIds: ['r1', 'r5'] },
      { text: '다음 주 일정은 금요일 주간 회의에서 공유했습니다.', sourceIds: [5], ruleIds: ['r1', 'r3'] },
    ],
  }),
  til: defineSample({
    key: 'til',
    label: 'TIL·블로그',
    name: 'TIL 블로그',
    answers: {
      what: '오늘 배운 내용을 정리해서 블로그에 올리는 TIL을 써요.',
      materials: '오늘 공부한 메모와 막혔던 오류 기록',
      shape: '500자 안팎, 해요체, 배운 점·막힌 점·내일 할 일 순서',
    },
    rules: rules([
      '해요체로 쓴다',
      '배운 점, 막힌 점, 내일 할 일 순서로 쓴다',
      '오류 횟수와 이름은 메모에 있는 대로만 쓴다',
      '코드 용어는 메모에 쓴 표기를 그대로 쓴다',
      '500자 안팎으로 쓴다',
    ]),
    sentences: [
      '오늘은 React 상태 관리와 useEffect 의존성 배열을 공부했습니다.',
      '의존성 배열을 비워 두면 처음 한 번만 실행된다는 점을 확인했습니다.',
      '무한 렌더링 오류가 3번 발생했고 원인은 객체를 의존성에 넣은 것이었습니다.',
      '해결하려고 useMemo로 객체를 고정했습니다.',
      '내일은 커스텀 훅으로 코드를 정리해 볼 예정입니다.',
    ],
    lines: [
      { text: '오늘은 React 상태 관리와 useEffect 의존성 배열을 공부했어요.', sourceIds: [1], ruleIds: ['r1', 'r2'] },
      { text: '의존성 배열을 비워 두면 처음 한 번만 실행된다는 걸 확인했어요.', sourceIds: [2], ruleIds: ['r1', 'r4'] },
      { text: '무한 렌더링 오류가 3번 발생했는데 원인은 객체를 의존성에 넣은 것이었어요.', sourceIds: [3], ruleIds: ['r1', 'r3'] },
      { text: '비슷한 오류를 5회 넘게 겪으면서 많이 힘들었어요.', sourceIds: [3], ruleIds: ['r1', 'r3'] },
      { text: '그래서 useMemo로 객체를 고정해서 해결했어요.', sourceIds: [4], ruleIds: ['r1', 'r4'] },
      { text: '앞으로 리액트를 완전히 정복할 수 있을 것 같아요.', sourceIds: [5], ruleIds: ['r1'] },
      { text: '내일은 커스텀 훅으로 코드를 정리해 볼 거예요.', sourceIds: [5], ruleIds: ['r1', 'r2'] },
    ],
  }),
  summary: defineSample({
    key: 'summary',
    label: '자료 요약',
    name: '자료 요약',
    answers: {
      what: '읽은 자료를 팀에 공유할 요약으로 정리해요.',
      materials: '기사나 보고서에서 옮겨 적은 핵심 문장',
      shape: '핵심 세 줄과 시사점 한 줄, 해요체',
    },
    rules: rules([
      '핵심 세 줄과 시사점 한 줄로 쓴다',
      '숫자와 연도는 자료에 있는 것만 쓴다',
      '자료에 없는 해석은 시사점 줄에만 쓴다',
      '해요체로 쓴다',
      '근거가 되는 문장을 함께 표시한다',
    ]),
    sentences: [
      '국내 생성형 AI 도입 기업 비율은 올해 38%로 집계됐습니다.',
      '도입 기업 가운데 절반은 문서 작성에 가장 먼저 AI를 썼습니다.',
      '반면 결과 검증에 시간이 든다는 응답이 많았습니다.',
      '보고서는 검증 절차를 표준화할 필요가 있다고 제안했습니다.',
      '조사는 2026년 3월에 실시됐습니다.',
    ],
    lines: [
      { text: '국내 생성형 AI 도입 기업 비율은 올해 38%예요.', sourceIds: [1], ruleIds: ['r1', 'r2'] },
      { text: '도입 기업의 절반은 문서 작성에 가장 먼저 AI를 썼어요.', sourceIds: [2], ruleIds: ['r1', 'r4'] },
      { text: '결과 검증에 시간이 든다는 응답이 많았어요.', sourceIds: [3], ruleIds: ['r1', 'r5'] },
      { text: '검증 비용 때문에 도입을 포기한 기업도 12%였어요.', sourceIds: [3], ruleIds: ['r1', 'r2'] },
      { text: '보고서는 검증 절차를 표준화하자고 제안했어요.', sourceIds: [4], ruleIds: ['r1', 'r5'] },
      { text: '시사점: 모든 기업이 곧 전담 조직을 둘 거예요.', sourceIds: [4], ruleIds: ['r1', 'r3'] },
      { text: '조사는 2026년 3월에 진행됐어요.', sourceIds: [5], ruleIds: ['r1', 'r2'] },
    ],
  }),
  minutes: defineSample({
    key: 'minutes',
    label: '회의록',
    name: '회의록 정리',
    answers: {
      what: '주간 회의 내용을 결정 사항과 할 일로 정리해요.',
      materials: '회의 중에 적은 메모',
      shape: '결정 사항과 할 일을 나누고, 할 일에는 담당자와 기한을 함께, 해요체',
    },
    rules: rules([
      '결정 사항과 할 일을 나눠 쓴다',
      '할 일에는 담당자와 기한을 함께 쓴다',
      '보류된 안건은 보류라고 쓴다',
      '담당자가 정해지지 않았으면 미지정이라고 쓴다',
      '해요체로 쓴다',
    ]),
    sentences: [
      '디자인 시안은 금요일까지 김지수 님이 전달하기로 했습니다.',
      '배포 일정은 다음 주 수요일로 확정했습니다.',
      '예산은 추가 논의가 필요해 보류했습니다.',
      '고객 인터뷰는 이번 주에 5건을 진행하기로 했습니다.',
      'QA 담당자는 아직 정해지지 않았습니다.',
    ],
    lines: [
      { text: '디자인 시안은 금요일까지 김지수 님이 전달해요.', sourceIds: [1], ruleIds: ['r2', 'r5'] },
      { text: '배포는 다음 주 수요일로 확정했어요.', sourceIds: [2], ruleIds: ['r1', 'r5'] },
      { text: '예산은 추가 논의가 필요해서 보류했어요.', sourceIds: [3], ruleIds: ['r3', 'r5'] },
      { text: '고객 인터뷰는 이번 주에 8건 진행해요.', sourceIds: [4], ruleIds: ['r2', 'r5'] },
      { text: 'QA 담당자는 아직 미지정이에요.', sourceIds: [5], ruleIds: ['r4', 'r5'] },
      { text: '팀 분위기가 좋아서 다음 회의도 기대돼요.', sourceIds: [3], ruleIds: ['r5'] },
    ],
  }),
}

export const SAMPLE_KEYS: SampleKey[] = ['report', 'til', 'summary', 'minutes']

export const getSample = (key?: SampleKey) => (key ? SAMPLES[key] : undefined)

const DAY = 24 * 60 * 60 * 1000

// 체험용 작업: 1·2회차를 안 고치고 썼다. 3회차를 안 고치고 복사하면 맡겨볼 만한 때가 된다 (F-09).
export function createDemoTask(): Task {
  const sample = SAMPLES.report
  const now = Date.now()
  const makeRun = (number: number, daysAgo: number): Run => ({
    id: `demo-run-${number}`,
    number,
    input: sample.material,
    sources: sample.sentences,
    lines: [],
    edited: false,
    passState: 'stayed',
    flaggedCount: 0,
    elapsedSeconds: 40,
    copied: true,
    finalText: '',
    isSample: true,
    createdAt: new Date(now - daysAgo * DAY).toISOString(),
  })
  return {
    id: 'demo',
    name: `${sample.name} (체험)`,
    sampleKey: 'report',
    answers: sample.answers,
    rules: sample.rules,
    runs: [makeRun(1, 14), makeRun(2, 7)],
    handsOff: false,
    isDemo: true,
    createdAt: new Date(now - 21 * DAY).toISOString(),
  }
}
