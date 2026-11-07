---
nav_order: 3
page_type: page
bookmark: ARCHIVES
title: Archives
archive: true
permalink: /archives/
entries:
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
