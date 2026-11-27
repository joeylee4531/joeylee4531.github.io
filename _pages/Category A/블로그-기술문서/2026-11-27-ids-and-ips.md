---
title: "IDS와 IPS는 어떻게 다를까?"
date: "2026-11-27"
description: "네트워크 배치와 탐지 방식, 웹 서버의 오차단 사례를 중심으로 IDS와 IPS를 비교합니다."
compact_header: true
permalink: /ids-and-ips/
---

웹 서버로 향하는 의심스러운 요청을 발견하면 어떻게 대응할까? IDS는 경고를 남겨 운영자가 조사할 수 있게 하고, 인라인 IPS는 정책에 따라 서버에 닿기 전에 트래픽을 차단한다. 4일 동안 두 시스템의 배치와 탐지 방식을 공부하고, 정상 결제 요청이 막혔다는 가상 사례에 적용해 봤다.

## IDS는 경고하고, IPS는 정책에 따라 차단한다

IDS(Intrusion Detection System)는 침입 탐지 시스템이고, IPS(Intrusion Prevention System)는 침입 방지 시스템이다. 둘 다 네트워크 트래픽이나 시스템 활동을 수집해 탐지 기준과 비교한다. 침입 징후를 발견하면 경고와 기록을 남기고, IPS는 차단 정책이 적용된 경우 패킷을 버리는 등의 조치도 할 수 있다.

<style>
.ids-ips-cards { --idps-bg:#f2f6fc; --idps-ink:#191f28; --idps-secondary:#333d4b; --idps-pale:#e4efff; --idps-blue:#174ea6; --idps-border:transparent; }
body.dark-theme .ids-ips-cards { --idps-bg:#1c2636; --idps-ink:#e9eff8; --idps-secondary:#c5d1e2; --idps-pale:#293c58; --idps-blue:#adcfff; --idps-border:#34445c; }
</style>

<div class="ids-ips-cards" role="group" aria-label="네트워크 IDS와 IPS 배치 비교" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr));gap:12px;margin:24px 0;">
  <div style="background:var(--idps-bg);border:1px solid var(--idps-border);color:var(--idps-ink);border-radius:18px;padding:20px;min-width:0;">
    <span style="display:inline-block;background:var(--idps-pale);color:var(--idps-blue);border-radius:999px;padding:4px 10px;font-size:0.85em;font-weight:700;">수동 감시 IDS</span>
    <p style="margin:12px 0 8px;color:var(--idps-ink);font-size:1.1em;font-weight:700;">복사본을 보고 경고해요</p>
    <p style="margin:0 0 6px;color:var(--idps-secondary);">외부 → 스위치 → 웹 서버</p>
    <p style="margin:0;color:var(--idps-blue);font-weight:600;">스위치에서 복제 → IDS가 분석 → 경고</p>
  </div>
  <div style="background:var(--idps-bg);border:1px solid var(--idps-border);color:var(--idps-ink);border-radius:18px;padding:20px;min-width:0;">
    <span style="display:inline-block;background:var(--idps-pale);color:var(--idps-blue);border-radius:999px;padding:4px 10px;font-size:0.85em;font-weight:700;">인라인 IPS</span>
    <p style="margin:12px 0 8px;color:var(--idps-ink);font-size:1.1em;font-weight:700;">원본을 검사하고 차단해요</p>
    <p style="margin:0 0 6px;color:var(--idps-secondary);">외부 → IPS → 웹 서버</p>
    <p style="margin:0;color:var(--idps-blue);font-weight:600;">차단 정책에 해당하면 IPS에서 폐기</p>
  </div>
</div>

수동 감시 배치에서는 스위치가 복사한 트래픽을 IDS에 보낸다. 원본은 IDS를 거치지 않으므로 이 배치의 IDS는 원본 패킷을 직접 버릴 수 없다. 인라인 IPS는 원본 경로 위에서 검사하므로 서버에 도착하기 전에 막을 수 있다.

공부하면서 헷갈렸던 점 · IDS는 왜 원본 요청을 직접 막을 수 없을까? 그림에서는 스위치가 복사본을 만든다고 답했는데, 그게 왜 차단 여부와 연결되는지 바로 설명하지 못했다. 원본은 스위치에서 서버로 가고 복사본만 IDS로 간다. 두 경로를 따로 그려 보니 이 배치에서 IDS가 원본을 직접 버릴 수 없는 이유가 보였다.

## 무엇을 보고 침입을 판단할까?

| 탐지 방식 | 판단 기준 | 장점과 한계 |
| --- | --- | --- |
| 시그니처 기반 | 관찰한 활동이 알려진 공격 특징과 일치하는가? | 일치 근거를 설명하기 쉽지만, 규칙이 포착하지 못하는 새 패턴은 놓칠 수 있다. |
| 이상 탐지 | 접속량이나 접속 시간 등이 평소 활동의 기준에서 벗어나는가? | 알려진 시그니처가 없어도 이상 징후를 찾을 수 있지만, 행사로 접속자가 몰리는 정상 변화에도 경고할 수 있다. |
| 상태 기반 프로토콜 분석 | 현재 통신 상태에서 프로토콜상 예상되는 메시지인가? | 메시지 하나만 봐서는 알기 어려운 순서나 상태의 이상을 찾을 수 있지만, 통신 상태를 추적하는 데 자원이 든다. |

