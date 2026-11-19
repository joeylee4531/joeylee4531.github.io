---
title: "ERC-20에서 토큰 전송과 사용 승인은 어떻게 다를까?"
date: "2026-11-18"
description: "ERC-20의 함수와 이벤트를 정리하고 토큰 사용 승인과 실제 예치 흐름을 살펴봅니다."
compact_header: true
permalink: /erc-20-transfer-and-approval/
---

토큰 30개를 쓸 수 있도록 서비스에 승인하면 서비스 잔액은 얼마나 늘어날까? 서비스 잔액은 그대로다. **승인**은 서비스에 ‘사용 한도’를 설정하고, **잔액**은 실제로 토큰을 전송할 때 바뀐다. ERC-20을 공부하면 **토큰을 직접 보내는 방법과 다른 주소에 토큰 사용 한도를 주고 그 권한으로 옮기는 방법**을 알 수 있다.

## 지갑과 서비스에 공통 규칙이 필요한 이유

이더리움에서 ERC-20 토큰의 잔액은 ‘토큰 컨트랙트’에 기록된다. 컨트랙트는 블록체인에 올라가 주소를 부여받은 프로그램이다. 지갑 앱은 토큰 컨트랙트에 사용자 주소를 전달해 잔액을 읽고 화면에 보여준다.

토큰 A는 잔액을 읽는 기능을 `getBalance`, 토큰 B는 `checkBalance`라고 부른다고 가정해 보자. 지갑은 같은 잔액을 보여주기 위해 토큰마다 어떤 함수를 써야 하는지 알아야 한다. 전송과 승인 방식까지 다르면 거래소나 예치 서비스도 토큰을 지원할 때마다 연동 코드를 추가해야 한다.

