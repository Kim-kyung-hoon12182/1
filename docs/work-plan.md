# 작업 계획 (10/10 밤 ~ 10/13 제출)

기준 문서: `docs/screen-spec.md` (화면 S0~S6, 기능 F-01~F-13)
코드 규칙: `app/AGENTS.md`
마감: 10/13 21:00 부스 제출 (제출 후 URL 변경 불가)

## 지금 상태 (10/10 22:00)

| 있음 | 없음 |
| --- | --- |
| `api/generate.ts` (Gemini 호출, 400/429/502 처리) | 화면 전체 (S0~S6) |
| `src/lib/evidence.ts` (F-04 검사), `src/lib/streak.ts` (F-07 계산) | 저장(F-01), 규칙 만들기(F-02), 실행(F-03), 기록(F-06) |
| `scripts/` 테스트 2개 (통과) | 예시 데이터, 오류 코드(`code`), 배포 |

## 진행 순서 (디자인 먼저)

Stitch로 디자인을 확정한 뒤 구현한다. 디자인 자료는 `design/`에 화면 ID로 이름을 붙여 둔다 (예: `S3-run-result.png`).

1. 기준 문서와 코드 정리 (완료)
2. Stitch에서 P0 화면 디자인: S3 실행·결과부터, 이어서 S0, S1, S2
3. 디자인 시스템 확정: 색, 간격, 버튼, 입력창, 상태 라벨
4. 나머지 화면 디자인: S4, S5 카드와 S6 패널 (실행 기록 상세 S6-4는 P2라 제외)
5. 디자인 자료를 `design/`에 저장 (이미지 + 가능하면 내보낸 코드)
6. 기존 코드 분석: 재사용할 것(`evidence.ts`, `streak.ts`, `api/generate.ts`)과 수정 범위 파악
7. 공통 UI 구현: 레이아웃, 버튼, 카드, 입력창
8. 화면별 구현과 기능 연결 (P0부터, 화면 하나씩)
9. 브라우저에서 시안과 대조해 수정
10. 최종 검증과 배포: 정의서 9절, `pnpm build`, Vercel (PC 브라우저 기준, 모바일 제외)

디자인과 무관한 기반 코드(블록 1: `types/task.ts`, `storage.ts`, `api.ts`, `sampleTasks.ts`)는 디자인 작업과 나란히 먼저 만든다.

## 도구 나눠 쓰기

| 도구 | 맡는 일 |
| --- | --- |
| Claude Code (회사 계정, 규정 확인 후) | 화면 단위 큰 작업. 한 번에 화면 하나 |
| Cursor (여기) | 기반 코드, 정의서 대조 검수, 테스트, 작은 수정, 배포 |

- 블록 하나가 끝날 때마다 커밋한다. 한도가 차면 다른 도구에서 마지막 커밋부터 이어간다.
- Claude Code에 맡길 때는 아래 "시킬 말"을 그대로 붙여 넣는다.

## 일정

### 10/10 (오늘 밤)

| 블록 | 할 것 | 도구 | 끝난 기준 |
| --- | --- | --- | --- |
| 0 | 회사 규정 확인, 지금 파일 커밋 | 직접 | 커밋 1개 |
| 1 | 기반: `types/task.ts`, `lib/storage.ts`(F-01), `api/generate.ts`에 `json`·`code` 추가, `lib/api.ts`, `data/sampleTasks.ts`(예시 일 4개 + 체험용 일) | Cursor | `pnpm build` 통과, 키 없이 예시 결과가 나옴 |
| 2 | S0 첫 방문 안내, S1 내 일 목록 | Claude Code | 첫 방문에 S0, 이후 S1. 체험용 일 카드에 [예시] |

### 10/11

| 블록 | 할 것 | 도구 | 끝난 기준 |
| --- | --- | --- | --- |
| 3 | S2 일 등록 + F-02 규칙 만들기 | Claude Code | 질문 4개 → 규칙 5~8개 확인 → 저장 |
| 4 | S3 실행·결과 + F-03, F-04, F-06 | Claude Code | 재료 → 줄마다 상태 표시 → 고치기 → [복사하고 끝내기] → 기록 남음 |
| 5 | 검수: 정의서 9절 표 대조, 테스트 재실행, 문구 점검 | Cursor | 9절 P0 항목 통과 |
| 6 | Gemini 키 넣고 AI 번호 정확도 10개 확인 | Cursor | 7/10 미만이면 "짚은 곳 ①" 표시 제거 |
| 7 | 배포 (GitHub + Vercel, Root `app`, 환경 변수) | Cursor + 직접 | 배포 주소에서 실제 결과가 나옴 |
| 8 | P1: S4 규칙 추가 확인(F-05), S5 맡겨볼 만한 때(F-07, F-08) | Claude Code | 체험용 일 3회차에서 S5까지 이어짐 |

