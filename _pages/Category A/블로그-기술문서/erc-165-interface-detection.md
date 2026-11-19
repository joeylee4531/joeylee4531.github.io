---
title: "ERC-165로 컨트랙트가 지원하는 기능 확인하기"
date: "2026-11-19"
description: "함수 선택자와 인터페이스 ID부터 ERC-165의 지원 여부 확인 절차와 실제 사용 사례까지 정리합니다."
compact_header: true
permalink: /erc-165-interface-detection/
---

지갑이 스마트 컨트랙트 주소를 하나 받았다고 하자. 이 컨트랙트가 NFT의 소유자를 조회하는 기능을 지원하는지 어떻게 알 수 있을까? ERC-165를 공부하면 **스마트 컨트랙트가 어떤 표준 인터페이스를 지원하는지 공통된 방식으로 확인할 수 있다.** 인터페이스는 호출할 수 있는 함수들의 약속이다. [ERC-165 제안 배경](https://eips.ethereum.org/EIPS/eip-165#motivation)

## 함수 선택자와 인터페이스 ID

함수 선택자는 함수 이름과 매개변수 타입을 적은 문자열을 Keccak-256으로 해시한 뒤 앞 4바이트를 취한 값이다. 예를 들어 잔액 조회 함수의 경우 `balanceOf(address)`를 사용한다. 매개변수 이름과 반환 타입은 계산에 들어가지 않는다.

인터페이스 ID는 그 인터페이스에 속한 함수들의 선택자를 XOR로 결합한 4바이트 값이다. XOR는 두 비트가 다르면 1, 같으면 0을 내는 연산이다. 함수 선택자는 함수 하나를 가리키고, 인터페이스 ID는 함수들의 묶음을 가리킨다. ERC-165는 함수가 하나라서 인터페이스 ID `0x01ffc9a7`과 `supportsInterface(bytes4)`의 선택자가 같다. [인터페이스 ID 규칙](https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified)

## Test Cases · 질문하는 쪽의 코드


공식 문서의 `ERC165Query`는 컨트랙트 주소와 확인할 인터페이스 ID를 받아 지원 여부를 확인하는 예제다. `noThrowCall`은 `STATICCALL`을 실행하고, 호출이 성공했는지 나타내는 `success`와 상대의 반환값인 `result`를 각각 돌려준다.

| 질문 | 계속 진행하거나 지원으로 판정하는 조건 |
| --- | --- |
| ERC-165 자체를 지원하는가? (`0x01ffc9a7`) | 호출에 성공하고 `true`를 반환하면 다음 질문으로 넘어간다. |
| 무효 ID를 지원하는가? (`0xffffffff`) | 호출에 성공하고 `false`를 반환하면 마지막 질문으로 넘어간다. |
| 확인하려는 인터페이스를 지원하는가? (대상 인터페이스 ID) | 호출에 성공하고 `true`를 반환하면 지원한다고 판정한다. |

두 번째 질문에서 기대하는 값은 `success = 1`{: .key-term}과 `result = 0`{: .key-term}이다. 호출은 정상적으로 끝났고 상대는 무효 ID를 지원하지 않는다고 답한 것이다. 이때 호출 자체가 실패하면 예제는 검사를 중단하고 `false`를 반환한다. [ERC-165 Test Cases](https://eips.ethereum.org/EIPS/eip-165#test-cases)

무효 ID 검사는 어떤 ID에도 `true`라고 답하는 컨트랙트를 걸러낸다. ERC-165 지원 검사를 통과하지 못했다면 공개 코드나 ABI에서 필요한 함수가 있는지 확인할 수 있다. [ERC-165 감지 절차](https://eips.ethereum.org/EIPS/eip-165#how-to-detect-if-a-contract-implements-erc-165)

예를 들어 지갑에서 컨트랙트 A와 B가 ERC-721 기본 인터페이스를 지원하는지 확인한다고 하자. 아래 표에 적힌 호출은 모두 성공했다. 어느 컨트랙트에서 ERC-721 지원을 확인할 수 있을까?

| 질문 | 컨트랙트 A의 응답 | 컨트랙트 B의 응답 |
| --- | --- | --- |
| ERC-165 자체를 지원하는가? (`0x01ffc9a7`) | `true` | `true` |
| 무효 ID를 지원하는가? (`0xffffffff`) | `false` | `true` |
| ERC-721 기본 인터페이스를 지원하는가? (`0x80ac58cd`) | `true` | 검사하지 않음 |

정답은 A다. A는 첫 두 질문에 `true`, `false`로 답해 ERC-165 검사를 통과했다. 세 번째 질문에도 `true`라고 응답했으므로, 지갑은 A가 ERC-721 기본 인터페이스를 지원한다고 판정한다. B는 무효 ID에 `true`라고 답해 두 번째 단계에서 검사가 끝난다. 이 결과로 확인한 것은 B가 ERC-165 검사를 통과하지 못했다는 점이다. B에 ERC-721 함수가 있는지 확인하려면 공개 코드나 ABI를 따로 살펴봐야 한다.

### STATICCALL과 30,000 가스 한도

ERC-165 지원을 확인하는 첫 두 호출에는 각각 30,000 가스를 한도로 넘기고 `STATICCALL`{: .key-term}을 사용한다. 가스는 코드 실행 작업량을 재는 단위다. 상대가 넘겨받은 가스를 모두 쓰고도 답을 계산하지 못하면 그 호출은 실패한다.

`STATICCALL`에서는 저장된 값을 읽을 수 있고, 저장 상태를 바꾸려고 하면 호출이 실패한다. ERC-20으로 예를 들면 `balanceOf`로 잔액을 읽을 수 있지만, `approve`가 사용 한도를 저장하려 하면 실패한다. ERC-165의 질문은 지원 여부를 조회하는 데 쓰인다. [ERC-165 명세](https://eips.ethereum.org/EIPS/eip-165#specification)

## 지원하는 ID를 저장하거나 직접 비교하기

공식 문서는 당시 Solidity와 호환되는 단순한 명세를 지향했다고 설명한다. 답을 구하는 내부 방식으로는 두 가지 예제를 보여준다. Lisa는 지원하는 ID를 매핑에 기록해 두고 값을 조회한다. 처음에 값을 저장하는 비용이 들지만 ID가 늘어도 하나씩 비교할 필요가 없다. Homer는 받은 ID를 코드에 적어 둔 ID와 차례로 비교한다. ID가 적으면 간단하고, ID가 늘면 확인에 필요한 비교 횟수도 늘 수 있다.

2019년에는 조회 예제의 호출 입력 길이를 36바이트로 바로잡았다. 함수 선택자가 4바이트이고, ABI에서 인터페이스 ID 인자에 32바이트를 할당하기 때문이다. [설계 배경](https://eips.ethereum.org/EIPS/eip-165#rationale) · [구현 예제](https://eips.ethereum.org/EIPS/eip-165#implementation) · [수정 기록](https://eips.ethereum.org/EIPS/eip-165#version-history)

## 실제 사용 사례 · NFT와 ENS

ERC-721은 ERC-165 지원을 요구한다. 지갑이나 마켓이 대상 컨트랙트의 ERC-165 지원을 확인했다면, `supportsInterface(0x80ac58cd)`를 호출해 ERC-721 기본 인터페이스를 지원한다고 응답하는지 확인할 수 있다. 소유자를 알고 싶을 때는 이어서 NFT 번호를 `ownerOf(tokenId)`에 전달한다. 앞 호출은 기능의 지원 여부를 묻고, 뒤 호출은 특정 NFT의 소유자를 묻는다. [ERC-721 공식 명세](https://eips.ethereum.org/EIPS/eip-721#specification)

ERC-165 명세는 이더리움 이름 서비스인 ENS도 실제 도입 사례로 언급한다. ENS의 리졸버 표준은 주소 조회처럼 개별 기능을 식별하는 인터페이스 ID를 정의한다. 호출하는 쪽은 어떤 조회 기능을 사용할 수 있는지 확인한 뒤 해당 기능을 호출할 수 있다. [ERC-165 호환성 설명](https://eips.ethereum.org/EIPS/eip-165#backwards-compatibility) · [ENS 리졸버 표준](https://eips.ethereum.org/EIPS/eip-137#resolver-specification)

`true`는 컨트랙트가 지원한다고 응답했다는 뜻이다. 그 응답만으로 개별 함수가 명세에 맞게 동작하는지까지 검증할 수는 없다.
