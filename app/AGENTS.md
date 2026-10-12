# 또시켰네 앱

반복하는 문서 작업을 AI에 시키고, 확인할 곳을 표시해 주고, 고쳤는지 기록해서 맡겨도 될 때를 알려주는 PC 웹 앱이다.
제품 정의는 `../docs/PRD.md`, 화면과 기능은 `../docs/screen-spec.md`를 따른다. 화면 ID(S1 등)와 기능 ID(F-01 등)는 이 문서 기준이다.

## 스택

- React 19, Vite 8, Tailwind CSS v4, TypeScript (strict)
- Vercel 서버 함수: `api/*.ts`는 `export async function POST(request: Request): Promise<Response>` 형태
- 저장: localStorage. 로그인 없음
- AI: Gemini 무료 등급, `api/generate.ts`만 거친다. 키는 브라우저에 노출하지 않는다
- 패키지 매니저: pnpm. 새 의존성은 꼭 필요할 때만 추가한다

## 폴더 구조

```
app/
  api/                  서버 함수 (Vercel)
  src/
    main.tsx            진입점
    App.tsx             화면 전환, 공통 헤더·푸터
    index.css           Tailwind 토큰(@theme), 전역 스타일
    pages/              화면 하나당 파일 하나 (RunPage.tsx 등). 화면 조립만 한다
      run/ list/ create/  큰 화면은 같은 이름의 폴더에 조각을 나눠 둔다 (ResultCard.tsx 등)
    components/         여러 화면에서 쓰는 UI (Button, Badge, Card, Notice, Field, AppHeader 등)
    hooks/              상태와 동작 (useRunSession, useTaskDraft, useTasks 등)
    lib/                React와 무관한 순수 로직 (evidence, streak, run, rules, storage 등)
    types/              공용 타입 (task.ts)
    data/               예시 작업, AI 키가 없을 때 쓰는 예시 결과
  scripts/              로직 테스트. Node로 직접 실행하므로 상대 경로와 .ts 확장자로 import한다
```

- 화면 파일(`pages/*.tsx`)은 훅을 부르고 조각을 배치하기만 한다. 상태와 계산은 `hooks/`와 `lib/`에 둔다.
- 한 화면에서만 쓰는 컴포넌트는 그 화면의 폴더(`pages/run/` 등)에 둔다. 두 화면 이상에서 쓰면 `components/`로 옮긴다.
- 버튼·배지·안내·카드처럼 반복되는 모양은 `components/`의 공통 컴포넌트를 쓴다. 같은 클래스 묶음을 다시 쓰지 않는다.
- 상태 색(주황 "확인할 곳", 회색 "참고한 곳")은 `index.css`의 `flag-*`, `neutral-*` 토큰으로만 쓴다. 정확하다는 뜻으로 읽히는 초록 계열은 쓰지 않는다.
- 한 파일은 200줄 안팎으로 유지한다. 넘으면 조각으로 나눈다.
- `lib/`의 함수는 순수 함수로 두고 React를 import하지 않는다.

## 이름 규칙

| 대상 | 규칙 | 예 |
| --- | --- | --- |
| 컴포넌트 파일 | PascalCase.tsx, default export. 한 파일에 컴포넌트 하나가 원칙 | `RunPage.tsx` |
| 훅 파일 | useCamelCase.ts, named export | `useTasks.ts` |
| 로직·타입·데이터 파일 | camelCase.ts, named export | `evidence.ts`, `sampleTasks.ts` |
| 타입 | PascalCase, `type` 사용 (`interface` 안 씀) | `Task`, `Run` |
| 상수 | UPPER_SNAKE_CASE | `HANDOFF_STREAK` |
| localStorage 키 | `mitgo:` 접두사 | `mitgo:tasks` |

## 코드 스타일

- 작은따옴표, 세미콜론 없음, 들여쓰기 2칸. 아포스트로피가 들어간 문자열은 큰따옴표를 쓴다
- import 경로는 `@/` 별칭을 쓴다 (`@/lib/storage`)
- 컴포넌트는 `export default function 이름()` 형태
- 스타일은 Tailwind 클래스만 쓴다. 별도 CSS 파일을 만들지 않는다. 클래스를 합칠 때는 `cn()`을 쓴다
- 글자만 있는 아이콘 버튼은 `IconButton`을 써서 `aria-label`을 꼭 붙인다
- 화면 문구는 존댓말 해요체. "정확해요"처럼 결과를 보장하는 표현은 쓰지 않는다
- 상태는 색만으로 구분하지 않고 글자 라벨을 함께 붙인다
- 주석은 코드로 드러나지 않는 제약만 적는다

## 확인

- 작업 후 `pnpm build`가 통과해야 한다. `tsconfig`가 쓰지 않는 변수와 매개변수를 오류로 본다
- `rules.ts`나 `format.ts`를 고치면 `node --experimental-strip-types scripts/rules-test.ts`를 돌린다
- `runRecord.ts`(고침 판정, 넘긴 방식)를 고치면 `node --experimental-strip-types scripts/run-record-test.ts`를 돌린다
- `handoff.ts`(지시문 만들기)를 고치면 `node --experimental-strip-types scripts/handoff-test.ts`를 돌린다
- `runPrompt.ts`(실행 요청·응답 읽기)를 고치면 `node --experimental-strip-types scripts/run-prompt-test.ts`를 돌린다
- `heading.ts`(소제목 판정)를 고치면 `node --experimental-strip-types scripts/heading-test.ts`를 돌린다
- `route.ts`(화면 주소)를 고치면 `node --experimental-strip-types scripts/route-test.ts`, `highlight.ts`를 고치면 `scripts/highlight-test.ts`를 돌린다
- `tour.ts`(안내 단계)를 고치면 `node --experimental-strip-types scripts/tour-test.ts`를 돌린다. 단계의 `data-tour` 이름이 화면에 없으면 실패한다
- `rules.ts`의 규칙 후보 부분(`buildRuleCandidatePrompt`, `parseRuleCandidate`)을 고치면 `node --experimental-strip-types scripts/rule-candidate-test.ts`를 돌린다
- `evidence.ts`나 `streak.ts`를 고치면 `node --experimental-strip-types scripts/overlap-test.ts`, `node --experimental-strip-types scripts/streak-test.ts`를 다시 돌리고, 결과가 바뀌면 `../docs/screen-spec.md` F-04 결과표를 고친다
- `.env.local`(GEMINI_API_KEY)은 커밋하지 않는다. 키가 없어도 예시 결과로 앱이 동작해야 한다
