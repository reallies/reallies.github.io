---
slug: "care-hub"
order: 6
live: false
spark: false
meta: "2025.11 ~ 12 · 개인 프로젝트 · 단독 개발"
kind: "IoT 1인 가구 안심 케어 허브"
summary: "라즈베리파이의 센서·버튼·LED 제어부터 MQTT 통신과 웹 대시보드까지 단독으로 구현했습니다."
result: "센서 이벤트를 웹의 환경·활동·경고 화면으로 연결"
resultNote: ""
caveat: "하드웨어·웹 연동 프로토타입"
name: "care-hub"
links: [{"label":"GitHub","url":"https://github.com/reallies/care-hub"},{"label":"시연 영상","url":"https://youtu.be/w6YHWd7dkNI"}]
linksNote: "공개 저장소와 시연 영상입니다. 하드웨어 구성과 실행 방법은 README에서 볼 수 있습니다."
tags: ["IoT","Python","Flask","Raspberry Pi","개인 프로젝트"]
---

## 만든 것과 맡은 범위

실내 온습도·활동 정보와 경고를 웹에서 확인하는 IoT 프로토타입이다. 개인 프로젝트로 센서·GPIO 제어, MQTT 이벤트 송수신, 웹 대시보드를 구현했다.

Raspberry Pi에 온습도·초음파·소리 센서와 카메라, 버튼, LED를 연결했다. 장치에서는 센서 입력과 모드에 따라 LED를 제어하고 사진을 촬영한다.

## 상태에 따라 달라지는 동작

물리 버튼으로 재실(HOME)·외출(AWAY)을 전환한다. 두 모드 모두에서 박수 두 번을 긴급 요청으로 처리하며, 긴급 상태에서는 같은 버튼으로 상황을 해제한다.

| 상황 | 입력과 조건 | 장치와 웹의 반응 |
| --- | --- | --- |
| 재실 | 온습도 측정 | 설정한 기준을 벗어나면 LED 경고. 웹에는 온습도와 추이를 표시 |
| 재실·주간 | 마지막 거리 감지 후 2시간 경과(150cm 미만을 감지로 처리) | 장기 미활동 경고를 MQTT로 전송 |
| 재실·야간 | 움직임 조건 충족 | 노란 LED를 점멸시키고 마지막 감지 후 30초가 지나면 소등 |
| 외출 | 움직임 조건 충족 | 카메라로 5장 연속 촬영 후 전송 |
| 긴급 | 박수 두 번(소리 입력 간격 0.15초 초과·1초 미만) | 긴급 이벤트 전송, 빨강·파랑 LED 교차 점멸. 물리 버튼으로 해제 |

움직임은 초음파 측정 거리가 150cm 미만인지를 기준으로 처리한다. 이 거리나 2시간 기준은 코드에 설정한 동작 조건이며, 낙상 판별이나 위험 예측의 정확도를 검증한 수치는 아니다.

## 센서에서 화면까지 연결한 구조

장치의 Python 코드가 센서값을 읽고 MQTT 브로커로 메시지를 발행한다. 브라우저는 WebSocket으로 브로커에 직접 연결해 환경·활동·카메라·경고의 네 토픽을 구독한다. Flask는 대시보드 HTML을 제공한다.

<figure class="cfig pfig"><div class="cflow"><div class="fbox"><b>Raspberry Pi</b><span>센서 · 버튼 · LED · 카메라</span><span>Python에서 읽고 제어</span></div><span class="farr" aria-hidden="true"><i>→</i></span><div class="fbox"><b>MQTT 브로커</b><span>환경 · 활동 · 카메라 · 경고</span><span>장치가 발행</span></div><span class="farr" aria-hidden="true"><i>→</i></span><div class="fbox hi"><b>웹 대시보드</b><span>브라우저가 WebSocket으로 구독</span><span>Flask는 화면 HTML 제공</span></div></div><figcaption>공개 코드의 연결 구조를 재구성한 도식 · <a href="/img/care-hub-flow.svg">도식 원본 보기</a></figcaption></figure>

센서 제어와 웹 표시를 메시지로 연결해, 웹에서 하드웨어 라이브러리를 직접 실행하지 않도록 구성했다. 장치는 온습도를 10초 간격으로 측정하고, 감지 이벤트와 사진은 해당 토픽으로 전송한다.

## 웹에서 확인하는 정보

- 화면이 연결된 동안 수신한 온습도를 브라우저 저장소에 기록하고, Chart.js로 최근 24시간 범위의 추이를 그린다.
- 마지막 움직임 감지 시각을 표시한다.
- 카메라 메시지를 받으면 최근 사진을 최대 6장까지 표시한다.
- 경고 메시지를 받으면 화면 위 알림을 띄운다.

## 사용 기술

| 구분 | 기술 |
| --- | --- |
| 장치 | Raspberry Pi 4B · HTU21D · HC-SR04 · 소리 센서 · 카메라 · 버튼 · LED |
| 제어 | Python · gpiozero · OpenCV |
| 통신 | paho-mqtt · MQTT · WebSocket |
| 웹 | Flask · JavaScript · Chart.js · localStorage |

## 구현 범위와 검증 과제

공개 저장소에서 확인할 수 있는 알림 경로는 MQTT와 웹 대시보드다. 보호자에게 문자·앱 푸시를 보내는 기능은 이 코드에 포함되지 않는다.

현장 운영 성과나 고독사·낙상 예방 효과를 측정한 결과는 제시하지 않는다. 실제 사용을 위해서는 거리 기반 감지의 오탐·미탐과 통신 단절, 경고·해제 상태의 화면 처리를 추가로 검증해야 한다.