# 배포 안내 (Vercel)

앱은 `app/` 폴더 하나가 전부다(화면 + 서버 함수 `api/generate.ts`). 저장소 맨 위가 아니라 `app/`을 프로젝트 루트로 잡아야 한다.

## 1. 한 번만 하는 설정

1. [vercel.com](https://vercel.com)에 GitHub 계정으로 로그인한다.
2. **Add New → Project**에서 저장소 `Kim-kyung-hoon12182/1`을 고른다.
3. 설정 화면에서 아래만 바꾼다. 나머지는 Vercel이 자동으로 채운다(Vite).

| 항목 | 값 |
| --- | --- |
| Project Name | `ttosikyeotne` (주소가 `ttosikyeotne.vercel.app`이 된다. 이미 쓰는 이름이면 다른 이름) |
| Root Directory | `app` |
| Framework Preset | Vite (자동) |
| Build Command | 기본값(`pnpm build`) |
| Output Directory | 기본값(`dist`) |

4. **Environment Variables**에 아래를 넣는다. 이름 앞에 `VITE_`를 붙이면 브라우저에 노출되니 붙이지 않는다.

| Name | Value | 적용 환경 |
| --- | --- | --- |
| `GEMINI_API_KEY` | 저장소 맨 위 `.env`에 있는 값(채팅·문서·커밋에 적지 않는다) | Production, Preview, Development 모두 |

5. **Deploy**를 누른다.

## 2. 배포 뒤 확인 (순서대로)

| 확인 | 방법 | 기대 결과 |
| --- | --- | --- |
| 화면이 뜬다 | 배포 주소 열기 | 첫 방문 창에 로고와 슬로건 |
| 서버 함수가 있다 | `curl -i -X POST https://<주소>/api/generate -H 'Content-Type: application/json' -d '{"prompt":""}'` | `400`과 `내용을 입력해 주세요.` (404면 Root Directory 확인) |
| 키가 들어갔다 | 같은 주소에 `-d '{"prompt":"한 문장으로 인사해 주세요."}'` | `200`과 `{"text":"…"}` (`500`과 `no_key`면 환경변수를 넣고 **다시 배포**) |
| 규칙 만들기 | 새 작업 등록 → 질문 답하기 → [규칙 만들기] | 몇 초 뒤 "AI 제안" 규칙 |
| 실행 | 직접 등록한 작업에 자료를 넣고 [실행하기] | 결과와 "참고한 곳" |
| 긴 자료 | 7,000자 안팎 자료로 실행 | 20초쯤 걸려도 결과가 나온다(함수 제한 시간은 60초로 지정함) |
| 새로고침·뒤로가기 | 실행 화면에서 새로고침, 뒤로가기 | 앱 안에 머문다 |

## 3. 알아 둘 것

- **환경변수를 바꾸면 다시 배포해야 반영된다.** Deployments → 최근 배포 → Redeploy.
- **키는 서버 함수에서만 쓴다.** 브라우저로 내려가는 `dist/`에는 키가 없다(빌드 결과를 검색해 확인함).
- **`/api/generate`는 누구나 부를 수 있다.** 주소를 아는 사람이 무료 한도를 쓸 수 있다. 제출·시연 동안은 감수하고, 한도가 자주 차면(`429`) 아래를 고려한다. 지금은 만들지 않았다.
  - 같은 사이트에서 온 요청만 받기(Origin 확인)
  - IP별 호출 횟수 제한
  - Google AI Studio에서 키를 Gemini API 전용으로 제한
- **Gemini 무료 등급의 입력은 Google 서비스 개선에 쓰일 수 있다.** 화면 안내(첫 방문 창, 푸터)에 이미 적혀 있다.
- **모델명은 `api/generate.ts` 맨 위 `MODEL`** 한 곳에 있다(현재 `gemini-3.5-flash-lite`). 503이 잦으면 여기만 바꾼다.
- 함수 제한 시간: Vercel 문서 기준 Fluid compute가 켜진 프로젝트는 Hobby 기본 300초, 이 앱은 `app/vercel.json`에서 60초로 지정했다. 서버 코드는 구글 응답을 30초까지만 기다린다.
- 저장 데이터(작업·기록)는 방문자 브라우저의 localStorage에만 있다. 서버에는 아무것도 저장하지 않는다.

## 4. 로컬에서 같은 모양으로 돌리기

```bash
cd app
pnpm install
pnpm dev        # http://localhost:5173 , /api/generate도 같이 동작
```

키는 저장소 맨 위 `.env`(또는 `app/.env.local`)의 `GEMINI_API_KEY`를 읽는다. `.env`와 `.env.local`은 `.gitignore`에 들어 있어 커밋되지 않는다.
