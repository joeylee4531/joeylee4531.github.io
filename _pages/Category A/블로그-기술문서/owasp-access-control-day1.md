---
title: "OWASP Top 10:2025 — A01 접근 제어 실패(Broken Access Control)"
date: "2026-11-19"
description: "주문·문서·채팅 기록 예시로 인증과 인가, IDOR, 접근 제어 실패의 원인과 예방 방법을 정리합니다."
compact_header: true
permalink: /owasp-broken-access-control/
---

OWASP Top 10 보안 동향을 조사하며 접근 제어 실패의 개념과 사례, 예방 방법을 정리한다. 공부한 내용을 이 글에 계속 보완할 예정이다.

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

Description에서는 과도한 권한 부여, URL이나 요청 조작을 통한 우회, 다른 사람의 식별자를 이용한 데이터 접근, API 권한 검사 누락, 권한 상승, 토큰·쿠키 등의 조작, CORS 설정 오류, 주소를 직접 입력하는 접근을 소개한다. 주문 조회와 관리자 기능 사례를 중심으로 살펴보면 이해하기 쉽다. [OWASP Description](https://top10.owasp.org/2025/A01_2025-Broken_Access_Control/#description)

## 공식 문서의 공격 사례 세 가지

첫 번째 사례는 **요청의 `acct` 값을 바꿔 다른 계정의 정보를 조회**하는 상황이다. 서버가 대상 계정에 대한 권한을 확인하지 않으면 정보가 노출될 수 있다. 민수가 주문 번호를 바꿔 지연의 주문을 보는 예시와 같은 구조다.

두 번째는 **주소를 직접 입력해 로그인이나 관리자 권한이 필요한 페이지에 접근**하는 경우다. 메뉴에 링크가 없어도 사용자는 주소로 요청할 수 있다.

세 번째는 **브라우저의 JavaScript로만 접근을 제한**하는 경우다. 다른 도구로 서버에 직접 요청하면 화면의 제한을 거치지 않을 수 있다. 예를 들어 일반 회원에게 상품 가격 변경 버튼을 숨겼어도, 서버가 직접 보낸 변경 요청을 허용하면 문제가 남는다. [OWASP 공격 시나리오](https://top10.owasp.org/2025/A01_2025-Broken_Access_Control/#example-attack-scenarios)

## 서버는 무엇을 확인해야 할까?

예방 방법에서 먼저 기억하고 싶은 것은 **최소 권한**, **기본 거부**, **데이터 소유권 확인**이다.

최소 권한은 업무에 필요한 만큼만 권한을 주는 것이다. 배송 담당자에게는 배송에 필요한 정보 조회 권한을 부여하는 식이다. 기본 거부는 허용 조건을 확인한 요청만 허용하는 방식이다. 권한 규칙이 없는 새 기능은 접근을 차단해야 한다.

주문 조회에서는 회원 여부에 더해 해당 주문을 볼 권한이 있는지도 확인해야 한다. 이 검사는 서버에서 수행해야 한다. 문서는 공통 접근 제어 방식의 재사용, 내부 파일 노출 방지, 접근 거부 로그와 알림, 요청 횟수 제한, 세션·토큰 관리, 검증된 도구 활용과 테스트도 권고한다. [OWASP 예방 지침](https://top10.owasp.org/2025/A01_2025-Broken_Access_Control/#how-to-prevent)

## 모든 요청에서 권한을 확인하기

두 번째 자료인 OWASP 인가 가이드에서는 Validate the Permissions on Every Request 부분을 읽었다. 요청은 브라우저 등이 서버에 특정 작업을 해달라고 보내는 메시지다.

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

`findById(id)`는 해당 번호의 문서를 찾는 호출이다. 이 코드에는 조회한 문서의 소유자를 확인하는 과정이 없다. 수정 예시에서는 문서 번호와 소유자 번호를 함께 조회 조건에 넣는다.

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

## 접근 제어를 적용할 때 확인할 것

이제 주문 하나를 조회할 때도 사용자, 대상 데이터, 수행할 작업을 함께 확인해야 한다는 것을 알게 됐다. 내가 이해한 접근 제어 실패는 **권한 확인이 제대로 이루어지지 않아 허용 범위를 벗어난 데이터나 기능에 접근할 수 있는 문제**다.



## 참고 자료

<ol style="line-height: 1.5;">
  <li style="margin: 0; padding: 0;"><a href="https://top10.owasp.org/2025/A01_2025-Broken_Access_Control/">OWASP Top 10:2025 — A01 Broken Access Control</a></li>
  <li style="margin: 0; padding: 0;"><a href="https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html">OWASP Authorization Cheat Sheet</a></li>
  <li style="margin: 0; padding: 0;"><a href="https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html">OWASP IDOR Prevention Cheat Sheet</a></li>
  <li style="margin: 0; padding: 0;"><a href="https://portswigger.net/web-security/access-control/idor">PortSwigger — Insecure direct object references (IDOR)</a></li>
</ol>