### 10/12

| 블록 | 할 것 | 도구 | 끝난 기준 |
| --- | --- | --- | --- |
| 9 | S6 규칙 목록, 남으면 F-13 확인 생략 | Claude Code | |
| 10 | 사용성 테스트 질문지·과제 준비 | Cursor | 과제 3개, 관찰 항목, 질문 |
| 11 | 사용성 테스트 5명 | 직접 | 확인 시간, 표시된 곳만 봤는지, 맡길 의향 기록 |
| 12 | 테스트에서 나온 문제 수정 | Cursor | |

### 10/13

| 블록 | 할 것 | 도구 | 끝난 기준 |
| --- | --- | --- | --- |
| 13 | 배포 점검: 키 노출, 한도 초과 분류, PC 브라우저 끝까지 | Cursor | 정의서 9절 "배포 호출" 통과 |
| 14 | 18:00 기능 동결. PRD 회고 초안, 제출 문구 | Cursor + 직접 | |
| 15 | 21:00 전 제출 | 직접 | |

## 밀릴 때 줄이는 순서

1. F-13 확인 생략
2. F-08 지시문 설정 안내 (복사만 남김)
3. S6 규칙 목록 (S3에서 규칙만 보여줌)
4. S5는 체험용 일로만 시연

P0(블록 1~5, 7)는 줄이지 않는다.

## 직접 해야 하는 것

| 할 것 | 언제까지 | 비고 |
| --- | --- | --- |
| 회사 Claude 개인 프로젝트 사용 가능 여부 | 10/10 밤 | 애매하면 Cursor로 진행 |
| `app/.env.local`에 `GEMINI_API_KEY=...` | 10/11 오후 (블록 6 전) | 채팅에 붙여 넣지 않음. 결제 정보 연결 안 함 |
| 빈 GitHub 저장소 | 10/11 저녁 (블록 7 전) | |
| Vercel 가입, 저장소 연결 | 10/11 저녁 | Root Directory `app`, 환경 변수 `GEMINI_API_KEY` |
| 사용성 테스트 5명 섭외 | 10/12 오후 | |

## Claude Code에 시킬 말

블록 2

```
app/AGENTS.md와 docs/screen-spec.md를 읽어줘.
S0 첫 방문 안내와 S1 내 일 목록을 만들어줘. 저장은 src/lib/storage.ts, 예시 데이터는 src/data/sampleTasks.ts를 써.
화면 문구는 정의서 표 그대로 쓰고, 정확성을 보장하는 표현은 쓰지 마.
끝나면 pnpm build가 통과하는지 확인해줘.
```

블록 3

```
app/AGENTS.md와 docs/screen-spec.md의 S2, F-02를 읽고 일 등록 화면을 만들어줘.
AI 호출은 src/lib/api.ts를 쓰고, 실패하면 F-02의 대안대로 처리해줘. 끝나면 pnpm build.
```

블록 4

```
app/AGENTS.md와 docs/screen-spec.md의 S3, F-03, F-04, F-06을 읽고 실행·결과 화면을 만들어줘.
줄 상태 판정은 src/lib/evidence.ts의 checkLine을 그대로 써. 새로 만들지 마.
회색 표시는 "짚은 곳 ①", 주황은 "재료에 없음: {값}"과 "근거 확인 필요"야.
[복사하고 끝내기]는 F-06 순서(복사 → 기록 확정 → S4 또는 F-07)대로, 기록에는 edited, passState, elapsedSeconds, copied를 남겨.
끝나면 pnpm build와 node --experimental-strip-types scripts/overlap-test.ts를 돌려줘.
```

블록 8

```
app/AGENTS.md와 docs/screen-spec.md의 S4, S5, F-05, F-07, F-08을 읽고 만들어줘.
연속 계산은 src/lib/streak.ts의 countStreak를 그대로 써. S5 문구에 "안 고친 기록이 쌓였다는 뜻이지, 결과가 정확하다는 뜻은 아니에요"를 꼭 넣어.
끝나면 pnpm build와 node --experimental-strip-types scripts/streak-test.ts.
```
