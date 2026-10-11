# 믿고맡김 앱

반복하는 문서 작업을 AI에 시키고, 확인할 곳을 짚어주고, 고쳤는지 기록해서 맡겨도 될 때를 알려주는 PC 웹 앱이다.
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
    App.tsx             화면 전환만 담당
    index.css           Tailwind import, 전역 스타일
    pages/              화면 단위 컴포넌트 (TaskListPage.tsx 등)
    components/         여러 화면에서 쓰는 UI (AppHeader.tsx, RunChips.tsx, Icon.tsx 등)
    lib/                React와 무관한 로직 (storage.ts, evidence.ts, api.ts 등)
    hooks/              React 훅 (useTasks.ts 등)
    types/              공용 타입 (task.ts)
    data/               예시 일, AI 키가 없을 때 쓰는 예시 결과
  scripts/              로직 테스트 (overlap-test.ts, streak-test.ts). Node로 직접 실행하므로 상대 경로와 .ts 확장자로 import한다
```

- 한 화면에서만 쓰는 작은 컴포넌트는 그 화면 파일 안에 둔다. 두 화면 이상에서 쓰면 `components/`로 옮긴다.
- `lib/`의 함수는 순수 함수로 두고 React를 import하지 않는다.

## 이름 규칙

| 대상 | 규칙 | 예 |
| --- | --- | --- |
| 컴포넌트 파일 | PascalCase.tsx, default export | `RunPage.tsx` |
| 훅 파일 | useCamelCase.ts, named export | `useTasks.ts` |
| 로직·타입·데이터 파일 | camelCase.ts, named export | `evidence.ts`, `sampleTasks.ts` |
| 타입 | PascalCase, `type` 사용 (`interface` 안 씀) | `Task`, `Run` |
| 상수 | UPPER_SNAKE_CASE | `HANDOFF_STREAK` |
| localStorage 키 | `mitgo:` 접두사 | `mitgo:tasks` |

## 코드 스타일

- 작은따옴표, 세미콜론 없음, 들여쓰기 2칸. 아포스트로피가 들어간 문자열은 큰따옴표를 쓴다
- import 경로는 `@/` 별칭을 쓴다 (`@/lib/storage`)
- 컴포넌트는 `export default function 이름()` 형태
- 스타일은 Tailwind 클래스만 쓴다. 별도 CSS 파일을 만들지 않는다
- 화면 문구는 존댓말 해요체. "정확해요"처럼 결과를 보장하는 표현은 쓰지 않는다
- 상태는 색만으로 구분하지 않고 글자 라벨을 함께 붙인다
- 주석은 코드로 드러나지 않는 제약만 적는다

## 확인

- 작업 후 `pnpm build`가 통과해야 한다
- `evidence.ts`나 `streak.ts`를 고치면 `node --experimental-strip-types scripts/overlap-test.ts`, `node --experimental-strip-types scripts/streak-test.ts`를 다시 돌리고, 결과가 바뀌면 `../docs/screen-spec.md` F-04 결과표를 고친다
- `.env.local`(GEMINI_API_KEY)은 커밋하지 않는다. 키가 없어도 예시 결과로 앱이 동작해야 한다
