# 믿고맡김 (가제)

반복 문서 업무(주간보고 등)를 AI가 쓰고, 확인할 곳을 짚어주고, 사용자가 고친 내용을 일마다 규칙과 기록으로 쌓는 PC 웹 앱.

- 앱 코드: `app/` (작업 전 `app/AGENTS.md`를 먼저 읽는다)
- 화면·기능 정의서: `docs/screen-spec.md` (화면 S0~S6, 기능 F-01~F-13). 구현 기준은 이 문서다
- 요구사항 정의서(제출용): `docs/PRD.md`
- 작업 계획과 블록별 지시: `docs/work-plan.md`
- 차트와 생성 스크립트: `docs/charts/`
- 디자인 자료(시안, 화면 캡처): `design/`
- 지난 기록(참고만): `docs/research/`(설문 24명 시점 문제 정의, 데스크 리서치, 설문 문항), `docs/archive/`(PRD 초안, 예전 제출 초안), `docs/til/`. 숫자와 결정이 최종본과 다를 수 있다. 기준은 항상 `docs/PRD.md`와 `docs/screen-spec.md`다

## 지켜야 할 것

- 정의서에 없는 기능을 추가하지 않는다. 애매하면 멈추고 묻는다
- 줄 상태 판정은 `app/src/lib/evidence.ts`, 연속 계산은 `app/src/lib/streak.ts`를 그대로 쓴다. 새로 만들지 않는다
- 화면 문구에 정확성을 보장하는 표현("정확해요", "검증 완료", "검토 완료", "확인함")을 쓰지 않는다
- `.env.local`과 API 키는 커밋하지 않는다
- 블록 하나가 끝나면 `cd app && pnpm build`가 통과하는지 확인한다
