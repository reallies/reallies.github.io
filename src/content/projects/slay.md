---
slug: "slay"
order: 4
live: false
spark: false
meta: "2025.02–06 · 캡스톤 4인 · 팀장"
kind: "여행 일정 추천·관리·공유 플랫폼"
summary: "4인 캡스톤 팀장으로 여러 앱에 흩어진 여행 준비를 한 서비스로 묶었습니다. 동행 협업·경비 정산·챗봇·체크리스트 도메인을 직접 구현했습니다."
result: "서비스 배포 · 시연영상 공개"
resultNote: ""
caveat: ""
name: "SLAY"
tags: ["웹사이트 개발","UI/UX","DB","Node","AI","기획","팀프로젝트"]
---

# SLAY — AI 여행 일정 추천·관리·공유 플랫폼

> **흩어진 여행 준비를 한 흐름으로 묶기로 설계하고, 핵심 가치를 우선순위로 정해 직접 구현·배포한 4인 캡스톤 팀장**
> `팀장 · 기획 + 풀스택` · `캡스톤 4인팀` · `2025.02–06`

## 🎯 문제

여행 준비에 필요한 추천·일정 편성·지도·경비 정산·기록이 여러 앱에 흩어져 있어 탐색·관리 비용이 크다. 이 모든 흐름을 한 웹앱에서 잇는 것이 목표였다.

## 🛠 핵심 구현 (검증된 것만)

- **AI 챗봇 추천 + 일정 피드백** — OpenAI 연동 여행지·장소 추천(`/search-places`·`/travel-info`·세션 유지), 동선·방향성 점검 피드백
- **드래그앤드롭 일정 편성** — 일자·장소 재정렬·시간 배정 (`@hello-pangea/dnd`)
- **지도·거리뷰·날씨** — Kakao Map + Google Street View + OpenWeather/기상청 통합
- **친구·동행 초대(협업)** — 친구 요청/수락 + 여행 동행 초대 → 공동 일정 편집
- **경비 입력·1/N 자동 정산** — `/expense/create`·`/settle` + SettleUpModal
- **여행 기록 갤러리(소셜)** — 게시글·좋아요·댓글

## 🧱 기술 스택 · 아키텍처

| 구분 | 기술 |
| --- | --- |
| Frontend | React · react-router · @hello-pangea/dnd |
| Backend | Node.js/Express · Prisma ORM · Swagger |
| DB | **PostgreSQL** (13개 도메인 모델 · enum 9종) |
| 인증 | JWT + OAuth2.0 (Google/Naver/Kakao) |
| 외부 API | OpenAI · Kakao Map · Google Street View · OpenWeather · 기상청 (6종) |
| 배포 | **AWS + Nginx** (모노레포 / npm workspaces) |

React(FE) ↔ Nginx → Node.js(+JWT)(BE) ↔ Prisma → PostgreSQL, 외부 API 6종 오케스트레이션.

## 👤 내 기여 vs 팀 (git blame 검증)

| 항목 | 내가 직접 | 팀 |
| --- | --- | --- |
| 커밋 | 62/241 (레포 생성자·첫 커밋) | 4인 공동 |
| **백엔드 4대 도메인** | **친구·동행 협업 81% · 일정/경비/1/N정산 82%(정산 핸들러 100%) · AI 챗봇 99% · 체크리스트 100%** (코드 라인 비율) | — |
| 운영 | **AWS/Nginx 배포 · 프록시 핫픽스 담당** | — |
| (주의) 리뷰·갤러리 | Notion 문서 생성자였으나 코드는 팀원 다수 | gihwan494 등 |

> ⚠️ 무결성: 커밋 수로는 3위지만 **백엔드 4대 도메인은 코드 81~100%를 직접 작성**(git blame). 단 "서비스 전체를 혼자 개발"은 과장(4인 팀, 추천·지도 등은 팀원 분담).

## 📊 결과

13개 도메인 모델·외부 API 6종을 통합한 **배포 가능한 서비스 완성**, 시연영상 공개.

## 🔗 증빙

github.com/reallies/SLAY · [시연영상](https://youtu.be/KaoIwXgxQhs)
