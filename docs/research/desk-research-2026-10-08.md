# 데스크 리서치 — 차별점 확인과 공개 통계

작성일: 2026-10-08
목적: (1) 기존 AI 서비스가 이미 "고친 것을 다음에 반영"하는지 확인, (2) 설문(24명, AI 익숙한 표본)을 보완할 공개 통계 확보

---

## 1. 기존 서비스 기능 확인

### ChatGPT 메모리

- 대화하면서 메모리 요약이 자동으로 업데이트되고, 저장된 메모리는 이후 모든 답변에 반영됩니다. 사용자가 직접 수정·삭제할 수도 있습니다. ([OpenAI Help Center](https://help.openai.com/en/articles/8590148-memory-in-chatgpt))
- 2025년 4월부터 지난 대화 기록을 바탕으로 백그라운드에서 메모리를 자동 정리합니다. ([OpenAI](https://openai.com/index/chatgpt-memory-dreaming/))
- 한계: 대화 중 정정한 내용이 저장된 메모리에 반드시 반영되는 것은 아니며, 예전 내용과 새 내용이 함께 남아 다시 예전 답으로 돌아가는 경우가 있습니다. ([MindLock](https://mindlock.io/blog/chatgpt-remembers-wrong-information))

### Claude 메모리

- 대화하면서 주제별로 메모리를 저장하고, 사용자는 주제별 파일을 보고 수정·삭제할 수 있습니다. 한 곳을 고치면 이후 모든 대화에 반영됩니다. ([Claude 블로그](https://claude.com/blog/claudes-memory-works-everywhere-and-you-decide-whats-in-it))
- 프로젝트마다 메모리가 따로 있어, 프로젝트 단위로 맥락이 분리됩니다. ([Claude Help Center](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context))
- Claude Code는 사용자의 정정 내용을 `feedback` 유형으로 따로 기록합니다. ([Claude Code Docs](https://code.claude.com/docs/en/memory))

### 차별점에 미치는 영향

| 기존에 생각한 차별점 | 확인 결과 | 판단 |
| --- | --- | --- |
| 고친 것이 다음 결과에 남는다 | ChatGPT·Claude 모두 대화 내용과 정정을 메모리에 자동 반영 | **약해짐.** 기능 자체는 이미 있음 |
| 설정이 아니라 일에서 시작한다 | 메모리도 사용자가 지시문을 쓰지 않아도 쌓임. 다만 일 단위로 재료·양식을 정리해주지는 않음 | 일부 유효 |

남는 차이는 **"무엇이 반영되는지 보이는가"**입니다. 기존 메모리는 전체 대화에서 AI가 알아서 고르고 정리하기 때문에, 이번 결과에 어떤 기준이 적용됐는지 사용자가 바로 알기 어렵습니다. 이 서비스는 일마다 기준 목록을 보여주고, 사용자가 확인한 것만 다음 결과에 적용하게 할 수 있습니다. 설문에서 "AI 결과를 신뢰하기 어렵다"가 가장 많았다(10명)는 점과 이어지지만, 기준이 보이면 신뢰가 올라가는지는 확인되지 않은 가설입니다.

---

## 2. 공개 통계

### 국내

| 조사 | 대상·시기 | 내용 |
| --- | --- | --- |
| 워크데이·하노버 리서치 ([ZDNet Korea](https://zdnet.co.kr/view/?no=20260311131148)) | 한국 직원, 2026.03 보도 | 31%가 AI 결과물을 수정하거나 명확히 하는 데 매주 1~2시간 사용 |
| 잡코리아 AI 활용력 자가진단 ([잡코리아](https://www.jobkorea.co.kr/recruit/careers/articles/ai-developer-2026)) | 1,000명 (개발자 편), 2026.09 | 91.4%가 AI 결과물을 검토·수정한 뒤 사용 |
| 아이보스 마케터 설문 ([아이보스](https://www.i-boss.co.kr/ab-6141-72578)) | 마케터, 2026.08~09 | 39.6%가 AI 도입 후 검토 시간 증가 경험. 41.6%는 거의 항상 검증 |

### 해외

| 조사 | 대상·시기 | 내용 |
| --- | --- | --- |
| Templafy ([CEO경제신문](https://www.ceoeconomy.com/news/articleView.html?idxno=21173)) | 미국·영국 지식근로자 2,000명, 2026.08 | 95%가 AI 문서를 수정한 뒤 사용. 검토·수정에 주 평균 약 4시간. **수정 이유: 정확성 40%, 일반적·정형화된 표현 34%, 서식 31%** |
| Connext ([Connext](https://connextglobal.com/the-connext-global-2026-ai-oversight-report/)) | 미국 AI 사용자 1,000명, 2026.01 | AI가 틀리는 지점 1위는 **중요한 맥락·세부 내용 누락 42%**. 수정이 필요하면 57%는 직접 하는 것과 시간이 같거나 더 걸림 |
| Zapier ([Zapier](https://zapier.com/blog/ai-workslop/)) | 미국 기업 AI 사용자 1,100명, 2025.11 | 58%가 AI 결과를 고치거나 다시 하는 데 주 3시간 이상 사용 |

### 설문 결과와의 연결

- 설문에서 "결과를 확인하고 수정하는 시간이 많이 들었다"(12명, 50.0%)는 동기 표본만의 결과가 아니라, 국내외 조사에서도 반복해서 나타나는 현상입니다.
- 설문으로 확인하지 못했던 **"무엇을 고치는가"**에 대해 Templafy 조사가 참고가 됩니다. 정확성(40%)만큼 일반적인 표현(34%)과 서식(31%) 수정도 많았습니다. 서식과 표현은 일마다 양식과 기준을 등록해두면 줄일 수 있는 영역이고, 정확성은 이 서비스만으로는 해결하기 어렵습니다.
- Connext 조사에서 가장 많이 꼽힌 "맥락 누락"(42%)은 일을 등록할 때 재료와 맥락을 정해두는 방식과 이어집니다.
- 단, 해외 조사는 국내 상황과 다를 수 있고, 조사마다 질문 방식이 달라 숫자를 직접 비교하지는 않습니다.

---

## 3. 정리 (1차)

1. "AI 결과를 고치는 데 시간이 든다"는 문제는 공개 통계로 뒷받침됩니다.
2. 고치는 내용에는 정확성 문제와 서식·표현·맥락 문제가 섞여 있습니다. 이 서비스는 서식·표현·맥락 쪽을 다룹니다.
3. "고친 것이 다음에 남는다"는 ChatGPT·Claude 메모리에 이미 있어서 차별점으로 내세우기 어렵습니다. 대신 **일 단위로 기준을 보여주고, 사용자가 확인한 기준만 적용한다**는 쪽으로 차별점을 바꾸는 것을 검토합니다.

---

## 4. 2차 리서치 — 단계 구조(등록 → 덜 고치기 → 자동화)의 근거 보강

단계 구조에서 근거가 약했던 고리는 다섯 가지였습니다. 고리별로 공개 자료를 찾았습니다.

### 4-1. "신뢰가 쌓인 뒤에 자동화로 넘어간다" — 근거 보강됨

| 조사 | 대상·시기 | 내용 |
| --- | --- | --- |
| TeamViewer ([보도자료](https://www.teamviewer.com/cs/global/company/press/2026/ai-workplace-autonomy-global-research/), [보고서](https://media.teamviewer.com/is/content/teamviewergmbh/teamviewer/central-image-hub/pdf/en/teamviewer-autonomous-digital-workplace-report-en.pdf)) | 10개국 4,200명, 2026.05 | 75%가 AI를 매일 쓰지만 61%는 AI가 스스로 행동하지 않기를 원함. 더 맡길 준비가 된 35% 중 71%는 **정해진 일**에만 허용. 개입할 수 있다면 자율을 받아들이겠다는 응답 70% |
| Connext ([보도자료](https://www.businesswire.com/news/home/20260218894481/en/Only-17-Say-Workplace-AI-Is-Reliable-Without-Human-Oversight-New-Connext-Global-Survey-Finds)) | 미국 1,000명, 2026.01 | 사람 검토 없이 AI가 믿을 만하다는 응답 17%. 70%는 "AI + 가벼운 검토" 또는 "AI + 전담 검토"가 신뢰의 조건 |
| 노션 조사 ([테크월드](https://www.epnc.co.kr/news/articleView.html?idxno=328100)) | 한국 직장인 | 97.5%가 AI 결과물을 검증·재편집. 도입을 막는 이유로 신뢰성 부족 41.6%, 결과의 일관성 부족 23.7%. "완전한 자동화에는 신중" |

**해석:** 사람들은 처음부터 AI에 맡기기보다, 정해진 일부터, 개입할 수 있는 상태에서 맡기려 합니다. "먼저 결과를 확인하며 쓰고, 믿을 만해진 일만 자동화로 올린다"는 단계 구조와 맞습니다. 노션 조사의 "일관성 부족"(23.7%)은 일마다 기준을 고정하는 방식과 이어집니다.

### 4-2. "적용된 기준·근거가 보이면 신뢰가 올라간다" — 일부 보강, 주의점 있음

| 연구 | 내용 |
| --- | --- |
| RAG 응답 신뢰 사용자 연구 ([arXiv 2601.14460](https://arxiv.org/pdf/2601.14460)) | 설명을 보여줬을 때 더 믿을 만한 응답을 고른 비율이 165/300, 보여주지 않았을 때 84/300. 출처 표시는 사실·기술적 질문에서 효과가 컸음 |
| LLM 추론 근거와 신뢰 실험 ([arXiv 2603.07306](https://arxiv.org/pdf/2603.07306)) | 맞는 근거는 신뢰를 높였지만, 틀린 근거나 불확실한 표현은 신뢰를 낮춤. 사용자는 근거를 "결과를 점검하는 데" 씀 |

**해석:** 근거를 보여주면 사용자가 더 정확하게 판단하는 데 도움이 됩니다. 다만 근거 표시가 잘못되면 오히려 잘못 믿게 만들 수 있습니다. "기준·근거 표시"는 확인할 곳을 알려주는 장치로 설명하고, 정확성을 보장한다고 말하지 않아야 합니다.

### 4-3. "지시문을 직접 쓰기 어렵다 / 저장 기능을 잘 안 쓴다" — 근거 보강됨

| 자료 | 내용 |
| --- | --- |
| OpenAI 업무 사용 패턴 ([OpenAI](https://openai.com/business/guides-and-resources/chatgpt-usage-and-adoption-patterns-at-work/)) | 프로젝트, 맞춤 지시 같은 고급 기능은 파워 유저 위주로 쓰이고 대부분은 덜 쓰임. 장벽으로 **기능을 찾기 어려움, 쓸 곳을 모름, 설정 부담**을 꼽음 |
| 인크루트 ([뉴스투데이](https://news2day.co.kr/article/20260514500103)) | 직장인 877명, 2026.04~05. 가장 큰 어려움은 결과 신뢰성 부족 42.4%, 다음이 실무 활용 방법 부족 22.4% |

**해석:** 저장·설정 기능이 있어도 일반 사용자는 잘 쓰지 않는다는 것이 OpenAI 자료로도 확인됩니다. 질문에 답해서 기준을 만드는 방식은 이 설정 부담을 줄이는 쪽입니다.

### 4-4. "자동화 기능은 있는데 설정이 어렵다" — 근거 보강됨

| 자료 | 내용 |
| --- | --- |
| ChatGPT 릴리스 노트 ([OpenAI Help Center](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)) | 예약 작업을 찾고 관리하기 쉽도록 사이드바에 전용 페이지를 새로 만듦 |
| 예약 작업 개편 소개 ([aivancity](https://aivancity.ai/en/blog/openai-transforme-chatgpt-en-veritable-assistant-personnel-avec-les-taches-planifiees/)) | 2025년 초 처음 나온 예약 작업은 대화 안에 흩어져 관리가 불편해 사용이 제한적이었고, 이를 고치려고 개편함 |
| 삼성SDS ([인사이트리포트](https://www.samsungsds.com/kr/insights/enterprise-genai-usage-survey_part2.html)) | 국내 재직자 1,750명, 2026.05. AI 에이전트를 안다는 응답은 10명 중 6명이지만 정확히 이해한 사람은 3명, 실무 활용률 17% |

**해석:** 자동화 기능을 만든 회사도 "찾기 어렵고 관리하기 불편하다"는 문제를 인정하고 고치는 중입니다. 설문에서 자동화를 안 한 이유가 설정 쪽이었던 12명과 같은 흐름입니다.

### 4-5. 비슷한 서비스 — 새로 확인된 것

1차 리서치에서 찾지 못했던, 컨셉이 겹치는 서비스가 있었습니다.

| 서비스 | 하는 일 | 겹치는 부분 |
| --- | --- | --- |
| Freed ([도움말](https://help.getfreed.ai/en/articles/11796456-templates-that-learn)) | 의료 기록 작성 AI. 사용자가 고친 내용을 분석해 템플릿을 자동 업데이트하고, 버전 기록과 되돌리기 제공. 자동 학습을 끄면 "Learn format" 버튼으로 직접 반영 | **고친 것 반영** (의료 분야 한정) |
| Noumi ([기능 소개](https://noumi.ai/features/self-evolving-skills)) | 반복되는 지시를 "기준 후보"로 표시하고, 사용자가 확인하면 프로젝트 기준으로 저장 | **확인한 것만 기준에 추가** |
| Demi ([작동 방식](https://www.demi.ai/how-it-works)) | Mac 앱. 업무를 관찰하다가 같은 일이 두 번째 반복되면 "이제부터 맡을까요?"라고 제안 | **자동화 제안** (3단계) |
| Promptly ([사이트](https://www.promptly.kr/)) | 국내. 말투·톤·형식을 메모리 카드로 저장해 여러 AI에 적용, 템플릿 라이브러리 | **기준 저장** |
| Okou ([문서](https://www.okou.ai/ko/docs/workflows)) | 반복 절차를 이름 있는 워크플로로 저장해 프롬프트를 다시 쓰지 않게 함 | **일 단위 등록** |
| 노션 AI 에이전트 ([테크월드](https://www.epnc.co.kr/news/articleView.html?idxno=328100)) | 주간 보고서 작성 같은 반복 업무를 AI 에이전트에 맡기는 기능 | **반복 업무 맡기기** |

**해석:** 각 요소(고친 것 반영, 확인 후 기준 추가, 자동화 제안, 일 단위 저장)는 이미 어딘가에 있습니다. 비슷한 서비스가 여러 개 있다는 것은 문제가 실제로 있다는 신호이기도 하지만, "처음 시도하는 기능"으로 설명할 수는 없습니다.

남는 차이는 **조합과 대상**입니다.

- Freed는 의료, Demi는 Mac 앱이고 업무 관찰이 필요, Noumi는 프로젝트 단위의 에이전트 도구입니다.
- 이 서비스는 설치나 연동 없이 웹에서, 일 하나를 질문으로 등록하고, 결과마다 적용 기준을 보여주고, **덜 고치게 된 일만 자동화로 올리는 단계**를 하나의 흐름으로 묶습니다.
- 대상은 GPTs·프로젝트를 직접 설정하지 않는 일반 사용자입니다.

### 4-6. 반대 근거 — 주의할 점

| 자료 | 내용 | 의미 |
| --- | --- | --- |
| BBVA 사례 ([timtis](https://www.timtis.com/blog/how-to-build-a-custom-gpt-for-your-business/)) | 직원들이 GPT 20,000개를 만들었지만 자주 쓰이는 것은 약 4,000개 | **템플릿을 만들어도 대부분 다시 안 쓴다.** 등록만으로는 계속 쓰게 되지 않음 |
| 맞춤 GPT 종료 예정 ([Jotform](https://www.jotform.com/ai/what-is-a-custom-gpt/)) | OpenAI가 기업용 맞춤 GPT를 플러그인으로 옮기며 단계적으로 종료 예정이라는 보도 | 기존 서비스 구조가 계속 바뀜. 비교 대상 설명은 최신 상태로 확인 필요 |

---

## 5. 근거 상태 요약

| 단계 구조의 고리 | 우리 설문 | 공개 자료 | 상태 |
| --- | --- | --- | --- |
| 같은 일을 반복해서 AI에 시킨다 | 22명 | — | 충분 |
| 결과를 고치는 데 시간이 든다 | 12명 | Templafy, 워크데이, 잡코리아, 노션 조사 | 충분 |
| 결과를 믿기 어렵다 | 10명 | 인크루트 42.4%, 노션 조사 41.6% | 충분 |
| 지시문 작성·저장 기능이 부담된다 | 저장 안 함 12명 (이유는 모름) | OpenAI 자료 | 보강됨 |
| 자동화 설정이 어렵다 | 12명 | ChatGPT 예약 작업 개편, 삼성SDS | 보강됨 |
| 신뢰가 쌓인 뒤 자동화한다 | 주관식 1명 | TeamViewer, Connext | 보강됨 |
| 기준·근거가 보이면 신뢰가 오른다 | — | 사용자 연구 2건 | 일부 (잘못 표시하면 역효과) |
| 고친 것이 쌓이면 수정이 줄어든다 | — | Freed가 같은 방식을 서비스로 운영 중 (효과 수치는 없음) | **약함** |
| 등록한 일을 계속 다시 쓴다 | — | BBVA: 20%만 계속 사용 | **반대 근거 있음** |
| 단계를 올리는 기준 (예: 3번 연속 수정 없음) | — | — | **근거 없음, 임의로 정한 기준** |

약한 세 가지는 데스크 리서치로 더 채우기 어렵습니다. 엑스포에서 실제 사용으로 확인하고, 브로슈어에는 가설로 적습니다.

---

## 6. 3차 리서치 — 숫자 원문 확인, VOC, 가설 근거

### 6-1. 원문으로 다시 확인한 것

| 항목 | 확인 결과 | 출처 |
| --- | --- | --- |
| Connext 57% | 고쳐야 할 때 46%는 직접 하는 것과 같은 시간, 11%는 더 걸림. 수정 없이 맞는 경우 37% | [Connext](https://connextglobal.com/the-connext-global-2026-ai-oversight-report/), [Business Wire](https://www.businesswire.com/news/home/20260218894481/en/Only-17-Say-Workplace-AI-Is-Reliable-Without-Human-Oversight-New-Connext-Global-Survey-Finds) |
| ChatGPT 예약 작업 API | 없음. ChatGPT 화면에서만 생성·관리 | [OpenAI 도움말](https://help.openai.com/en/articles/10291617-scheduled-tasks-in-chatgpt), [ChatForest](https://chatforest.com/builders-log/openai-chatgpt-scheduled-tasks-june-2026-api-gap-builder-guide/) |

### 6-2. 새로 찾은 조사

| 조사 | 내용 | 출처 |
| --- | --- | --- |
| TeamViewer (2026.07 발표) | 56%가 자주·항상 확인, 주 평균 2시간. 51%는 언제 믿고 언제 확인할지 항상 알지는 못함 | [PR Newswire](https://www.prnewswire.com/news-releases/teamviewer-study-75-of-employees-use-ai-daily-but-61-want-human-oversight-indicating-a-confidence-gap-limiting-progress-302831545.html) |
| 중앙일보 팩플 (블라인드 5,284명) | 31.6%가 가장 지치는 순간으로 "답변 검증에 시간이 더 걸릴 때" | [잡코리아 인용](https://www.jobkorea.co.kr/recruit/careers/articles/ai-burnout-solution) (원문 기사 확인 필요) |
| Delight AI Index (미국 1,001명) | 47%가 실행 전 승인을 원함, 승인 없이 괜찮다 16% | [Delight AI](https://delight.ai/blog/industry/human-in-the-loop-ai) |
| Microsoft Research (NeurIPS 2024) | 사용자 수정에서 기준을 글로 추출해 다음 생성에 쓰면 수정량 31~73% 감소 (시뮬레이션) | [arXiv 2404.15269](https://arxiv.org/abs/2404.15269) |

### 6-3. VOC

PRD 부록 E에 정리. OpenAI 커뮤니티에서 "매번 지시를 다시 붙인다", "고쳐도 같은 실수가 돌아온다", "저장된 규칙을 적용하지 않는다", "어떤 메모리를 적용할지 보여주고 고르게 해달라"는 글을 확인했습니다. 골라 온 사례라 비율로 해석하지 않습니다.

### 6-4. 근거 상태 변화

| 주장 | 이전 | 지금 |
| --- | --- | --- |
| 고친 것이 쌓이면 수정이 줄어든다 | 약함 | 일부 (B-6, 시뮬레이션) |
| 언제 맡겨야 할지 모른다 | 없음 | 확인됨 (TeamViewer 51%) |
| 고쳐야 하면 시간 이득이 사라진다 | 없음 | 확인됨 (Connext 57%) |
