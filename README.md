# 황찬영 | Cloud Engineer Portfolio

> Personal portfolio website for Chan-Young Hwang, Cloud Engineer  
> **Live:** [hwchanyoung.dev](https://hwchanyoung.dev)

## Overview

AWS 기반 클라우드 인프라 설계와 DevOps 자동화를 다루는 Cloud Engineer 포트폴리오입니다.  
터미널 UI 컨셉의 다크 테마로 제작되었습니다.

## Pages

| Page | Description |
|------|-------------|
| `index.html` | Home — Hero 소개, 터미널 카드, 통계 |
| `skills.html` | Skills — 기술 스택 및 숙련도 |
| `projects.html` | Projects — 프로젝트 카드 (필터 지원) |
| `roadmap.html` | Roadmap — 학습 및 성장 로드맵 |

## Tech Stack

- **HTML / CSS / Vanilla JS** — 프레임워크 미사용
- **JetBrains Mono** — 터미널 스타일 폰트
- **Noto Sans KR** — 한글 폰트
- **CSS Custom Properties** — 디자인 토큰 관리
- **IntersectionObserver API** — 스크롤 애니메이션

## Design

- Dark theme (`#0a0a0a` 배경)
- Accent: Cyan `#00d4ff` + Purple `#7b2ff7`
- Terminal / CLI aesthetic
- Responsive (모바일 햄버거 메뉴 지원)

## Certifications

- 리눅스마스터
- 네트워크관리사
- AWS Solutions Architect Associate (SAA)

## Deployment

AWS S3 + CloudFront + Route 53으로 정적 호스팅

```
S3 Bucket (정적 파일)
    └── CloudFront (CDN + HTTPS)
            └── Route 53 (hwchanyoung.dev)
```

## Contact

- **GitHub:** [hwchany0ung](https://github.com/hwchany0ung)
- **Site:** [hwchanyoung.dev](https://hwchanyoung.dev)
