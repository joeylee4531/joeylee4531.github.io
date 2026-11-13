---
nav_order: 3
page_type: page
bookmark: ARCHIVES
title: Archives
archive: true
permalink: /archives/
entries:
  - date: 2026-11-14
    summary: 보안 공부의 첫걸음을 돌아보며
    content: >-
      WHOIS에서 시작한 보안 공부를 돌아보고, 현재 어렵게 느끼는 포너블과 아직 낯선 포렌식을 어떻게 공부할지 정리했습니다.
      나이츠 프론티어 미션과 동아리 과제, 드림핵을 통해 공부를 이어갈 계획을 기록했습니다.
      [회고 글 읽기](/Category%20A/%EB%B8%94%EB%A1%9C%EA%B7%B8-%EA%B8%B0%EC%88%A0%EB%AC%B8%EC%84%9C/security-learning-retrospective.html)
  - date: 2026-11-08
    summary: "'나'에 대해 기록하기"
    content: >-
      나의 가치관과 나이츠프론티어 지원동기, 7개월 동안의 목표를 기록했습니다.
      재수와 군 복무 중 편입 경험을 돌아보며, 지금의 선택 기준이 생긴 이유를 정리했습니다.
      [본문 읽기](/Category%20A/%EB%B8%94%EB%A1%9C%EA%B7%B8-%EA%B8%B0%EC%88%A0%EB%AC%B8%EC%84%9C/knights-frontier-start.html)
  - date: 2026-11-07
    summary: 첫 보안 논문 리뷰 작성
    content: >-
      IEEE S&P 2026 논문 The Passkey Promise를 읽고 첫 논문 리뷰를 작성했습니다.
      패스키와 보안키, OTP의 사용성을 비교한 실험을 살펴보고, 대학에서 인증을 도입할 때의 장벽과 연구의 한계를 정리했습니다.
      [논문 리뷰 읽기](/Category%20A/%EB%85%BC%EB%AC%B8-%EC%BB%A8%ED%8D%BC%EB%9F%B0%EC%8A%A4/the-passkey-promise.html)
  - date: 2026-11-06
    summary: 블로그 시작
    content: >-
      공부한 내용을 차근차근 기록하고 나누기 위해 블로그를 시작했습니다. 앞으로 개발과 보안 공부를 이어가며 새롭게 배운 내용과 경험을 이곳에 꾸준히 정리해 나가겠습니다.
---
<div class="archive-timeline">
{% for entry in page.entries %}
<details class="archive-entry">
<summary>
<span class="archive-node" aria-hidden="true"></span>
<time datetime="{{ entry.date | date: '%Y-%m-%d' }}">{{ entry.date | date: '%Y.%m.%d' }}</time>
<span class="archive-summary">{{ entry.summary | escape }}</span>
<svg class="archive-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>
</summary>
<div class="archive-body">{{ entry.content | markdownify }}</div>
</details>
{% endfor %}
</div>
