# Plan: 수상경력 섹션 추가 + 한반도감 장려상 반영

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | 포트폴리오에 수상 이력이 없어 해커톤 장려상 수상 사실이 드러나지 않음; 발표자료가 zip 다운로드로만 제공되어 접근성이 낮음 |
| **Solution** | 자격증 섹션 위에 수상경력 섹션 신규 추가, 발표자료를 iframe 슬라이드 뷰어로 임베딩, "본선" 표현 일괄 교체 |
| **Functional UX Effect** | 방문자가 스크롤 중 수상 이력을 자연스럽게 확인하고, 발표자료를 페이지 이탈 없이 바로 볼 수 있음 |
| **Core Value** | Cloud Engineer 역량에 더해 AI 해커톤 수상 이력을 시각적으로 증명 → 취업 경쟁력 강화 |

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 국립중앙과학관 AI Hack Camp 2026 장려상 수상 → 포트폴리오에 즉시 반영 필요 |
| **WHO** | 포트폴리오 방문자 (채용담당자, 동료 개발자) |
| **RISK** | 발표자료 HTML+이미지 경로 깨짐 / 모바일에서 iframe 비율 문제 |
| **SUCCESS** | 수상경력 섹션이 자격증 위에 표시, 발표자료 iframe 정상 작동, "본선" 텍스트 0건 |
| **SCOPE** | index.html, projects.html, CSS 추가, slides/hanbando/ 폴더 |

---

## 1. 요구사항

### 1.1 Must (필수)

| ID | 요구사항 | 대상 파일 |
|----|----------|-----------|
| R-01 | 수상경력 섹션을 자격증(certifications) 섹션 바로 위에 추가 | `index.html` |
| R-02 | 한반도감 장려상 카드: 국립중앙과학관 AI Hack Camp 2026, 디지털 교육 분야, 장려상 | `index.html` |
| R-03 | 발표자료를 iframe 슬라이드 뷰어로 임베딩 (zip 다운로드 링크 제거 또는 보완) | `index.html`, `slides/` |
| R-04 | projects.html 한반도감 카드 내 "본선" 표현 전체를 "장려상"으로 교체 | `projects.html` |

### 1.2 Should (권장)

| ID | 요구사항 |
|----|----------|
| R-05 | 수상경력 섹션 태그: `// awards` |
| R-06 | 수상 연도·주최기관 표시 |
| R-07 | 모바일 반응형 (iframe 비율 유지) |

### 1.3 Won't (범위 외)

- skills.html 수상경력 추가 (별도 작업)
- 다른 수상 이력 추가 (현재는 1건만)

---

## 2. 구현 범위

### 2.1 변경 파일

| 파일 | 변경 유형 | 내용 |
|------|-----------|------|
| `index.html` | 수정 | 수상경력 섹션 HTML + 인라인 CSS 추가 (자격증 섹션 위) |
| `projects.html` | 수정 | "본선" → "장려상" 텍스트 4~5곳 교체 |
| `css/components/badges.css` | 수정 (또는 신규) | 수상경력 카드 스타일 추가 |

### 2.2 신규 구조

```
portfolio/
└── slides/
    └── hanbando/
        ├── index.html   ← 발표자료 메인 HTML (사용자가 zip 해제)
        └── images/      ← 슬라이드 이미지들
```

> **사용자 액션 필요**: zip 파일을 `slides/hanbando/` 폴더에 압축 해제

---

## 3. 상세 설계 메모

### 3.1 수상경력 섹션 구조 (index.html)

```
<section class="awards-section">          <!-- 자격증 섹션 바로 위 -->
  <div class="awards-container">
    <!-- 섹션 헤더: // awards · 수상 경력 -->
    <!-- 수상 카드: 국립중앙과학관 AI Hack Camp 2026 -->
    <!--   - 배지: 장려상 🏅 -->
    <!--   - 분야: 디지털 교육 -->
    <!--   - 날짜: 2026. 05. 17 -->
    <!--   - 발표자료 iframe 뷰어 (슬라이드 임베딩) -->
  </div>
</section>
```

### 3.2 iframe 슬라이드 뷰어

```html
<div class="slide-viewer">
  <iframe src="slides/hanbando/index.html"
          width="100%" height="420"
          frameborder="0"
          allowfullscreen>
  </iframe>
</div>
```

- 모바일: `aspect-ratio: 16/9` + `width: 100%` 로 비율 유지
- 로컬 실행 시 `file://` 프로토콜 제한 → S3 배포 후 정상 작동

### 3.3 projects.html 교체 목록

| 현재 텍스트 | 변경 텍스트 |
|-------------|-------------|
| `AI Hack Camp 2026 본선` (badge) | `AI Hack Camp 2026 장려상` |
| `본선 5. 16~17` (period) | `장려상 · 2026. 05. 17` |
| `본선 진출 작품` (desc) | `장려상 수상작` |
| `팀원의 ... 본선까지 마무리` | `팀원의 ... 장려상 수상까지 마무리` |
| `🏅 본선 마침 · 2026. 05. 17` (link badge) | `🏅 장려상 · 2026. 05. 17` |

---

## 4. 성공 기준

| 기준 | 검증 방법 |
|------|-----------|
| 수상경력 섹션이 자격증 섹션 위에 렌더링됨 | 브라우저 육안 확인 |
| iframe에서 발표자료 슬라이드가 표시됨 | 로컬 서버 또는 S3 배포 후 확인 |
| projects.html에서 "본선" 텍스트 0건 | `grep "본선" projects.html` |
| 모바일 375px에서 레이아웃 깨짐 없음 | DevTools 에뮬레이터 |

---

## 5. 구현 순서

1. `projects.html` — "본선" → "장려상" 텍스트 교체 (가장 단순)
2. `index.html` — 수상경력 섹션 HTML 삽입 (자격증 섹션 위)
3. `css/components/badges.css` — 수상경력 카드 스타일 추가
4. `slides/hanbando/` 폴더 생성 + 사용자 zip 해제 안내
5. 브라우저 확인 (로컬 서버)
