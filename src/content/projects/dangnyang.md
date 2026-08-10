---
slug: "dangnyang"
order: 3
live: false
spark: false
meta: "2026.03 · 7~8인 · 데이터"
kind: "반려동물 동반시설 검색 서비스"
summary: "데이터 담당으로 사용자 행동을 5단 퍼널로 정의하고, 그 지표를 산출하는 SQL과 대시보드를 직접 만들었습니다."
result: "어디서 이탈하는지 보이는 측정 체계 구축"
resultNote: ""
caveat: "측정 체계 구현 · 운영 실측치 아님"
name: "댕냥여지도"
links: []
linksNote: "비공개 레포 · 요청 시 코드·대시보드 시연"
tags: ["웹사이트 개발","데이터","데이터 분석","Frontend","PM","팀프로젝트"]
---
# 댕냥여지도 — 반려동물 동반시설 검색 + 행동 분석

> **"어디서 왜 이탈하는지"를 데이터로 보이게 — 결정 가능한 측정 체계를 직접 설계·구현한 데이터 담당**
> `서브리드 · 데이터 · 주개발` · `7~8인팀` · `2026.03` · 멋사 PM 실무 부트캠프 산출물

## 🎯 문제

반려동물 동반 시설을 찾을 때 ① 검색→상세 진입에서 이탈이 크고(전환 병목), ② 동반 조건이 상단에 드러나지 않아 같은 시설을 반복 조회하게 된다. "어디서, 왜 이탈하는가"를 감이 아니라 데이터로 보이게 만드는 것이 과제였다.

## 🛠 핵심 구현

### 데이터 분석 (백엔드)
- **퍼널 분석 SQL 직접 구현** — P1(search→detail)·P2(detail→check_condition)·P3(check_condition→intent) 전환율 + Repeat·Intent·LCP·LSI 등 (`analytics_queries_minimal_final.sql`, MySQL 8)
- **이벤트 분석 스키마 설계** — `event_logs` 중심 스키마 (`schema_event_analytics_minimal.sql`)
- **Streamlit 분석 대시보드** — pandas + Plotly로 퍼널·전환·Repeat·LCP/LSI 시각화 (`streamlit_app.py`)

### 프론트엔드
- React + Vite + TypeScript **모노레포**(apps/web·apps/api, packages/shared)
- 화면: home · main(검색) · detail(+review) · saved(저장)

## 🧱 기술 스택

| 구분 | 기술 |
| --- | --- |
| 데이터 분석 | **Python · Streamlit · pandas · Plotly · MySQL 8(SQL 분석 쿼리)** |
| Frontend | **React · Vite · TypeScript** (모노레포) |
| 데이터 모델 | event_logs 중심 이벤트 스키마 |

## 📐 지표 설계

5단 퍼널(Search→Condition→Detail→Intent→Reuse)을 정의하고 각 단계 전환율(P1~P3), 루프 완성도(LCP), 안정성(LSI)을 수식으로 설계.
**OKR 목표값**: P1≥25% · P2≥50% · P3≥30% · Repeat≤40% · LCP≥0.5 · LSI≥0.3 · 이벤트 수집률≥95%.

> *위 숫자는 팀이 정한 **목표·설계값**입니다. 이 지표를 산출하는 SQL과 대시보드는 직접 구현했지만, 실제 사용자 트래픽으로 달성한 수치는 아닙니다. 측정 체계를 만든 것까지가 제 결과입니다.*

## 👥 역할 구분

7~8인 팀에서 **무엇을 잴지 정하고, 그것을 잴 수 있게 만드는 일**을 맡았다.

| 영역 | 내가 맡은 것 | 팀 |
| --- | --- | --- |
| 지표 정의 | 사용자 행동을 5단 퍼널로 정의, P1~P3·LCP·LSI 수식 설계 (PDD·결정로그 저자) | 기획 논의는 7~8인 공동 |
| **측정 구현** | **event 스키마 · SQL 퍼널 쿼리 · Streamlit 대시보드**를 직접 구현 | 분석 담당 1인과 공동 |
| 프론트 | React·Vite·TS 모노레포 화면 구현 주도 | 프론트 1인과 공동 |
| 서비스 기획·디자인 | — | 팀원 분담 |

> *지표를 정의한 사람이 그 지표를 뽑는 코드까지 만들었다. 다만 아래 수치는 목표·설계값이며 운영 실측이 아니다.*

## 💡 배운 점

데이터로 의사결정을 하려면 "지표를 정의"하는 것만으로는 부족하고, **그 지표가 실제로 산출되도록 로깅 스키마부터 쿼리·대시보드까지 구현**되어야 한다는 것을 직접 만들며 체감했다. 설계와 구현을 모두 해본 것이 이 프로젝트의 핵심 자산이다.