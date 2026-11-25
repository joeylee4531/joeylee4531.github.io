---
title: "Dreamhack phpreg"
date: "2026-11-25"
description: "두 단계로 나뉜 Dreamhack 워게임에서 PHP 정규식 치환과 명령어 입력 검사를 살펴봤다."
compact_header: true
---

첫 화면에는 문 그림 아래에 Nickname과 Password 입력란이 있었다. 어떤 값을 비교하는지 확인하려고 `index.php`에서 이어지는 `step2.php` 코드를 읽었다.

[Dreamhack 문제 페이지](https://dreamhack.io/wargame/challenges/873)

## Step 1. 입력 검사와 치환

![Step 1의 Nickname과 Password 입력 화면]({{ "/assets/img/dreamhack-873/step-1.png" | relative_url }}){: style="width: 460px; max-width: 100%; height: auto;"}

![Step 1 치환 결과 비교 코드]({{ "/assets/img/dreamhack-873/step-1-check.png" | relative_url }}){: style="width: 740px; max-width: 100%; height: auto;"}

Password 검사는 `preg_match("/[a-zA-Z]/", $input_pw)`에서 시작한다. 영문자가 한 글자라도 있으면 함수는 정수 `1`을 반환하고, 코드는 오류 메시지를 출력한다. 입력 문자열 자체는 유지된다. 영문자가 없는 경우에만 Nickname과 Password의 치환 단계로 넘어간다.

![Step 1 정규식 검사와 치환 코드]({{ "/assets/img/dreamhack-873/step-1-filter.png" | relative_url }}){: style="width: 740px; max-width: 100%; height: auto;"}

`preg_replace(패턴, 치환 문자열, 대상 문자열)`은 대상에서 패턴에 맞는 부분을 찾아 바꾼다. Nickname 검사에 붙은 `i`는 대소문자를 구분하지 않는다는 뜻이다. 치환 문자열에 빈 문자열을 넣으면 일치한 부분이 빠진다. 예를 들어 `/draft/i`를 빈 문자열로 치환하면 `DRAFT-report`는 `-report`가 된다. Password도 패턴에 맞는 부분을 바꾼 뒤, 치환 결과를 비교한다.

아래는 문제의 Nickname 필터를 별도로 테스트한 화면이다.

![정규식 치환 결과를 확인한 화면]({{ "/assets/img/dreamhack-873/regex-test.png" | relative_url }}){: style="width: 166px; max-width: 100%; height: auto;"}

코드를 읽을 때는 `*`가 바로 앞 요소를 0회 이상, `+`가 1회 이상 반복한다는 점을 먼저 확인했다. `{2,3}`은 2~3회 반복이고, `[^...]`는 대괄호 안에 적힌 문자들을 제외한 한 글자와 일치한다.

## Step 2. 명령어 입력 검사

![Step 2의 Command 입력 화면]({{ "/assets/img/dreamhack-873/step-2.png" | relative_url }}){: style="width: 330px; max-width: 100%; height: auto;"}

첫 단계를 통과하니 Command 입력란이 열렸다.

![Step 2 명령어 입력 검사 코드]({{ "/assets/img/dreamhack-873/step-2-filter.png" | relative_url }}){: style="width: 530px; max-width: 100%; height: auto;"}

여기서는 `preg_match()`로 특정 단어가 입력에 포함됐는지 검사했다. 단어에 걸리면 화면에 `Error!`가 나왔고, 검사를 통과한 입력은 `system()`으로 전달됐다.

이 단계에서 입력 검사와 명령 실행을 따로 봐야 한다는 점이 눈에 들어왔다. PHP의 정규식 검사는 제출한 문자열을 보고, 셸은 명령을 해석하면서 파일명 패턴을 확장할 수 있다. 예를 들어 셸에서 `report-*.txt` 같은 패턴은 `report-may.txt`와 `report-june.txt`에 모두 일치할 수 있다. 사용자 입력을 명령으로 실행하는 코드에서는 특정 단어 검사만으로 접근 가능한 파일이나 동작을 제한하기 어렵다.

## 제출 결과

찾은 플래그를 Dreamhack에 제출하니 문제를 해결했다는 메시지가 나왔다.

![Dreamhack 문제 해결 확인 화면]({{ "/assets/img/dreamhack-873/solved.png" | relative_url }}){: style="width: 600px; max-width: 100%; height: auto;"}
