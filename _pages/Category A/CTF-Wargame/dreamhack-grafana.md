---
title: "Dreamhack web-misconf-1"
date: "2026-11-25"
description: "기본 관리자 계정으로 접속해 Grafana 설정에서 플래그를 찾은 Dreamhack 워게임 풀이"
compact_header: true
---

문제에서 준 단서는 플래그가 organization에 있다는 것이었다. Grafana에 접속하니 로그인 화면이 떠서 문제에서 제공한 파일부터 열어 봤다.

[Dreamhack 문제 페이지](https://dreamhack.io/wargame/challenges/45)

![Grafana 로그인 화면]({{ "/assets/img/dreamhack-grafana/grafana-login.png" | relative_url }})

## defaults.ini에서 기본 계정 확인

제공 파일 중 `defaults.ini`에 관리자 계정 설정이 있었다.

![defaults.ini의 기본 관리자 계정 설정]({{ "/assets/img/dreamhack-grafana/defaults-ini.png" | relative_url }}){: style="width: 400px; max-width: 100%; height: auto;"}

파일에 적힌 아이디와 비밀번호를 로그인 화면에 입력하니 관리자 계정으로 접속할 수 있었다.

## Orgs에서 Settings로

organization이라는 단서가 있어 `Server Admin`의 `Orgs`부터 열어 봤다. 조직 목록에는 플래그가 보이지 않았다. 관리자 계정으로 들어온 만큼 같은 메뉴에 있는 다른 항목도 살펴봤다.

`Settings`를 열어 보니 `auth.anonymous` 섹션의 `org_name`에 플래그가 들어 있었다.

![Grafana Settings의 auth.anonymous 섹션과 org_name 값]({{ "/assets/img/dreamhack-grafana/grafana-settings.png" | relative_url }}){: style="width: 520px; max-width: 100%; height: auto;"}

## 플래그 제출

`org_name` 값을 Dreamhack에 제출하니 정답으로 처리됐다.

![Dreamhack 플래그 제출 성공 화면]({{ "/assets/img/dreamhack-grafana/dreamhack-solved.png" | relative_url }}){: style="width: 600px; max-width: 100%; height: auto;"}

이번 문제에서는 기본 관리자 계정으로 로그인하자 서버 설정까지 볼 수 있었다. 설정 파일에서 기본 계정을 찾은 게 풀이의 출발점이었다.

