---
title: "OWASP Top 10:2025 — A01 접근 제어 실패(Broken Access Control)"
date: "2026-11-19"
description: "주문·문서·차량 제어 예시로 인증과 인가, IDOR과 BOLA, 2025년판의 변화와 접근 제어 예방 방법을 정리합니다."
compact_header: true
permalink: /owasp-broken-access-control/
---

OWASP는 애플리케이션 보안을 위한 자료와 도구를 공개하는 비영리 재단이다. OWASP Top 10은 웹 애플리케이션에서 주의해야 할 주요 보안 위험을 정리한 문서다. 이 글에서는 2025년판의 접근 제어 실패를 골라 개념과 사례, 예방 방법을 살펴본다. [OWASP 소개](https://owasp.org/) · [OWASP Top 10:2025](https://top10.owasp.org/2025/)

주제는 **OWASP Top 10:2025의 A01 접근 제어 실패(Broken Access Control)**로 골랐다. 쇼핑몰에서 다른 사람의 주문 내역이 보이는 상황을 예로 들면 이해하기 쉬웠다. 공식 A01 문서와 인가 가이드를 바탕으로 기본 개념과 예방 방법을 살펴봤다.

## 인증과 인가는 무엇이 다를까?

설명을 위해 민수의 주문 번호는 101번, 지연의 주문 번호는 102번이라고 가정했다. 이 쇼핑몰의 회원은 자기 주문만 조회할 수 있다.

<div aria-label="주문 번호 예시" style="box-sizing: border-box; width: fit-content; max-width: 100%; margin: 12px 0; padding: 10px 14px; border: 0; border-radius: 12px; background: var(--surface-soft); color: var(--text-primary); font-family: var(--font-sans); font-size: 15px; font-weight: 500; line-height: 1.5; letter-spacing: -0.02em; overflow-wrap: anywhere;">
  <div style="margin: 0; padding: 0;">/orders/101 → 민수의 주문</div>
  <div style="margin: 0; padding: 0;">/orders/102 → 지연의 주문</div>
</div>

민수가 로그인한 뒤 주소의 숫자를 102로 바꿨는데 지연의 주문 내역이 보인다면 문제가 있다. 로그인한 회원이어도 다른 사람의 주문까지 볼 권한은 없기 때문이다.

| 개념 | 확인하는 내용 | 주문 조회 예시 |
| --- | --- | --- |
| 인증(Authentication) | 요청한 사람이 누구인가? | 로그인한 사용자가 민수인지 확인한다. |
| 인가(Authorization) | 이 사람이 해당 작업을 할 권한이 있는가? | 민수가 102번 주문을 조회해도 되는지 확인한다. |

처음에는 인증을 “내가 맞는지 확인하는 것”, 인가를 “권한이 있는지 확인하는 것”으로 이해했다. 주문 사례에 대입하니 서버가 확인할 내용이 구체적으로 보였다. **누가 요청했는지 확인한 뒤에는 그 사람이 요청한 데이터에 접근해도 되는지 판단해야 한다.**

## 공식 문서의 Background에서 읽은 내용

접근 제어 실패는 2025년판에서도 1위를 유지했다. Background는 이 범주에 포함되는 약점 유형과 조사 결과를 소개한다. 여기서 처음 접한 용어가 CWE와 CVE였다.

- **CWE**는 보안 약점의 유형을 분류한 목록이다. CWE-200은 권한 없는 사람에게 민감한 정보가 노출되는 유형을 가리킨다.
- **CVE**는 공개적으로 알려진 개별 보안 취약점을 식별할 때 사용한다.

같은 유형의 문제가 여러 사이트에서 발견될 수 있으므로 약점 유형 수와 발견 건수는 다르다. 공부하면서 “같은 유형의 문제가 사이트 10곳에서 하나씩 발견되면 유형은 1개, 발견은 10건”이라고 정리했다. 조사 통계를 인용할 때는 조사 대상과 집계 기준도 함께 확인해야겠다. [OWASP Background와 Score table](https://top10.owasp.org/2025/A01_2025-Broken_Access_Control/#background)

## 접근 제어 실패는 어떤 문제일까?

접근 제어는 사용자가 허용된 범위 안에서 데이터와 기능을 사용하도록 규칙을 적용하는 것이다. 민수에게는 자기 주문 조회를 허용하고 지연의 주문 조회는 거부하는 식이다.

이 규칙이 제대로 적용되지 않으면 다른 사람의 정보가 노출된다. 배송지를 바꾸거나 데이터를 지우는 피해, 일반 회원이 관리자 기능을 실행하는 문제도 생길 수 있다.

공식 문서에서는 과도한 권한 부여, URL이나 요청 조작을 통한 우회, 다른 사람의 식별자를 이용한 데이터 접근, 권한 검사 누락 등을 소개한다. API는 프로그램이 서버의 데이터나 기능을 요청할 때 사용하는 인터페이스다. API 요청에서도 대상 데이터와 작업에 대한 권한을 검사해야 한다. 주문 조회와 관리자 기능 사례를 중심으로 살펴보면 이해하기 쉽다. [OWASP Description](https://top10.owasp.org/2025/A01_2025-Broken_Access_Control/#description)

## 공식 문서의 공격 사례 세 가지

첫 번째 사례는 **요청의 `acct` 값을 바꿔 다른 계정의 정보를 조회**하는 상황이다. 서버가 대상 계정에 대한 권한을 확인하지 않으면 정보가 노출될 수 있다. 민수가 주문 번호를 바꿔 지연의 주문을 보는 예시와 같은 구조다.

두 번째는 **주소를 직접 입력해 로그인이나 관리자 권한이 필요한 페이지에 접근**하는 경우다. 메뉴에 링크가 없어도 사용자는 주소로 요청할 수 있다.

세 번째는 **브라우저의 JavaScript로만 접근을 제한**하는 경우다. 다른 도구로 서버에 직접 요청하면 화면의 제한을 거치지 않을 수 있다. 예를 들어 일반 회원에게 상품 가격 변경 버튼을 숨겼어도, 서버가 직접 보낸 변경 요청을 허용하면 문제가 남는다. [OWASP 공격 시나리오](https://top10.owasp.org/2025/A01_2025-Broken_Access_Control/#example-attack-scenarios)

## 서버는 무엇을 확인해야 할까?

예방 방법에서 먼저 기억하고 싶은 것은 **최소 권한**, **기본 거부**, **데이터 소유권 확인**이다.

최소 권한은 업무에 필요한 만큼만 권한을 주는 것이다. 배송 담당자에게는 배송에 필요한 정보 조회 권한을 부여하는 식이다. 기본 거부는 허용 조건을 확인한 요청만 허용하는 방식이다. 권한 규칙이 없는 새 기능은 접근을 차단해야 한다.

주문 조회에서는 회원 여부에 더해 해당 주문을 볼 권한이 있는지도 확인해야 한다. 이 검사는 서버에서 수행해야 한다. 문서는 공통 접근 제어 방식의 재사용, 내부 파일 노출 방지, 접근 거부 로그와 알림, 요청 횟수 제한, 세션·토큰 관리, 검증된 도구 활용과 테스트도 권고한다. [OWASP 예방 지침](https://top10.owasp.org/2025/A01_2025-Broken_Access_Control/#how-to-prevent)

## 모든 요청에서 권한을 확인하기

OWASP 인가 가이드의 Validate the Permissions on Every Request는 모든 요청에서 권한을 확인하라는 뜻이다. 요청은 브라우저 등이 서버에 특정 작업을 해달라고 보내는 메시지다.

민수가 자기 주문을 조회하는 데 성공했더라도 다음 요청에서 지연의 주문을 조회하려 하면 다시 권한을 판단해야 한다. 같은 주문을 대상으로 하더라도 조회와 취소는 서로 다른 작업이므로 각 작업의 권한을 확인해야 한다.

| 요청 | 이 예시에서 기대하는 결과 |
| --- | --- |
| 민수가 자기 주문 조회 | 허용 |
| 민수가 지연의 주문 조회 | 거부 |
| 민수가 지연의 주문 취소 | 거부 |

화면의 버튼을 누른 요청과 도구로 직접 보낸 요청 모두 같은 규칙을 적용해야 한다. 개발자가 기능마다 검사를 넣다가 빠뜨리지 않도록 여러 요청에 일관되게 적용되는 검사 방식을 활용하는 것도 필요하다. [OWASP 인가 가이드](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html#validate-the-permissions-on-every-request)

## IDOR은 어떤 문제일까?

민수가 주문 번호를 바꿔 지연의 주문을 보는 사례에는 **IDOR(Insecure Direct Object Reference)**이라는 이름이 있다. 사용자가 식별자를 조작했을 때 권한 없는 데이터에 접근하거나 수정할 수 있는 취약점이다. 접근 제어 실패에 속하는 유형 중 하나다.

이 예시에서 주문 내역은 접근하려는 데이터인 객체(Object), 주문 번호는 그 데이터를 지정하는 식별자(Reference)다. 서버가 민수에게 해당 주문의 조회 권한이 있는지 확인하지 않으면 IDOR이 발생할 수 있다.

| 요소 | 주문 조회 예시 |
| --- | --- |
| 대상 데이터 | 지연의 주문 내역 |
| 식별자 | `/orders/102`의 `102` |
| 빠진 검사 | 민수가 102번 주문을 조회할 권한이 있는지 확인 |

민수가 번호를 바꿔 요청해도 서버가 권한을 확인하고 차단한다면, 그 요청에서는 IDOR 취약점이 드러나지 않는다. [OWASP IDOR 소개](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html#introduction)

## 식별자는 URL 밖에도 있다

프로필 수정 화면이 사용자 번호를 숨겨진 입력란에 넣어 보낸다고 가정해 보자.

```html
<input type="hidden" name="user_id" value="12345">
```

`hidden` 입력란은 화면에 표시되지 않지만, 요청에 실리는 값은 사용자가 바꿀 수 있다. 민수가 자신의 사용자 번호를 지연의 번호로 바꿨을 때 지연의 프로필이 수정된다면 IDOR이다. 서버는 전달받은 사용자 번호에 더해 수정 권한을 확인해야 한다.

PortSwigger는 채팅 기록 파일도 예로 든다. 민수가 `/static/12144.txt`로 자신의 기록을 내려받는 상황에서 파일명을 `12145.txt`로 바꿨더니 지연의 비공개 기록이 내려받아진다면 같은 문제가 발생한 것이다. 여기서는 **파일명이 식별자 역할**을 한다. [OWASP 폼 예시](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html#examples) · [PortSwigger 파일 접근 사례](https://portswigger.net/web-security/access-control/idor#idor-vulnerability-with-direct-reference-to-static-files)

## 긴 식별자에도 권한 검사가 필요하다

주문 번호가 연속된 숫자라면 다른 주문 번호를 추측하기 쉽다. 길고 무작위인 식별자는 유효한 값을 추측하기 어렵게 만든다.

하지만 민수가 지연의 주문 주소를 알게 되었다면 어떻게 될까? 그 주소로 요청했을 때 서버가 주문을 보여준다면 권한 없는 접근이 여전히 가능하다. **식별자의 복잡성과 관계없이 접근 권한을 확인해야 한다.** [OWASP 식별자 복잡성 설명](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html#identifier-complexity)

## 문서 조회 코드에서 소유권 확인하기

OWASP의 Java와 Spring Boot 예시는 로그인한 사용자가 자기 문서만 읽을 수 있다고 가정한다. 처음 코드는 문서 번호로 데이터를 찾는다.

```java
return documentRepository.findById(id).orElseThrow();
```

`findById(id)`는 해당 번호의 문서를 찾는 호출이다. `orElseThrow()`는 조회 결과가 없으면 예외를 발생시켜 처리를 중단한다. 실제 서비스에서는 예외를 적절한 오류 응답으로 처리해야 한다. 이 코드에는 조회한 문서의 소유자를 확인하는 과정이 없다. 수정 예시에서는 문서 번호와 소유자 번호를 함께 조회 조건에 넣는다.

```java
return documentRepository
    .findByIdAndOwnerId(id, currentUser().getId())
    .orElseThrow();
```

`currentUser()`는 서버의 신뢰할 수 있는 인증 정보에서 로그인한 사용자를 가져오는 함수로 가정한다. 민수가 로그인했다면 민수의 사용자 번호가 조건에 들어간다. 지연의 문서 번호를 보내도 두 조건이 함께 일치하는 문서가 없어 반환되지 않는다.

이 코드를 읽을 때 처음에는 “신뢰할 수 있는 사용자가 요청했는가?”라고 이해했다. 더 정확한 질문은 **“로그인한 사용자가 이 문서의 소유자인가?”**였다. 이 예시에서는 소유자에게만 조회를 허용하므로 소유권을 검사한다. 공유 문서처럼 다른 접근 규칙이 있다면 그 규칙에 맞게 검사해야 한다. [OWASP 수정 코드](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html#fixing-the-code)

## 수평 권한 상승과 수직 권한 상승

PortSwigger는 IDOR을 수평·수직 권한 상승과 연결해 설명한다. 아래 쇼핑몰 상황으로 두 개념을 구분했다.

| 구분 | 의미 | 예시 |
| --- | --- | --- |
| 수평 권한 상승 | 비슷한 권한을 가진 다른 사용자의 데이터나 기능에 접근 | 일반 회원 민수가 지연의 주문을 조회 |
| 수직 권한 상승 | 더 높은 권한이 필요한 데이터나 기능에 접근 | 일반 회원 민수가 관리자 전용 가격 변경 기능을 실행 |

IDOR은 수평 권한 상승과 자주 연결된다. 식별자 조작을 통해 더 높은 권한의 데이터나 기능에 접근하는 경우에는 수직 권한 상승과도 연결될 수 있다. [PortSwigger IDOR 설명](https://portswigger.net/web-security/access-control/idor#what-are-insecure-direct-object-references-idor)

## 조회와 수정 권한을 각각 확인하기

민수가 지연의 주문을 조회할 수 없더라도 배송지 변경 요청이 성공한다면 문제가 남는다. 그래서 두 사용자의 계정과 데이터를 준비하고, 다른 사용자의 데이터를 대상으로 각 작업이 거부되는지 확인해야 한다.

| 민수로 로그인해 보내는 요청 | 이 쇼핑몰에서 기대하는 결과 |
| --- | --- |
| 민수의 주문 조회 | 허용 |
| 지연의 주문 조회 | 거부 |
| 지연의 배송지 수정 | 거부 |
| 지연의 주문 삭제 | 거부 |

직접 만든 서비스나 허가된 실습 환경에서 이런 방식으로 확인할 수 있다. 조회뿐 아니라 수정·삭제 등 데이터에 접근하는 각 작업에 권한 검사가 적용되어야 한다. [OWASP 접근 제어 검증](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html#verifying-access-controls)

## 2025년판에서 달라진 점

접근 제어 실패는 2021년판에 이어 2025년판에서도 1위를 유지했다. 이전에 별도 항목이었던 **SSRF(Server-Side Request Forgery)가 A01에 통합**된 것도 변화다. [OWASP 2025년판 변경 사항](https://top10.owasp.org/2025/0x00_2025-Introduction/#whats-changed-in-the-top-10-for-2025)

SSRF는 공격자가 서버를 이용해 의도하지 않은 곳으로 요청을 보내게 하는 문제다. 이해를 위해 쇼핑몰의 이미지 가져오기 기능을 가정했다. 사용자가 이미지 주소를 입력하면 서버가 그 주소로 접속해 이미지를 가져온다. 이때 내부 시스템 주소를 입력해도 서버가 제한 없이 접속한다면 내부 정보에 접근하는 통로가 될 수 있다.

주문 조회에서는 사용자가 어떤 데이터에 접근할 수 있는지 확인했다. 이미지 가져오기 예시에서는 서버가 요청을 보내도 되는 목적지를 제한해야 한다. 외부 입력을 받아 서버가 수행하는 작업의 범위까지 생각하게 됐다.

## API의 객체 수준 인가 실패 BOLA

**BOLA(Broken Object Level Authorization)**는 특정 데이터에 대한 작업 권한 검사가 실패하는 문제다. OWASP API Security Top 10:2023의 API1 항목이며, 이 글의 기준인 웹 애플리케이션 Top 10:2025와는 별도의 목록이다.

주문 조회 기능을 사용할 수 있는 민수도 지연의 주문을 볼 권한은 없다. 서버는 **로그인한 사용자가 요청한 대상에 대해 해당 작업을 수행할 권한이 있는지** 확인해야 한다. 식별자를 바꾸는 IDOR 사례와 연결된다. [OWASP BOLA 설명](https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/#is-the-api-vulnerable)

## 매출 조회부터 차량 제어까지

공식 문서는 다음 세 사례를 소개한다. 민수와 지연이라는 이름은 이해를 위해 붙였다.

| 사례 | 요청에서 바꾸는 값 | 권한 검사가 빠졌을 때 |
| --- | --- | --- |
| 상점 매출 조회 | 상점 이름 | 민수가 지연의 비공개 매출을 조회 |
| 차량 원격 제어 | 차량 식별번호 VIN | 민수가 지연의 차량 문을 열거나 시동을 제어 |
| 문서 삭제 | 문서 식별자 | 민수가 지연의 문서를 삭제 |

첫 사례의 API는 `/shops/{shopName}/revenue_data.json`이다. 다른 API에서 상점 이름 목록을 얻고 이름을 바꿔 요청하면 여러 상점의 매출에 접근할 수 있다.

두 번째는 휴대전화 앱이 VIN을 보내 차량을 제어하는 사례다. 로그인과 차량 번호 확인에 더해 제어 권한을 검사해야 한다. 세 번째는 GraphQL API에 문서 식별자를 보내 삭제하는 사례다. GraphQL은 API에 필요한 데이터나 수행할 작업을 지정하는 쿼리 언어다. 삭제 전에 해당 문서에 대한 권한을 확인해야 한다. [OWASP BOLA 공격 사례](https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/#example-attack-scenarios)

## 대상과 작업에 맞게 권한 확인하기

상점 직원에게도 매출 조회를 허용한다면 소유자뿐 아니라 직원 권한도 판단해야 한다. 사용자가 로그인했는지 확인한 뒤, 서비스의 규칙에 따라 대상과 작업의 권한을 검사한다.

문서는 추측하기 어려운 식별자 사용과 권한 검사 테스트도 권고한다. 테스트가 실패하는 변경은 배포하지 않아야 한다. [OWASP BOLA 예방 방법](https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/#how-to-prevent)

## 접근 제어를 적용할 때 확인할 것

주문 조회부터 문서 삭제, 차량 제어까지 사례를 따라가며 사용자, 대상 데이터, 수행할 작업을 함께 확인해야 한다는 것을 알게 됐다. 내가 이해한 접근 제어 실패는 **권한 확인이 제대로 이루어지지 않아 허용 범위를 벗어난 데이터나 기능에 접근할 수 있는 문제**다.

내가 서비스를 만들 때는 다음 세 가지를 확인하려 한다.

- 로그인한 사용자는 서버가 확인한 인증 정보로 판단한다.
- 해당 사용자가 요청한 데이터에 대해 조회·수정·삭제 등 각 작업을 수행할 권한이 있는지 확인한다.
- 자기 데이터에 대한 허용과 다른 사용자의 데이터에 대한 거부를 함께 테스트한다.



## 참고 자료

<ol style="line-height: 1.5;">
  <li style="margin: 0; padding: 0;"><a href="https://top10.owasp.org/2025/A01_2025-Broken_Access_Control/">OWASP Top 10:2025 — A01 Broken Access Control</a></li>
  <li style="margin: 0; padding: 0;"><a href="https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html">OWASP Authorization Cheat Sheet</a></li>
  <li style="margin: 0; padding: 0;"><a href="https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html">OWASP IDOR Prevention Cheat Sheet</a></li>
  <li style="margin: 0; padding: 0;"><a href="https://portswigger.net/web-security/access-control/idor">PortSwigger — Insecure direct object references (IDOR)</a></li>
  <li style="margin: 0; padding: 0;"><a href="https://top10.owasp.org/2025/0x00_2025-Introduction/">OWASP Top 10:2025 — Introduction</a></li>
  <li style="margin: 0; padding: 0;"><a href="https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/">OWASP API Security Top 10:2023 — API1 Broken Object Level Authorization</a></li>
</ol>
