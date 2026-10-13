---
slug: "genova"
order: 2
live: false
spark: false
meta: "2026.06 ~ 07 · 샤이닝라이언 인턴십 · 6인 · PM"
kind: "방송 기획안을 스토리보드로 바꾸는 사내 AI 도구"
summary: "PM으로 범위와 일정을 관리했습니다. 킥오프의 '올인원 플랫폼' 요구를 5주 안에 만들 수 있는 크기로 잘라내고, PRD를 버전 체인으로 관리해 결정 이력을 남겼습니다."
result: "5주 만에 MVP 배포 · 제출물 6종 41p 인계"
resultNote: ""
caveat: "PM 2인 중 1인"
name: "GeNova"
links: [{"label":"시연 영상","url":"https://youtu.be/6WcfOkXJVM0"}]
linksNote: "사내 프로젝트 · 산출물은 요청 시 공유"
tags: ["PM","AI","팀프로젝트","기업실무"]
---


## 문제

방송·영상 제작에서 기획(텍스트)과 영상 생성 AI 사이에 사람이 매번 손으로 채우는 구간이 있다. 콘티를 구성하고 컷마다 영문 프롬프트를 쓰는 일이다.

캐릭터·배경 일관성이 생성 모델의 한계로 무너지는 것이 현장의 가장 큰 불편이었다.



<figure class="cfig pfig"><div class="cflow"><div class="fbox"><b>기획(텍스트)</b></div><span class="farr" aria-hidden="true"><i>→</i></span><div class="fbox hi"><b>GeNova</b><span>3×3 그리드 스토리보드 1장</span><span>통합 영문 프롬프트</span></div><span class="farr" aria-hidden="true"><i>→</i></span><div class="fbox"><b>영상 AI</b></div><span class="farr" aria-hidden="true"><i>→</i></span><div class="fbox"><b>편집·음악·자막</b></div></div></figure>

## 조사·기획

클라이언트와 함께 필요한 기능과 범위를 정리하고 아이디어를 냈다. PM 2명 중 1명으로 PRD를 작성하고, 개발 범위와 다음 단계로 넘길 항목을 구분했다.

프로젝트 조건은 6명·5주·1인 주 15시간이었다. 킥오프에서는 여러 기능을 하나로 묶는 올인원 플랫폼 요구가 있었고, 기간 안에서 어떤 기능까지 구현할지 먼저 정리해야 했다.

## 내린 결정

- **범위를 잘랐다**\
  여러 기능을 하나로 묶으면 코드 규모가 커지고 기간 내 완주가 어렵다고 판단했다. 스토리보드와 캔버스를 독립 제품으로 다시 나눠 범위에서 제외했다. 디자인 시스템은 전 팀 공통으로 통일해 이후 통합 가능성은 남겼다.
- **배치안을 다시 좁혔다**\
  캔버스 배치안 투표에서는 4번 안이 가독성 때문에 가장 많은 표를 받았고, 이후 컷별 프롬프트 저장과 내보내기 위치까지 논의가 번졌다. 다른 PM이 MVP인데 너무 완벽하게 하려다 문제가 계속 생긴다고 지적했고, 그 지적을 받아 1번 안으로 가고 2–4번은 향후 방향으로 보여 주자고 제안했다. 1번 안으로 확정됐고 2–4번은 향후 방향 제시용으로 남았다.
- **발표 6일 전 산출 구조 변경을 반영했다**\
  클라이언트가 이미지 9장을 병렬 생성해 합성하던 방식을 바꿔 달라고 요청했다. 비용 문제로 3×3 그리드 이미지 1장을 한 번에 생성하는 구조로 바꾸는 요청이었다.
- **수정 범위부터 산정했다**\
  요청을 바로 코드에 반영하지 않고 바뀌는 영역과 우선순위를 정했다. 계획하던 이미지 품질 개선 테스트는 포기했다. 개발자 3명에게 각자 맡은 파트를 기준으로 바뀌는 점을 나눠 확인했다. QA → 수정 사항 QA → 전체 QA → 시연 순서로 반복하며 발견한 버그를 전달했다.
- **못 고친 문제는 원인을 남겼다**\
  컷 간 일관성과 병렬 생성 문제는 기간 안에 해결하지 못했다. 원인을 코드 수준으로 확인해 로드맵과 예상 질문 답변에 정리했다.


