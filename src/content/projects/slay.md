---
slug: "slay"
order: 4
live: false
spark: false
meta: "2025.02–06 · 캡스톤 · 4인 · 팀장"
kind: "AI가 일정을 검수해주는 여행 플랫폼"
summary: "일정을 짜놓고도 가서 보면 틀어지는 문제를 AI 검수로 풀었습니다. 날씨·영업시간·동선 세 가지를 점검해 문제를 알리고 대안을 제시합니다. 4인 캡스톤 팀장."
result: "서비스 배포 · 시연영상 공개"
resultNote: ""
caveat: ""
name: "SLAY"
links: [{"label":"GitHub","url":"https://github.com/reallies/SLAY"},{"label":"시연영상","url":"https://youtu.be/KaoIwXgxQhs"}]
linksNote: ""
tags: ["웹사이트 개발","UI/UX","DB","Node","AI","기획","팀프로젝트"]
---


## 문제

일정은 짜놓고 가는데 가서 보면 자꾸 틀어진다. 야외 일정을 잡은 날 비가 오고, 도착하니 브레이크타임이고, 하루 동선이 앞뒤로 왔다 갔다 한다.

여행 앱은 대부분 **일정을 만들어주는 것까지**만 하고, 그 일정이 실제로 말이 되는지는 봐주지 않는다. 그래서 방향을 **일정은 사람이 짜고, 짠 일정을 AI가 검수하는 서비스**로 잡았다.

## 조사·기획

트리플 등 비슷한 여행 서비스를 직접 써 보고 개선 아이디어를 냈다. 트리플이 웹에서 서비스하지 않는 점을 확인하고, 그 경험을 웹에서 제공할 방법을 모색해 기획·개발했다.

2025년 3월 초에는 **기능 구현 방향 조사·검토**를 맡았다. 일정 공유 방식을 여섯 가지 안으로 나누고 각각의 장단점을 비교했다.

그중 2안인 **이메일·계정 초대 + 실시간 협업 코드** 방식을 골랐다. 데이터 스키마와 동작 흐름, 화면 구성까지 정리했다.

프로젝트 제안서 초안과 AI 챗봇 구상도 맡았다. 개발 계획을 짜는 일은 팀원이 담당했다.

팀은 디자인 1명, 프론트엔드 1명, 백엔드 2명으로 구성됐다. 백엔드 2명 중 한 명으로 개발에 참여했다.

## 내린 결정

핵심 제품 방향은 **공동으로 일정을 만들고, 완성된 일정을 세 가지 축으로 점검하는 것**이었다. 내가 무엇을 어떤 기준으로 검수할지 정리해 날씨·영업시간·동선으로 축을 나눴다.

| 점검 축 | 무엇을 보는가 | 어떻게 알려주는가 |
| --- | --- | --- |
| **날씨** | 기상청·OpenWeather 예보와 방문 지역·날짜를 대조 | 날씨가 나쁜 날의 야외 활동에 주의 표시 |
| **영업시간** | Google Places의 영업시간과 방문 예정 시각을 대조 | 브레이크타임·영업 종료와 겹치면 경고 |
| **동선** | 하루 이동 경로의 낭비 구간 | 추천 경로를 제시하고 **반영하기 버튼**으로 일정에 바로 적용 |

일정 공동 편집에서는 동행을 초대해 같은 일정을 여러 명이 함께 짜도록 했다. 장소와 일자를 드래그앤드롭으로 재정렬하고 시간을 배정하는 흐름을 사용했다.

실제 구현은 축별로 나눴다.

## 직접 만든 것

### 공동 편집·협업 기능

- **친구·동행 초대**: 친구 요청·수락 뒤 여행 동행으로 초대해 같은 일정을 편집하게 했다.
- **경비 입력·1/N 자동 정산**: `/expense/create`·`/settle`과 SettleUpModal을 구현했다.
- **AI 챗봇**: OpenAI를 연동해 여행지·장소 질의응답과 세션 유지를 구현했다.
- **준비물 체크리스트**: 협업 도메인 기능으로 설계부터 구현까지 맡았다.