ERC-20은 이런 연동 문제를 줄이기 위해 등장했다. 토큰 개발자가 조회·전송·승인 기능을 공통 규칙에 맞춰 제공하면, 지갑은 조회할 토큰의 컨트랙트 주소만 바꿔 `balanceOf(사용자 주소)`{: .key-term}라는 같은 함수로 잔액을 읽을 수 있다. 서비스도 같은 승인과 전송 함수를 이용해 여러 토큰을 다룰 수 있다. [ERC-20의 제안 배경](https://eips.ethereum.org/EIPS/eip-20#motivation)

## Token 명세에 나오는 함수

공식 문서의 ｢Token｣ 항목은 토큰을 다루는 함수(Methods)와 동작을 기록하는 이벤트(Events)로 나뉜다. 함수는 지갑이나 서비스가 토큰 컨트랙트에 어떤 일을 요청할 때 쓰는 이름이다. 먼저 화면 표시에 쓰는 선택 함수 세 개를 살펴보고, 이어서 ERC-20이 요구하는 표준 함수 여섯 개를 정리한다.

| 선택 함수 | 하는 일 |
| --- | --- |
| `name()` | 토큰 이름을 알려준다. |
| `symbol()` | 지갑 화면에 표시할 토큰 기호를 알려준다. |
| `decimals()` | 토큰 수량을 표시할 때 쓸 소수 자릿수를 알려준다. 예를 들어 `decimals()`가 2라면, 기록된 정수 값 125는 화면에 1.25개로 표시된다. |
{: .plain-term-table}

| 표준 함수 | 하는 일 |
| --- | --- |
| `totalSupply()` | 현재 발행되어 있는 토큰의 전체 수량을 조회한다. |
| `balanceOf(owner)` | 지정한 주소가 가진 토큰의 수량을 조회한다. |
| `transfer(to, value)` | 호출한 주소의 토큰을 받는 주소(`to`)에 보낸다. |
| `approve(spender, value)` | 호출한 주소의 토큰을 `spender`가 옮길 수 있도록 사용 한도를 설정한다. |
| `allowance(owner, spender)` | `spender`가 `owner`의 토큰을 앞으로 얼마나 더 옮길 수 있는지 조회한다. |
| `transferFrom(from, to, value)` | 권한을 받은 주소가 호출해 `from`의 토큰을 `to`로 옮긴다. |
{: .plain-term-table}

`transfer`, `approve`, `transferFrom`의 반환값은 성공 여부를 나타내는 `bool`{: .key-term}이다. 명세는 이 함수를 호출하는 코드가 `false`{: .key-term}를 돌려받는 경우도 처리하도록 요구한다. [ERC-20 함수 명세](https://eips.ethereum.org/EIPS/eip-20#methods)

### 앨리스 예시로 보는 전송과 승인

앨리스가 `transfer(밥, 20)`{: .key-term}을 호출하면 앨리스의 토큰 20개가 밥에게 이동한다. 서비스가 앨리스의 토큰을 옮겨야 한다면 앨리스가 먼저 `approve(서비스, 30)`{: .key-term}을 호출한다. 첫 번째 인자인 `spender`{: .key-term}는 토큰을 옮길 권한을 받는 주소다. 서비스에 설정된 한도는 `allowance(앨리스, 서비스)`{: .key-term}로 확인할 수 있다.

승인 후 서비스가 `transferFrom(앨리스, 밥, 20)`{: .key-term}을 호출하면 앨리스의 잔액에서 20개가 빠지고 밥의 잔액에 20개가 들어간다. 이때 서비스가 자신의 사용 한도에서 20개를 쓴다. 두 번째 인자인 `to`{: .key-term}에 서비스 주소를 넣으면 서비스가 토큰을 받는다.

| 단계 | 앨리스 잔액 | 서비스 잔액 | 밥 잔액 | 서비스의 남은 사용 한도 |
| --- | ---: | ---: | ---: | ---: |
| 시작 | 100 | 0 | 0 | 0 |
| 앨리스가 `approve(서비스, 30)` 호출 | 100 | 0 | 0 | 30 |
| 서비스가 `transferFrom(앨리스, 밥, 20)` 호출 | 80 | 0 | 20 | 10 |
{: .plain-term-table}

이 상태에서 서비스가 15개를 더 옮기려고 하면 남은 한도 10개를 넘겨 전송이 실패한다. 앨리스 잔액은 80개, 사용 한도는 10개로 유지된다. 이후 앨리스가 `approve(서비스, 5)`를 호출하면 이전 한도는 새 값 5개로 바뀌고 각 주소의 잔액은 그대로다.

## Token 명세에 나오는 이벤트

이벤트는 토큰 컨트랙트가 블록체인에 남기는 기록이다. 지갑이나 블록 탐색기는 이 기록을 읽어 전송과 승인 내역을 보여줄 수 있다.

| 이벤트 | 언제 기록하는가 | 앨리스 예시 |
| --- | --- | --- |
| `Transfer(from, to, value)` | `transfer` 또는 `transferFrom`으로 토큰을 전송했을 때 | `Transfer(앨리스, 밥, 20)` |
| `Approval(owner, spender, value)` | `approve`로 사용 한도를 설정하는 데 성공했을 때 | `Approval(앨리스, 서비스, 30)` |
{: .plain-term-table}

0개를 보내는 전송도 성공하면 `Transfer`{: .key-term}를 기록해야 한다. 명세는 새 토큰을 발행할 때 보내는 주소를 0 주소로 표시한 `Transfer`도 남기도록 권고한다. 앨리스 예시의 `Transfer`에는 토큰을 보낸 쪽과 받은 쪽인 앨리스와 밥이 기록된다. 서비스를 호출 주체로 확인하려면 이벤트와 함께 호출 정보도 봐야 한다. [ERC-20 이벤트 명세](https://eips.ethereum.org/EIPS/eip-20#events)


## 실제 사용 사례 · Aave V3에 토큰 예치하기

Aave는 사용자가 토큰을 맡기거나 빌릴 수 있는 서비스다. Aave V3의 일반 ERC-20 예치 흐름에서는 다음 두 단계가 일어난다. [Aave 예치 안내](https://aave.com/help/supplying/supply-tokens)

1. 토큰 사용 승인. 사용자는 맡길 토큰의 컨트랙트에서 `approve`를 호출해 Aave의 `Pool`{: .key-term} 컨트랙트에 사용 한도를 준다. 위 예시의 `spender`가 `Pool`이다. 이 단계에서는 사용자의 토큰 잔액이 그대로다.
2. 예치 실행. 사용자가 `Pool`의 `supply`{: .key-term}를 호출하면, `Pool`은 받은 권한으로 사용자의 토큰을 해당 자산을 보관하는 컨트랙트로 옮긴다. Aave 코드에서는 ERC-20의 `transferFrom`을 `safeTransferFrom`{: .key-term}이라는 보조 함수를 통해 호출한다. 위 예시에서 밥의 자리에 자산을 보관하는 컨트랙트가 들어간다. [Pool 명세](https://aave.com/docs/aave-v3/smart-contracts/pool) · [Aave 예치 코드](https://github.com/aave-dao/aave-v3-origin/blob/main/src/contracts/protocol/libraries/logic/SupplyLogic.sol)

Aave의 예치 문서는 이더리움 메인넷 `Pool` 주소를 `0x87870Bca3F3fD6335C3F4ce8392D69350B4fa4E2`로 안내한다. 사용자가 승인하는 주소와 실제로 토큰을 받는 주소에 각각 어떤 역할이 있는지 이 사례에서 확인할 수 있다. [Aave 메인넷 예치 예제](https://aave.com/docs/aave-v3/markets/supply) · [Etherscan의 Pool 컨트랙트](https://etherscan.io/address/0x87870Bca3F3fD6335C3F4ce8392D69350B4fa4E2)

<style>
#post .compact-post-header,
#post main {
  font-family: var(--font-sans);
  letter-spacing: -.02em;
}
#post main .plain-term-table th:first-child,
#post main .plain-term-table code {
  color: inherit;
  font-weight: 400;
}
</style>