하나의 시스템에서 여러 탐지 방식을 함께 쓸 수 있다. 네트워크 기반과 호스트 기반은 어디에서 무엇을 관찰하는지에 따른 구분이다. 네트워크 기반 시스템은 센서가 볼 수 있는 지점의 통신을 살핀다. 호스트 기반 시스템은 설치된 서버나 PC의 로그, 파일 변경, 프로세스 활동 등을 살핀다. 예를 들어 웹 서버로 향하는 요청을 알려진 패턴과 대조한다면 **네트워크 기반 시스템에서 시그니처 탐지**를 하는 것이다.

공부하면서 헷갈렸던 점 · 평소와 다른 행동과 프로토콜상 예상 밖의 행동은 어떻게 다를까? 처음에는 이상 탐지를 갑자기 수상한 접근이 들어올 때 쓰는 방식으로 설명했다. 평소 접속이 뜸한 시간대에 요청이 꾸준히 늘어나는 것도 이상 탐지가 볼 수 있는 변화다. 상태 기반 프로토콜 분석에서는 메시지를 주고받은 순서가 판단 근거가 된다. 예를 들어 인증이 끝난 뒤에만 허용되는 명령이 인증 전에 들어오면 통신 상태와 맞지 않는 동작으로 볼 수 있다.

호스트 기반을 처음에는 로컬 PC와 연결해서 생각했다. 서버도 호스트이므로 서버 내부에서 일어난 파일 변경이나 프로세스 실행을 직접 살필 수 있다. 네트워크 기반 센서도 외부 요청뿐 아니라 관찰 지점을 지나는 내부 장비 간 통신을 볼 수 있다.

## 어디에 배치하고 어떻게 운영할까?

| 비교 항목 | 수동 감시 IDS | 인라인 IPS |
| --- | --- | --- |
| 활용 사례 | 웹 서버 트래픽을 관찰하며 경고를 수집한다. | 웹 서버 앞에서 정책에 해당하는 공격 트래픽을 차단한다. |
| 성능과 장애 | 센서가 과부하되거나 멈추면 감시에 빈틈이 생길 수 있다. 원본 통신 경로는 센서 밖에 있다. | 검사에 따른 지연이 생길 수 있다. 장애 시 통신이 계속되는지는 구성과 설정에 달려 있다. |
| 오탐과 운영 부담 | 잘못된 경고가 많으면 담당자가 분석에 더 많은 시간을 쓴다. | 오탐에 차단 정책까지 적용되면 정상 사용자의 요청이 막힐 수 있다. 정책 변경 뒤에는 정상 요청과 차단 대상을 모두 확인해야 한다. |

센서 위치는 보호하려는 통신을 기준으로 정한다. 인터넷 입구에 센서를 두더라도 그곳을 지나지 않는 내부 장비 간 통신은 볼 수 없다. 센서가 복호화되지 않은 HTTPS 트래픽만 받는다면 IP 주소나 포트는 확인할 수 있어도 결제 요청 본문은 직접 검사할 수 없다. 요청 내용이나 처리 결과를 확인할 때는 웹 서버 로그처럼 해당 정보를 볼 수 있는 기록을 함께 살펴야 한다.

IDS 경고를 조사할 때는 발생 시각과 일치한 규칙을 확인하고, 서버 로그와 대조해 같은 요청이 반복됐는지 또는 서버에 변화가 있었는지 살핀다. 경고는 관찰한 활동이 탐지 조건에 걸렸다는 기록이다. 대응 여부는 관련 로그와 실제 영향을 확인한 뒤 판단한다.

## 정상 결제 요청이 막혔다면

IPS를 적용한 뒤 정상 사용자의 결제 요청이 막혔다는 신고가 들어왔다고 가정했다. 먼저 신고 시각을 기준으로 IPS 로그에서 출발지와 목적지, 일치한 규칙, 실제로 수행한 동작을 확인한다. 결제 서버 로그도 대조하되, 요청이 서버 앞에서 차단됐다면 서버에 기록이 없을 수 있다.

공부하면서 헷갈렸던 점 · 어떤 요청 기록을 먼저 봐야 할까? 처음에는 요청 기록을 확인한다고만 답했다. 서버 로그는 서버에 도착한 요청을 조사할 때 쓰고, IPS 차단 로그는 요청이 서버에 닿기 전에 막혔는지 확인할 때 쓴다.

정상 요청을 공격으로 판단했다면 **오탐(False Positive)**이고, 실제 공격을 놓쳤다면 **미탐(False Negative)**이다. 오탐이 확인되면 문제가 된 규칙의 조건을 조정한다. 예외가 필요하면 대상과 조건, 기간을 좁히고 조정 후에는 정상 결제 요청이 통과하는지, 기존 차단 대상이 계속 막히는지 확인한다. 규칙을 갱신할 때도 두 가지를 함께 확인해야 한다.

새 서비스의 의심 활동을 파악하는 단계라면 수동 감시 IDS로 경고를 모을 수 있다. 서버 앞에서 차단해야 한다면 인라인 IPS를 쓰고, 정상 요청이 막혔을 때 로그를 확인해 규칙을 조정할 절차도 마련해야 한다.