### AI 검수

**동선 판정**은 하루 일정의 이동 경로를 확인해 낭비 구간을 찾고 추천 경로를 제시하도록 구현했다. 사용자는 반영하기 버튼으로 추천안을 일정에 적용할 수 있다.

**영업시간 판정**은 방문 예정 시각을 요일별 영업시간과 대조하는 로직을 구현했다. Google Places 호출과 영업시간 데이터 파싱은 팀원이 맡았다.

날씨 검수의 예보 수집과 판정은 모두 팀원이 구현했다.

### 운영·배포

AWS와 Nginx로 서비스를 배포하고 프록시 장애에 대응했다. 레포 개설과 기능 분담, 배포 일정 관리도 맡았다.

### 기술 스택

| 구분 | 기술 |
| --- | --- |
| Frontend | React · react-router · @hello-pangea/dnd |
| Backend | Node.js/Express · Prisma ORM · Swagger |
| DB | **PostgreSQL** (13개 도메인 모델 · enum 9종) |
| 인증 | JWT + OAuth2.0 (Google/Naver/Kakao) |
| 외부 API | OpenAI · **Kakao Map**(지도·로드뷰) · **Google Places**(영업시간) · OpenWeather · 기상청 |
| 배포 | **AWS + Nginx** (모노레포 / npm workspaces) |

전체 구조는 React 프론트와 Node.js 백엔드, Prisma와 PostgreSQL로 구성했다. 외부 API 6종을 서비스 기능에 연결했다.


<figure class="cfig pfig"><p class="gsrc">시연영상 화면</p><div class="gal"><div class="gtrack" tabindex="0" aria-label="화면 — 옆으로 넘겨 보기"><figure class="gitem"><img src="/img/slay-10.jpg" width="1280" height="560" alt="AI 검수 · 일정 피드백" loading="eager" decoding="async"><figcaption>AI 검수 · 일정 피드백</figcaption></figure><figure class="gitem"><img src="/img/slay-8.jpg" width="1280" height="560" alt="일정 공동 편집 · 드래그앤드롭 재정렬" loading="lazy" decoding="async"><figcaption>일정 공동 편집 · 드래그앤드롭 재정렬</figcaption></figure><figure class="gitem"><img src="/img/slay-14.jpg" width="1280" height="720" alt="경비 · 1/N 정산" loading="lazy" decoding="async"><figcaption>경비 · 1/N 정산</figcaption></figure></div><div class="gnav"><button type="button" data-dir="-1" aria-label="이전 화면">←</button><span class="gcount mono"><b>1</b> / 3</span><button type="button" data-dir="1" aria-label="다음 화면">→</button></div></div></figure>

## 결과

13개 도메인 모델과 외부 API 6종을 통합한 **배포 가능한 서비스**를 만들고 시연영상을 공개했다.

AI 검수는 사람이 만든 일정에 날씨·영업시간·동선 정보를 대조하는 구조였다.

## 역할 구분

| 영역 | 내가 맡은 것 | 팀 |
| --- | --- | --- |
| 방향·팀 운영 | 검수 방향과 점검 축 정의 · 레포 개설 · 기능 분담 · 배포 일정 | 아이디어는 4인 공동 |
| 조사·기획 | 일정 공유 방식 6안 비교 · 2안 선정 · 데이터 스키마·동작 흐름·화면 구성 정의 · 제안서 초안 · 챗봇 구상 | 개발 계획은 팀원 담당 |
| **협업 도메인 구현** | **친구·동행 초대, 경비 1/N 정산, 챗봇, 준비물 체크리스트** 네 가지를 설계부터 구현까지 (코드 81~100%) | — |
| AI 검수 구현 | **동선 판정 · 영업시간 판정 로직 구현** | 날씨 예보 수집·판정, Google Places 호출·파싱 |
| 운영·배포 | AWS·Nginx 배포와 프록시 장애 대응 | — |
| 추천·지도·리뷰 | — | 팀원 분담 |