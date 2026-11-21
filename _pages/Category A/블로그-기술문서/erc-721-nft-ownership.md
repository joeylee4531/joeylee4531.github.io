---
title: "ERC-721에서 NFT는 누가 소유하고 누가 옮길 수 있을까?"
date: "2026-11-20"
description: "42번 NFT를 예로 들어 ERC-721의 소유권 조회, 승인, 안전 전송을 살펴봅니다."
compact_header: true
permalink: /erc-721-nft-ownership/
---

앨리스가 NFT 7번과 42번을 갖고 있다. 지갑에 ‘NFT 2개’라고만 표시하면 어떤 NFT가 있는지 알기 어렵다. 컬렉션마다 개별 토큰을 조회하고 보내는 방식이 다르면 지갑과 마켓은 컬렉션별로 연동 코드를 작성해야 한다. ERC-721은 개별 토큰의 소유권을 조회하고 이전하는 공통 인터페이스를 정한다. ERC-721을 공부하면 **특정 NFT를 누가 소유하고, 그 NFT를 누가 어떤 권한으로 옮길 수 있는지** 알 수 있다. [ERC-721 제안 배경](https://eips.ethereum.org/EIPS/eip-721#motivation)

## NFT 하나를 식별하고 소유자 확인하기

ERC-20에서는 같은 토큰의 잔액을 수량으로 나타낸다. ERC-721에서는 각 NFT에 `tokenId`가 붙고, 이 번호는 같은 컨트랙트 안에서 NFT 하나를 구분한다. 컬렉션 A의 42번과 컬렉션 B의 42번을 구분하려면 같은 체인 안에서 **컨트랙트 주소와 토큰 번호**를 함께 봐야 한다.

지갑은 ERC-165의 `supportsInterface(0x80ac58cd)`로 ERC-721 지원 여부를 확인할 수 있다. 이후 `balanceOf(앨리스)`를 호출하면 앨리스가 가진 개수를, `ownerOf(42)`를 호출하면 42번 NFT의 소유자 주소를 얻는다. ERC-173의 `owner()`는 컨트랙트 자체의 소유자를 조회할 때 쓰인다. [ERC-721 명세](https://eips.ethereum.org/EIPS/eip-721#specification) · [ERC-173 명세](https://eips.ethereum.org/EIPS/eip-173#specification)

## 마켓에 NFT 전송 권한 주기

앨리스가 42번만 판매하려 한다면 마켓에 해당 NFT의 전송 권한을 줄 수 있다. 권한을 줄 때 어떤 함수를 선택하느냐에 따라 대상이 달라진다.

| 호출 | 마켓이 받는 권한 | 확인 함수 |
| --- | --- | --- |
| `approve(마켓, 42)` | 42번 NFT 하나를 옮길 권한 | `getApproved(42)` |
| `setApprovalForAll(마켓, true)` | 이 컨트랙트에서 앨리스가 소유한 NFT 전체를 관리할 권한 | `isApprovedForAll(앨리스, 마켓)` |

앨리스가 42번만 승인했다면 마켓은 그 권한으로 42번을 보낼 수 있다. 7번을 보내려면 별도 권한이 필요하다. 42번이 전송되면 해당 토큰의 개별 승인이 해제되고, `Transfer` 이벤트에 이전 소유자와 새 소유자, 토큰 번호가 기록된다. [ERC-721 승인 및 이벤트 명세](https://eips.ethereum.org/EIPS/eip-721#specification)

### 승인부터 전송까지 어떤 값이 바뀔까?

앨리스가 7번과 42번을 갖고 있고, 밥은 이 컬렉션의 NFT를 갖고 있지 않다고 하자. 앨리스는 마켓에 42번만 승인한다. 마켓이 `safeTransferFrom(앨리스, 밥, 42)`를 호출해 전송에 성공하면 아래와 같이 조회 결과가 달라진다.

| 조회 | 승인 전 | 승인 직후 | 전송 직후 |
| --- | --- | --- | --- |
| `balanceOf(앨리스)` | 2 | 2 | 1 |
| `balanceOf(밥)` | 0 | 0 | 1 |
| `ownerOf(42)` | 앨리스 | 앨리스 | 밥 |
| `getApproved(42)` | 0 주소 | 마켓 | 0 주소 |

승인할 때는 `Approval(앨리스, 마켓, 42)`가, 소유권이 넘어갈 때는 `Transfer(앨리스, 밥, 42)`가 기록된다. 승인 직후에는 42번의 소유자가 여전히 앨리스다. 전송이 끝난 뒤 `getApproved(42)`가 모든 자리가 0인 주소를 반환하면, 현재 42번에 등록된 개별 승인이 없다는 뜻이다.

전체 승인은 별도로 관리된다. 앨리스가 `setApprovalForAll(마켓, true)`를 호출했다면 42번이 밥에게 넘어간 뒤에도 마켓은 **앨리스에게 남은 7번**을 옮길 수 있다. 앨리스가 `setApprovalForAll(마켓, false)`를 호출하면 마켓의 전체 권한이 해제되고 `ApprovalForAll(앨리스, 마켓, false)`가 기록된다. [ERC-721 승인과 이벤트 명세](https://eips.ethereum.org/EIPS/eip-721#specification)

## 받는 쪽이 컨트랙트라면 어떻게 확인할까?

마켓이 `safeTransferFrom(앨리스, 밥의 컨트랙트, 42)`를 직접 호출한다고 하자. 받는 쪽이 컨트랙트이므로 NFT 컨트랙트는 수신 함수 `onERC721Received`를 호출한다. 이 함수에 전달되는 `operator`는 **전송을 요청한 마켓**이고, `from`은 **전송 전 소유자인 앨리스**다.

받는 컨트랙트가 명세에서 정한 4바이트 값을 반환하면 전송이 완료된다. 올바른 응답을 받지 못하면 전송이 되돌아가고, `ownerOf(42)`는 그대로 앨리스 주소를 반환한다. `transferFrom`에는 이 수신 확인 절차가 빠져 있어서, 받는 컨트랙트에 NFT를 꺼낼 방법이 없으면 토큰이 그 주소에 갇힐 수 있다. [전송과 수신 규칙](https://eips.ethereum.org/EIPS/eip-721#specification)

## 이름과 이미지, 보유 목록은 어떻게 조회할까?

메타데이터 확장을 지원한다면 지갑은 `tokenURI(42)`를 호출해 42번의 설명이나 이미지 정보가 있는 위치를 알아낼 수 있다. 목록 조회 확장을 지원한다면 지갑은 특정 주소가 보유한 NFT 번호를 차례로 조회할 수 있다. 기본 ERC-721 지원을 확인한 지갑은 두 선택 확장의 지원 여부도 ERC-165로 각각 물어볼 수 있다. [ERC-721 선택 확장 명세](https://eips.ethereum.org/EIPS/eip-721#specification)

예를 들어 NFT 목록 조회 확장을 지원하는 컬렉션에서 앨리스에게 7번만 남아 있다면, `balanceOf(앨리스)`는 1을 반환하고 `tokenOfOwnerByIndex(앨리스, 0)`은 7을 반환한다. 여기서 `0`은 목록에서 첫 번째 위치를 가리킨다. 지갑은 메타데이터 확장도 지원하는지 확인한 뒤 `tokenURI(7)`로 7번 NFT의 정보가 있는 위치를 조회할 수 있다. [ERC-721 선택 확장 명세](https://eips.ethereum.org/EIPS/eip-721#specification)

## ERC-721은 왜 이렇게 설계했을까?

### 토큰 번호로 보유 목록을 짐작할 수 있을까?

컬렉션 전체에 7번과 42번만 있다면, NFT가 두 개라는 사실만으로 실제 번호를 알아낼 수 없다. ERC-721은 각 NFT를 식별할 번호를 정하지만, 번호를 연속으로 붙이도록 요구하지 않는다. 지갑이 컬렉션 전체의 토큰 번호를 알아내려면, 목록 조회 확장을 지원하는 경우 `totalSupply()`로 개수를 확인하고 `tokenByIndex(0)`과 `tokenByIndex(1)`로 실제 번호를 조회할 수 있다.

### 수신 함수에 전송 요청자와 이전 소유자를 함께 전달하는 이유

앨리스가 직접 보내면 `operator`와 `from`이 모두 앨리스다. 마켓이 승인받은 권한으로 보내면 `operator`만 마켓으로 달라진다. 두 주소가 따로 전달되므로 받는 컨트랙트는 누가 전송을 요청했고 NFT가 누구에게서 넘어왔는지 각각 확인할 수 있다.

### 발행과 소각은 어떻게 기록할까?

발행과 소각을 실행하는 함수는 각 컬렉션이 설계한다. 일반적인 이벤트 규칙에서 42번이 앨리스에게 발행되면 `Transfer(0 주소, 앨리스, 42)`, 앨리스의 42번이 소각되면 `Transfer(앨리스, 0 주소, 42)`로 기록한다. 0 주소가 어느 자리에 있는지를 보면 이벤트를 읽는 지갑이나 탐색기가 발행과 소각을 구분할 수 있다. 컨트랙트를 생성하는 동안 NFT를 배정할 때는 `Transfer`를 생략할 수 있다는 예외가 있다. [ERC-721 설계 근거](https://eips.ethereum.org/EIPS/eip-721#rationale) · [이벤트 명세](https://eips.ethereum.org/EIPS/eip-721#specification)

## 실제 사용 사례 · Su Squares의 광고 공간

Su Squares는 광고 공간을 빌려 이미지를 배치하는 서비스다. 광고 공간은 칸마다 위치가 다르다. ERC-721의 `balanceOf`로는 한 주소가 보유한 칸의 수를, `ownerOf`로는 특정 칸의 소유자를 확인할 수 있다. 공식 명세는 Su Squares를 기본 표준과 선택 확장을 구현한 사례로 소개한다. [ERC-721 구현 사례](https://eips.ethereum.org/EIPS/eip-721#implementations)

다음 글 · [ERC-1155로 여러 종류의 아이템을 한 번에 보내기]({{ "/erc-1155-multi-token/" | relative_url }})