<figure class="cfig pfig"><div class="cscope"><div class="sc"><b>처음 구조</b><span>이미지 9장을 합치는 구조</span></div><div class="sc out"><b>바꾼 구조</b><span>3×3 그리드 이미지 1장을 만드는 구조</span></div><div class="sc cut"><b>발표 전 제외</b><span>컷을 하나씩 생성하는 방식 · 로그인 · 라이브 시연</span></div></div><ol class="ctl" style="grid-template-columns:repeat(4, minmax(0, 1fr));--n:4"><li class=""><b>킥오프</b><i class="ctd">06.23</i></li><li class=""><b>일정 재계획</b><i class="ctd">발표 직전 주</i><span>9장 합성에서</span><span>3×3 그리드 1장으로</span></li><li class=" end"><b>MVP 배포</b><i class="ctd">07.29</i><span>사내 발표</span></li><li class=""><b>인계</b><i class="ctd">08.03</i><span>제출물 6종</span><span>참여 종료</span></li></ol></figure>

## 문서 거버넌스

- **PRD v0.4 → v2.0 버전 체인**: 버전마다 무엇이 왜 바뀌었는지 남겼다. 백엔드 스택 변경 반영 누락과 실제 코드에 없는 모델명도 정정 이력에 기록했다.
- **운영 리듬**: 데일리 회의록에 결정과 커밋·이슈를 맞춰 기록했다. 수정요구사항 핸드오프 문서를 거쳐 개발 전달 체계를 유지했다. 회의록은 28건이다.
- **인계**: 클라이언트 요청에 맞춰 제출 범위를 먼저 확정했다. 문서 6종을 작성하고 미해결 항목을 '인계 시점 조치'와 '재배포 시점 과제'로 나눴다.

## 제품 (팀 산출물)

| 구분 | 내용 |
| --- | --- |
| 기능 | 시나리오 입력(기본/고급) · 3×3 그리드 생성 · 통합 영문 프롬프트(3,000자 제약 검증) · 캔버스 · PDF·이미지 내보내기 · 인증 |

### 기술 스택

| 구분 | 기술 |
| --- | --- |
| Frontend | Next.js |
| Backend | FastAPI |
| AI | Claude · GPT Image · Gemini |
| DB | Supabase |
| 배포 | AWS EC2 · Vercel |


<figure class="cfig pfig"><p class="gsrc">시연 영상 화면</p><div class="gal"><div class="gtrack" tabindex="0" aria-label="화면 — 옆으로 넘겨 보기"><figure class="gitem"><img src="/img/genova-5.jpg" width="1600" height="827" alt="3×3 그리드 스토리보드와 통합 영문 프롬프트" loading="eager" decoding="async"><figcaption>3×3 그리드 스토리보드와 통합 영문 프롬프트</figcaption></figure><figure class="gitem"><img src="/img/genova-12.jpg" width="1600" height="827" alt="캔버스" loading="lazy" decoding="async"><figcaption>캔버스</figcaption></figure></div><div class="gnav"><button type="button" data-dir="-1" aria-label="이전 화면">←</button><span class="gcount mono"><b>1</b> / 2</span><button type="button" data-dir="1" aria-label="다음 화면">→</button></div></div></figure>

## 결과

- **데모 완주형 MVP 배포 완료**: 시나리오 입력 → 생성 → 내보내기까지 무중단 통과
- 원 요청 8개 항목 전부 대응 또는 명시적 범위 제외 처리
- 사내 최종 발표(2026-07-29), **제출물 6종 41p + 인수인계 문서** 인계
- 발표 6일 전 요청된 3×3 그리드 단일 이미지 생성 구조를 반영했고, 발표 때 의도한 대로 동작했다

## 역할 구분

| 항목 | 내가 직접 | 팀 |
| --- | --- | --- |
| 조사·기획 | 클라이언트와 기능·범위 정리 · 아이디어 제안 | PM 1인 공동 |
| 기획·스코프·PRD | **범위 결정, PRD v0.4→v2.0 관리, 정정 이력** | PM 1인 공동 |
| 의사결정·운영 | **회의록 28건 기반 결정 로그, 수정요구사항 핸드오프** | PM 1인 공동 |
| 변경 대응 | 수정 범위 산정 · 우선순위 조정 · 파트별 변경사항 정리 · 반복 QA | 개발자 3인 구현 |
| 발표·인계 | **발표 전략·대본·리허설, 제출물 6종 41p** | 디자인 1인 |
| 개발 | — | 프론트 2인 · 백엔드 1인 |

## 배운 점

킥오프에서 올인원 요구를 줄이고, 생성 구조 변경 요청에서도 바뀌는 영역과 우선순위를 먼저 정해 일부 테스트를 포기했다. **시간이 없을수록 PM이 할 일은 자를 것을 정하는 것**이었다.