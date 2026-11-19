---
title: "ERC-173으로 스마트 컨트랙트의 소유권 관리하기"
date: "2026-11-19"
description: "컨트랙트 소유자를 확인하고 소유권을 이전하는 표준을 ERC-165와 Diamond 구현 사례로 살펴봅니다."
compact_header: true
permalink: /erc-173-contract-ownership/
---

관리 화면은 컨트랙트의 소유자 주소를 조회해 보여줄 수 있다. 그런데 어떤 컨트랙트는 `getOwner()`, 다른 컨트랙트는 `adminAddress()`를 제공한다고 가정하면 관리 화면마다 각 컨트랙트의 조회 방식을 알아야 한다. ERC-173을 공부하면 **공통 인터페이스로 스마트 컨트랙트의 소유자를 조회하고, 소유권을 다른 주소로 넘기는 방법을 알 수 있다.** 소유자에게 어떤 관리 권한을 줄지는 각 컨트랙트의 코드가 정한다. [ERC-173 제안 배경](https://eips.ethereum.org/EIPS/eip-173#motivation)

## 함수 두 개와 이벤트 하나

현재 소유자는 `owner()`로 확인하고, 소유권은 `transferOwnership()`으로 넘긴다. 앨리스가 관리하던 컨트랙트를 밥에게 넘기는 상황을 보자.

| 이름 | 하는 일 | 앨리스와 밥의 예시 |
| --- | --- | --- |
| `owner()` | 현재 소유자 주소를 돌려준다. | 이전 전에는 앨리스, 이전 후에는 밥의 주소가 나온다. |
| `transferOwnership(newOwner)` | 소유권을 새 주소로 이전한다. | 앨리스가 호출할 때 밥의 주소를 넣는다. |
| `OwnershipTransferred(previousOwner, newOwner)` | 이전 소유자와 새 소유자를 이벤트에 기록한다. | 이전 기록에 앨리스와 밥의 주소가 남는다. |

관리 화면은 `owner()`로 현재 소유자를, 이벤트 기록으로 소유자가 바뀐 내역을 확인할 수 있다. 명세는 컨트랙트를 만들 때도 이 이벤트를 남기도록 권고한다.

명세는 0으로만 이루어진 주소인 `address(0)`에 소유권을 넘기는 호출을 **소유권 포기**로 정의한다. 현재 소유자만 설정을 바꾸거나 소유권을 넘길 수 있게 구현한 컨트랙트에서는 포기 후 그 기능을 쓸 수 없게 된다. 소유자 주소가 개인 계정이라면, 그 계정을 제어하는 개인 키를 잃었을 때도 소유자 권한을 행사할 수 없으므로 키 관리가 필요하다. [ERC-173 명세](https://eips.ethereum.org/EIPS/eip-173#specification) · [보안 고려 사항](https://eips.ethereum.org/EIPS/eip-173#security-considerations)

## ERC-165로 소유권 기능 확인하기

컨트랙트가 ERC-165도 구현했다면, 관리 도구는 `supportsInterface(0x7f5828d0)`으로 ERC-173 지원 여부를 확인할 수 있다. ERC-173은 두 함수와 이벤트를 정의한 인터페이스 구현을 요구하고, ERC-165로 지원 여부를 알리는 방식은 권고한다. 지원을 확인한 뒤에는 `owner()`로 현재 소유자를 읽을 수 있다. **지원 여부와 소유자 주소는 각각 다른 질문의 답**이다. [ERC-173 인터페이스 ID](https://eips.ethereum.org/EIPS/eip-173#specification) · [ERC-165 정리](../erc-165-interface-detection/)

## 소유권을 주소로 관리하는 이유

다른 컨트랙트에 물어보지 않고 현재 소유자를 읽을 수 있다. 앨리스가 관리하던 컨트랙트를 밥에게 넘기는 경우를 다시 보자. 컨트랙트가 소유자 주소를 직접 저장하는 구현이라면, 앨리스는 `transferOwnership(밥 주소)`를 호출한다. 이전이 끝나면 컨트랙트에 저장된 소유자 주소가 밥의 주소로 바뀐다. 관리 화면은 `owner()`를 호출해 새 소유자를 확인할 수 있다.

명세가 검토한 다른 방식에서도 같은 상황을 생각해 볼 수 있다.

| 소유권을 연결하는 대상 | 앨리스가 밥에게 넘기는 방법 | 현재 소유자를 확인하는 방법 |
| --- | --- | --- |
| 주소 | 컨트랙트에 밥의 주소를 새 소유자로 지정한다. | 컨트랙트에 저장된 주소를 읽는다. |
| ENS 이름 | 컨트랙트가 따르도록 설정한 `example.eth` 이름의 소유권을 밥에게 넘긴다. | 컨트랙트가 ENS에 그 이름의 현재 소유자를 물어본다. |
| NFT | 컨트랙트가 따르도록 설정한 NFT 42번을 밥에게 보낸다. | 컨트랙트가 NFT 컨트랙트에 `ownerOf(42)`를 호출한다. |

주소를 직접 저장하는 예시에서는 소유권을 확인할 때 다른 컨트랙트에 물어볼 필요가 없다. 명세는 이런 단순함과 기존 컨트랙트와의 호환성, 가스 비용을 설계 기준으로 삼았다. ENS나 NFT를 활용하는 설계도 ERC-173과 함께 구현할 수 있다. [ERC-173 설계 근거](https://eips.ethereum.org/EIPS/eip-173#rationale)

## 실제 구현 사례 · Diamond의 OwnershipFacet

Diamond의 공개 참조 구현인 diamond-3는 현재 소유자가 요청했는지 확인한 뒤 새 소유자 주소를 저장한다. Diamond는 여러 모듈의 기능을 한 컨트랙트 주소로 제공하는 구조이며, 소유권 관리는 `OwnershipFacet` 모듈이 맡는다. 이 모듈의 `owner()`는 저장된 소유자 주소를 읽고, `transferOwnership()`은 호출자가 현재 소유자인지 확인한 뒤 새 주소를 저장한다.

여기서 ERC-173이 정하는 부분은 관리 도구가 소유자를 조회하고 이전을 요청할 때 쓰는 함수다. 누가 소유권을 넘길 수 있는지 검사하고 어디에 주소를 저장할지는 Diamond의 코드가 담당한다. [Diamond 표준](https://eips.ethereum.org/EIPS/eip-2535) · [OwnershipFacet 구현](https://github.com/mudgen/diamond-3/blob/master/contracts/facets/OwnershipFacet.sol)
