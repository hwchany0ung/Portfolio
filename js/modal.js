/* ========================
   Project Detail Modal
   - Click project card to open detail modal
   - ESC / overlay click to close
   - Supports architecture diagram embedding
   ======================== */

(function () {
  'use strict';

  // ── Project Data ────────────────────────────────────────────────
  const PROJECTS = {
    'devnavi': {
      type: 'AI / Fullstack / AWS Serverless',
      badge: 'personal',
      period: '2026. 03 ~ 진행 중',
      title: 'DevNavi — AI 커리어 로드맵 생성 서비스',
      subtitle:
        'IT 취업 준비생이 목표 직군·기간·현재 수준을 입력하면 Claude AI가 주차별 학습 체크리스트를 자동 생성하는 풀스택 AI 서비스입니다.',
      roles: [
        'AWS Lambda(서버리스) + FastAPI + Mangum 백엔드 아키텍처 설계 및 구현',
        'Claude API SSE 스트리밍 — Pure ASGI 미들웨어 기반 실시간 응답 출력',
        '태스크별 AI Q&A + 동적 팔로업 질문 3개 자동 생성 (claude-haiku)',
        'Supabase PostgreSQL + JWT + Google OAuth 인증 시스템 구현',
        'Terraform IaC로 AWS 인프라(Lambda, CloudFront, SSM) 전체 코드화',
        'GitHub Actions 4-job CI/CD (unit/integration/frontend/e2e, 80% 커버리지 강제)',
        '멀티 에이전트 오케스트레이션으로 설계~배포 전 사이클 자동화',
      ],
      achievements: [
        { value: '9종', label: '지원 직군' },
        { value: 'SSE', label: '실시간 스트리밍' },
        { value: '188', label: '테스트 통과' },
        { value: 'LIVE', label: 'devnavi.kr' },
      ],
      tags: [
        'Claude API',
        'React + Vite',
        'FastAPI',
        'AWS Lambda',
        'CloudFront',
        'Supabase',
        'Terraform',
        'GitHub Actions',
        'Tailwind CSS',
      ],
      diagram: 'devnavi',
      links: {
        github: 'https://github.com/hwchany0ung/DevNavi',
        live: 'https://devnavi.kr',
      },
    },
    'motion-webcam': {
      type: 'Cloud / AWS Serverless / Container',
      badge: 'personal',
      period: '2026. 02 ~ 03',
      title: 'Motion-WebCam 모니터링 파이프라인',
      subtitle:
        '스마트폰과 VM Rocky Linux를 엣지 게이트웨이로 구성해 AWS 서버리스(S3, Lambda, RDS)와 연동한 영상 모니터링 파이프라인입니다.',
      roles: [
        'AWS 서버리스 아키텍처 설계 및 전체 인프라 구축',
        'S3 Gateway Endpoint 도입으로 NAT Gateway 비용 제거 (유지비 0원 달성)',
        'Lambda 함수 작성 (Python) - S3 이벤트 트리거 기반 영상 메타데이터 처리',
        'RDS Multi-AZ 설정 및 VPC 보안 그룹 구성',
        'Docker 기반 엣지 게이트웨이 컨테이너 구성 (Rocky Linux)',
        'OpenCV를 활용한 모션 감지 알고리즘 구현',
      ],
      achievements: [
        { value: '0원', label: '월 유지비' },
        { value: '100%', label: '서버리스' },
        { value: '5+', label: 'AWS 서비스' },
        { value: '1인', label: '개인 프로젝트' },
      ],
      tags: [
        'AWS S3',
        'AWS Lambda',
        'AWS RDS',
        'VPC Endpoint',
        'Docker',
        'Rocky Linux',
        'Python / OpenCV',
      ],
      diagram: 'motion-webcam',
      links: {
        github: 'https://github.com/hwchany0ung',
        notion:
          'https://www.notion.so/Motion-WebCam-315c28606b3f80f8b03fed18e2cf11c7',
      },
    },
    'iot-smartscan': {
      type: 'IoT / Convergence',
      badge: 'team',
      period: '2026. 03 ~ (진행 중)',
      title: 'IoT 융합 - 노터치 소지품 체크',
      subtitle:
        '센서 기반으로 소지품을 자동 감지해 누락을 알림으로 방지하는 IoT 융합 시스템입니다. AWS 인프라를 활용하여 데이터 수집, 처리, 알림을 자동화합니다.',
      roles: [
        'AWS 인프라 설계 및 구축 담당 (Lambda, RDS, S3, CloudFront, EventBridge)',
        'IoT 센서 데이터 수집 파이프라인 설계',
        'EventBridge 기반 스케줄링 및 Lambda 이벤트 처리',
        'CloudFront를 통한 정적 대시보드 배포',
        'Notion 기반 프로젝트 문서화 및 팀 협업 주도',
        'RFID 센서 연동 및 임베디드 시스템 테스트',
      ],
      achievements: [
        { value: '6+', label: 'AWS 서비스' },
        { value: '4명', label: '팀 규모' },
        { value: '진행중', label: '상태' },
        { value: 'IoT', label: '융합 프로젝트' },
      ],
      tags: [
        'AWS Lambda',
        'AWS RDS',
        'AWS S3',
        'CloudFront',
        'EventBridge',
        'IoT',
        'RFID / 센서',
        '임베디드',
      ],
      diagram: 'smartscan-hub',
      diagramImage: 'images/iot-diagram.png',
      links: {
        github: 'https://github.com/hwchany0ung',
        notion:
          'https://www.notion.so/IOT-318c28606b3f801e90b3dad2018a518f',
      },
    },
    'portfolio-aws': {
      type: 'Cloud / AWS Static Hosting',
      badge: 'personal',
      period: '2026. 03',
      title: '포트폴리오 웹사이트 AWS 배포',
      subtitle:
        'AWS S3 정적 호스팅, Route53 도메인, CloudFront CDN을 연동해 이 포트폴리오 사이트를 배포한 프로젝트입니다. ACM으로 HTTPS를 적용했습니다.',
      roles: [
        'S3 버킷 생성 및 정적 웹사이트 호스팅 설정',
        'Route53 커스텀 도메인(hwchanyoung.dev) 연결',
        'CloudFront CDN 배포 및 캐시 정책 설정',
        'ACM SSL 인증서 발급 및 HTTPS 적용',
        'GitHub Actions CI/CD 파이프라인 구축',
        '반응형 웹 디자인 및 프론트엔드 개발',
      ],
      achievements: [
        { value: 'HTTPS', label: 'ACM 인증서' },
        { value: 'CDN', label: 'CloudFront' },
        { value: '자동화', label: 'CI/CD' },
        { value: '1인', label: '개인 프로젝트' },
      ],
      tags: ['AWS S3', 'Route53', 'CloudFront', 'ACM (HTTPS)', 'HTML / CSS / JS'],
      diagram: null,
      links: {
        github: 'https://github.com/hwchany0ung',
        live: 'https://hwchanyoung.dev',
      },
    },
  };

  // ── SVG Architecture Diagram (Inline) ────────────────────────────
  const DIAGRAMS = {
    'devnavi': `
      <svg viewBox="0 0 800 360" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;max-height:320px;">
        <defs>
          <linearGradient id="devGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#00d4ff" stop-opacity="0.15"/>
            <stop offset="100%" stop-color="#7b2ff7" stop-opacity="0.15"/>
          </linearGradient>
          <marker id="dArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="#00d4ff" opacity="0.6"/>
          </marker>
          <marker id="dArrowP" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="#a78bfa" opacity="0.6"/>
          </marker>
        </defs>

        <rect x="5" y="5" width="790" height="350" rx="12" fill="#111" stroke="#2a2a2a"/>

        <!-- User -->
        <rect x="20" y="140" width="110" height="80" rx="8" fill="#161616" stroke="#2a2a2a"/>
        <text x="75" y="170" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="10" fill="#606060">User</text>
        <text x="75" y="195" text-anchor="middle" font-size="22">👤</text>
        <text x="75" y="214" text-anchor="middle" font-family="Noto Sans KR,sans-serif" font-size="8" fill="#404040">취업준비생</text>

        <!-- Arrow User -> CloudFront -->
        <line x1="130" y1="180" x2="175" y2="180" stroke="#00d4ff" stroke-width="1.5" stroke-opacity="0.5" marker-end="url(#dArrow)"/>

        <!-- Frontend CloudFront -->
        <rect x="175" y="50" width="540" height="280" rx="10" fill="url(#devGrad)" stroke="#00d4ff" stroke-opacity="0.25" stroke-dasharray="6,4"/>
        <text x="195" y="72" font-family="JetBrains Mono,monospace" font-size="10" fill="#00d4ff" opacity="0.6">AWS Cloud (ap-northeast-2)</text>

        <!-- CloudFront Frontend -->
        <rect x="195" y="90" width="120" height="55" rx="8" fill="#0d0d20" stroke="#7b2ff7" stroke-opacity="0.5"/>
        <text x="255" y="114" text-anchor="middle" font-size="16">🌐</text>
        <text x="255" y="132" font-family="JetBrains Mono,monospace" font-size="8.5" fill="#a78bfa" text-anchor="middle">CloudFront</text>
        <text x="255" y="143" font-family="JetBrains Mono,monospace" font-size="7" fill="#404060" text-anchor="middle">devnavi.kr</text>

        <!-- S3 Frontend -->
        <rect x="195" y="170" width="120" height="55" rx="8" fill="#1a1500" stroke="#ff9900" stroke-opacity="0.4"/>
        <text x="255" y="194" text-anchor="middle" font-size="16">📦</text>
        <text x="255" y="212" font-family="JetBrains Mono,monospace" font-size="8.5" fill="#ff9900" text-anchor="middle">S3</text>
        <text x="255" y="223" font-family="JetBrains Mono,monospace" font-size="7" fill="#604000" text-anchor="middle">React + Vite</text>

        <!-- CF -> S3 -->
        <line x1="255" y1="145" x2="255" y2="170" stroke="#a78bfa" stroke-width="1.2" stroke-opacity="0.4" marker-end="url(#dArrowP)"/>

        <!-- CF Frontend -> CF API -->
        <line x1="315" y1="117" x2="375" y2="117" stroke="#00d4ff" stroke-width="1.2" stroke-opacity="0.4" marker-end="url(#dArrow)"/>

        <!-- CloudFront API -->
        <rect x="375" y="90" width="120" height="55" rx="8" fill="#0d0d20" stroke="#7b2ff7" stroke-opacity="0.5"/>
        <text x="435" y="114" text-anchor="middle" font-size="16">⚡</text>
        <text x="435" y="132" font-family="JetBrains Mono,monospace" font-size="8.5" fill="#a78bfa" text-anchor="middle">CloudFront</text>
        <text x="435" y="143" font-family="JetBrains Mono,monospace" font-size="7" fill="#404060" text-anchor="middle">api.devnavi.kr</text>

        <!-- Lambda -->
        <rect x="375" y="170" width="120" height="55" rx="8" fill="#1a0a2e" stroke="#7b2ff7" stroke-opacity="0.5"/>
        <text x="435" y="194" text-anchor="middle" font-size="16">λ</text>
        <text x="435" y="212" font-family="JetBrains Mono,monospace" font-size="8.5" fill="#a78bfa" text-anchor="middle">Lambda</text>
        <text x="435" y="223" font-family="JetBrains Mono,monospace" font-size="7" fill="#6040a0" text-anchor="middle">FastAPI + Mangum</text>

        <!-- CF API -> Lambda -->
        <line x1="435" y1="145" x2="435" y2="170" stroke="#a78bfa" stroke-width="1.2" stroke-opacity="0.4" marker-end="url(#dArrowP)"/>

        <!-- Claude API -->
        <rect x="555" y="90" width="120" height="55" rx="8" fill="#1a0800" stroke="#f5a623" stroke-opacity="0.5"/>
        <text x="615" y="114" text-anchor="middle" font-size="16">🤖</text>
        <text x="615" y="132" font-family="JetBrains Mono,monospace" font-size="8.5" fill="#f5a623" text-anchor="middle">Claude API</text>
        <text x="615" y="143" font-family="JetBrains Mono,monospace" font-size="7" fill="#7a5010" text-anchor="middle">Sonnet + Haiku SSE</text>

        <!-- Lambda -> Claude -->
        <line x1="495" y1="197" x2="555" y2="117" stroke="#f5a623" stroke-width="1.5" stroke-opacity="0.5" marker-end="url(#dArrow)"/>

        <!-- Supabase -->
        <rect x="555" y="170" width="120" height="55" rx="8" fill="#0d1117" stroke="#28ca41" stroke-opacity="0.4"/>
        <text x="615" y="194" text-anchor="middle" font-size="16">🗄️</text>
        <text x="615" y="212" font-family="JetBrains Mono,monospace" font-size="8.5" fill="#28ca41" text-anchor="middle">Supabase</text>
        <text x="615" y="223" font-family="JetBrains Mono,monospace" font-size="7" fill="#1a6040" text-anchor="middle">PostgreSQL + Auth</text>

        <!-- Lambda -> Supabase -->
        <line x1="495" y1="207" x2="555" y2="207" stroke="#28ca41" stroke-width="1.2" stroke-opacity="0.4" marker-end="url(#dArrow)"/>

        <!-- SSM -->
        <rect x="555" y="253" width="120" height="50" rx="8" fill="#161616" stroke="#00d4ff" stroke-opacity="0.25"/>
        <text x="615" y="275" text-anchor="middle" font-size="14">🔑</text>
        <text x="615" y="292" font-family="JetBrains Mono,monospace" font-size="8" fill="#404060" text-anchor="middle">SSM Parameter</text>

        <!-- Lambda -> SSM -->
        <line x1="435" y1="225" x2="435" y2="265" stroke="#00d4ff" stroke-width="1" stroke-opacity="0.2" stroke-dasharray="3,3"/>
        <line x1="435" y1="265" x2="555" y2="278" stroke="#00d4ff" stroke-width="1" stroke-opacity="0.2" stroke-dasharray="3,3" marker-end="url(#dArrow)"/>

        <!-- GitHub Actions label -->
        <rect x="195" y="255" width="160" height="45" rx="6" fill="rgba(40,202,65,0.04)" stroke="#28ca41" stroke-opacity="0.2"/>
        <text x="275" y="274" font-family="JetBrains Mono,monospace" font-size="8.5" fill="#28ca41" text-anchor="middle">GitHub Actions CI/CD</text>
        <text x="275" y="290" font-family="Noto Sans KR,sans-serif" font-size="8" fill="#28ca41" text-anchor="middle" opacity="0.6">Terraform IaC · 4-job Pipeline</text>

        <!-- Title -->
        <text x="400" y="342" font-family="JetBrains Mono,monospace" font-size="9" fill="#404040" text-anchor="middle">DevNavi — AI Career Roadmap (AWS Serverless Architecture)</text>
      </svg>
    `,
    'smartscan-hub': `
      <svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;max-height:350px;">
        <defs>
          <linearGradient id="awsGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#00d4ff" stop-opacity="0.2"/>
            <stop offset="100%" stop-color="#7b2ff7" stop-opacity="0.2"/>
          </linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="2" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        <!-- Background -->
        <rect x="10" y="10" width="780" height="380" rx="12" fill="#111" stroke="#2a2a2a"/>

        <!-- AWS Cloud boundary -->
        <rect x="230" y="30" width="550" height="350" rx="10" fill="url(#awsGrad)" stroke="#00d4ff" stroke-opacity="0.3" stroke-dasharray="6,4"/>
        <text x="250" y="55" font-family="JetBrains Mono,monospace" font-size="11" fill="#00d4ff" opacity="0.7">AWS Cloud (ap-northeast-2)</text>

        <!-- IoT Sensors -->
        <rect x="30" y="120" width="160" height="160" rx="8" fill="#1a1a0a" stroke="#ffbd2e" stroke-opacity="0.4"/>
        <text x="110" y="148" font-family="JetBrains Mono,monospace" font-size="10" fill="#ffbd2e" text-anchor="middle">IoT Sensors</text>
        <text x="110" y="178" font-size="28" text-anchor="middle">📡</text>
        <text x="110" y="205" font-family="Noto Sans KR,sans-serif" font-size="9" fill="#a0a0a0" text-anchor="middle">RFID Reader</text>
        <text x="110" y="222" font-family="Noto Sans KR,sans-serif" font-size="9" fill="#a0a0a0" text-anchor="middle">Weight Sensor</text>
        <text x="110" y="239" font-family="Noto Sans KR,sans-serif" font-size="9" fill="#a0a0a0" text-anchor="middle">Raspberry Pi</text>
        <text x="110" y="256" font-family="Noto Sans KR,sans-serif" font-size="9" fill="#a0a0a0" text-anchor="middle">Arduino</text>

        <!-- Arrow: Sensors -> Lambda -->
        <line x1="190" y1="200" x2="280" y2="155" stroke="#ffbd2e" stroke-width="1.5" stroke-opacity="0.6" marker-end="url(#arrowY)"/>
        <defs><marker id="arrowY" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#ffbd2e" opacity="0.6"/></marker></defs>

        <!-- Lambda -->
        <rect x="280" y="100" width="130" height="60" rx="8" fill="#1a0a2e" stroke="#7b2ff7" stroke-opacity="0.5"/>
        <text x="345" y="125" font-size="18" text-anchor="middle">&#9889;</text>
        <text x="345" y="148" font-family="JetBrains Mono,monospace" font-size="10" fill="#a78bfa" text-anchor="middle">Lambda</text>

        <!-- EventBridge -->
        <rect x="280" y="190" width="130" height="60" rx="8" fill="#0d1a17" stroke="#28ca41" stroke-opacity="0.4"/>
        <text x="345" y="215" font-size="18" text-anchor="middle">&#128337;</text>
        <text x="345" y="238" font-family="JetBrains Mono,monospace" font-size="10" fill="#28ca41" text-anchor="middle">EventBridge</text>

        <!-- Arrow: EventBridge -> Lambda -->
        <line x1="345" y1="190" x2="345" y2="160" stroke="#28ca41" stroke-width="1.5" stroke-opacity="0.5" marker-end="url(#arrowG)"/>
        <defs><marker id="arrowG" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#28ca41" opacity="0.5"/></marker></defs>

        <!-- RDS -->
        <rect x="460" y="80" width="130" height="65" rx="8" fill="#0d1117" stroke="#00d4ff" stroke-opacity="0.4"/>
        <text x="525" y="108" font-size="18" text-anchor="middle">&#128451;</text>
        <text x="525" y="132" font-family="JetBrains Mono,monospace" font-size="10" fill="#00d4ff" text-anchor="middle">RDS (MySQL)</text>

        <!-- Arrow: Lambda -> RDS -->
        <line x1="410" y1="125" x2="460" y2="115" stroke="#00d4ff" stroke-width="1.5" stroke-opacity="0.5" marker-end="url(#arrowC)"/>
        <defs><marker id="arrowC" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#00d4ff" opacity="0.5"/></marker></defs>

        <!-- S3 -->
        <rect x="460" y="175" width="130" height="65" rx="8" fill="#1a1500" stroke="#ff9900" stroke-opacity="0.4"/>
        <text x="525" y="203" font-size="18" text-anchor="middle">&#128230;</text>
        <text x="525" y="227" font-family="JetBrains Mono,monospace" font-size="10" fill="#ff9900" text-anchor="middle">S3 Bucket</text>

        <!-- Arrow: Lambda -> S3 -->
        <line x1="410" y1="140" x2="460" y2="200" stroke="#ff9900" stroke-width="1.5" stroke-opacity="0.5" marker-end="url(#arrowO)"/>
        <defs><marker id="arrowO" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#ff9900" opacity="0.5"/></marker></defs>

        <!-- CloudFront -->
        <rect x="640" y="80" width="130" height="65" rx="8" fill="#0d0d20" stroke="#7b2ff7" stroke-opacity="0.4"/>
        <text x="705" y="108" font-size="18" text-anchor="middle">&#127760;</text>
        <text x="705" y="132" font-family="JetBrains Mono,monospace" font-size="10" fill="#a78bfa" text-anchor="middle">CloudFront</text>

        <!-- Arrow: S3 -> CloudFront -->
        <line x1="590" y1="195" x2="640" y2="120" stroke="#7b2ff7" stroke-width="1.5" stroke-opacity="0.5" marker-end="url(#arrowP)"/>
        <defs><marker id="arrowP" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#7b2ff7" opacity="0.5"/></marker></defs>

        <!-- SNS / Notification -->
        <rect x="460" y="280" width="130" height="65" rx="8" fill="#1a0d0d" stroke="#ff5f57" stroke-opacity="0.4"/>
        <text x="525" y="308" font-size="18" text-anchor="middle">&#128276;</text>
        <text x="525" y="332" font-family="JetBrains Mono,monospace" font-size="10" fill="#ff5f57" text-anchor="middle">SNS (Alert)</text>

        <!-- Arrow: Lambda -> SNS -->
        <line x1="370" y1="160" x2="460" y2="305" stroke="#ff5f57" stroke-width="1.5" stroke-opacity="0.5" stroke-dasharray="4,3" marker-end="url(#arrowR)"/>
        <defs><marker id="arrowR" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#ff5f57" opacity="0.5"/></marker></defs>

        <!-- User -->
        <rect x="640" y="270" width="130" height="65" rx="8" fill="#161616" stroke="#2a2a2a"/>
        <text x="705" y="298" font-size="18" text-anchor="middle">&#128100;</text>
        <text x="705" y="322" font-family="JetBrains Mono,monospace" font-size="10" fill="#a0a0a0" text-anchor="middle">User / Dashboard</text>

        <!-- Arrow: CloudFront -> User -->
        <line x1="705" y1="145" x2="705" y2="270" stroke="#a0a0a0" stroke-width="1.5" stroke-opacity="0.3" marker-end="url(#arrowW)"/>
        <defs><marker id="arrowW" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#a0a0a0" opacity="0.3"/></marker></defs>

        <!-- Arrow: SNS -> User -->
        <line x1="590" y1="310" x2="640" y2="300" stroke="#ff5f57" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,3" marker-end="url(#arrowR2)"/>
        <defs><marker id="arrowR2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#ff5f57" opacity="0.3"/></marker></defs>

        <!-- Arrow: Sensors -> EventBridge -->
        <line x1="190" y1="210" x2="280" y2="215" stroke="#28ca41" stroke-width="1.5" stroke-opacity="0.4" marker-end="url(#arrowG)"/>

        <!-- Title -->
        <text x="400" y="375" font-family="JetBrains Mono,monospace" font-size="9" fill="#606060" text-anchor="middle">SmartScan Hub IoT Architecture (AWS)</text>
      </svg>
    `,
    'motion-webcam': `
      <svg viewBox="0 0 800 320" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;max-height:300px;">
        <defs>
          <linearGradient id="awsGrad2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#00d4ff" stop-opacity="0.15"/>
            <stop offset="100%" stop-color="#7b2ff7" stop-opacity="0.15"/>
          </linearGradient>
        </defs>

        <!-- Background -->
        <rect x="5" y="5" width="790" height="310" rx="12" fill="#111" stroke="#2a2a2a"/>

        <!-- Edge Device -->
        <rect x="20" y="80" width="150" height="150" rx="8" fill="#161616" stroke="#ffbd2e" stroke-opacity="0.4"/>
        <text x="95" y="108" font-family="JetBrains Mono,monospace" font-size="10" fill="#ffbd2e" text-anchor="middle">Edge Gateway</text>
        <text x="95" y="150" font-size="24" text-anchor="middle">&#128247;</text>
        <text x="95" y="175" font-family="Noto Sans KR,sans-serif" font-size="9" fill="#a0a0a0" text-anchor="middle">Rocky Linux VM</text>
        <text x="95" y="192" font-family="Noto Sans KR,sans-serif" font-size="9" fill="#a0a0a0" text-anchor="middle">Docker + OpenCV</text>
        <text x="95" y="209" font-family="Noto Sans KR,sans-serif" font-size="9" fill="#a0a0a0" text-anchor="middle">Motion Detection</text>

        <!-- AWS Cloud -->
        <rect x="220" y="25" width="560" height="270" rx="10" fill="url(#awsGrad2)" stroke="#00d4ff" stroke-opacity="0.3" stroke-dasharray="6,4"/>
        <text x="240" y="48" font-family="JetBrains Mono,monospace" font-size="10" fill="#00d4ff" opacity="0.7">AWS Cloud</text>

        <!-- S3 -->
        <rect x="250" y="90" width="120" height="55" rx="8" fill="#1a1500" stroke="#ff9900" stroke-opacity="0.4"/>
        <text x="310" y="115" font-size="16" text-anchor="middle">&#128230;</text>
        <text x="310" y="135" font-family="JetBrains Mono,monospace" font-size="9" fill="#ff9900" text-anchor="middle">S3 (Video)</text>

        <!-- VPC Endpoint -->
        <rect x="250" y="170" width="120" height="45" rx="8" fill="#0d1117" stroke="#28ca41" stroke-opacity="0.3"/>
        <text x="310" y="198" font-family="JetBrains Mono,monospace" font-size="8" fill="#28ca41" text-anchor="middle">Gateway Endpoint</text>

        <!-- Lambda -->
        <rect x="420" y="75" width="120" height="55" rx="8" fill="#1a0a2e" stroke="#7b2ff7" stroke-opacity="0.5"/>
        <text x="480" y="100" font-size="16" text-anchor="middle">&#9889;</text>
        <text x="480" y="120" font-family="JetBrains Mono,monospace" font-size="9" fill="#a78bfa" text-anchor="middle">Lambda</text>

        <!-- RDS -->
        <rect x="420" y="160" width="120" height="55" rx="8" fill="#0d1117" stroke="#00d4ff" stroke-opacity="0.4"/>
        <text x="480" y="185" font-size="16" text-anchor="middle">&#128451;</text>
        <text x="480" y="205" font-family="JetBrains Mono,monospace" font-size="9" fill="#00d4ff" text-anchor="middle">RDS (MySQL)</text>

        <!-- CloudFront -->
        <rect x="590" y="75" width="120" height="55" rx="8" fill="#0d0d20" stroke="#7b2ff7" stroke-opacity="0.4"/>
        <text x="650" y="100" font-size="16" text-anchor="middle">&#127760;</text>
        <text x="650" y="120" font-family="JetBrains Mono,monospace" font-size="9" fill="#a78bfa" text-anchor="middle">CloudFront</text>

        <!-- Cost label -->
        <rect x="590" y="170" width="160" height="50" rx="8" fill="rgba(40,202,65,0.05)" stroke="#28ca41" stroke-opacity="0.3"/>
        <text x="670" y="193" font-family="JetBrains Mono,monospace" font-size="10" fill="#28ca41" text-anchor="middle" font-weight="bold">Cost: $0/mo</text>
        <text x="670" y="210" font-family="Noto Sans KR,sans-serif" font-size="8" fill="#28ca41" text-anchor="middle" opacity="0.7">NAT -> Endpoint 전환</text>

        <!-- Arrows -->
        <line x1="170" y1="155" x2="250" y2="120" stroke="#ff9900" stroke-width="1.5" stroke-opacity="0.5"/>
        <line x1="310" y1="170" x2="310" y2="145" stroke="#28ca41" stroke-width="1" stroke-opacity="0.3"/>
        <line x1="370" y1="115" x2="420" y2="100" stroke="#7b2ff7" stroke-width="1.5" stroke-opacity="0.5"/>
        <line x1="480" y1="130" x2="480" y2="160" stroke="#00d4ff" stroke-width="1.5" stroke-opacity="0.5"/>
        <line x1="540" y1="95" x2="590" y2="95" stroke="#7b2ff7" stroke-width="1.5" stroke-opacity="0.5"/>

        <text x="400" y="295" font-family="JetBrains Mono,monospace" font-size="9" fill="#606060" text-anchor="middle">Motion-WebCam Serverless Architecture</text>
      </svg>
    `,
  };

  // ── GitHub SVG Icon ────────────────────────────────────────────
  const GITHUB_SVG =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>';

  // ── Create Modal HTML ──────────────────────────────────────────
  function createModalHTML() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'project-modal';
    overlay.innerHTML = `
      <div class="modal-container" role="dialog" aria-modal="true">
        <button class="modal-close" aria-label="Close">&times;</button>
        <div class="modal-header">
          <div class="modal-badge-row">
            <span class="modal-project-type" id="modal-type"></span>
            <span class="modal-period" id="modal-period"></span>
          </div>
          <h2 class="modal-title" id="modal-title"></h2>
          <p class="modal-subtitle" id="modal-subtitle"></p>
        </div>
        <div class="modal-body">
          <div class="modal-section" id="modal-roles-section">
            <div class="modal-section-title">My Role & Contributions</div>
            <ul class="modal-list" id="modal-roles"></ul>
          </div>
          <div class="modal-section" id="modal-metrics-section">
            <div class="modal-section-title">Key Metrics</div>
            <div class="modal-metrics" id="modal-metrics"></div>
          </div>
          <div class="modal-section" id="modal-diagram-section">
            <div class="modal-section-title">Architecture</div>
            <div class="modal-diagram" id="modal-diagram"></div>
            <p class="modal-diagram-caption" id="modal-diagram-caption"></p>
          </div>
          <div class="modal-section" id="modal-tags-section">
            <div class="modal-section-title">Tech Stack</div>
            <div class="modal-tags" id="modal-tags"></div>
          </div>
          <div class="modal-links" id="modal-links"></div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  // ── Open Modal ─────────────────────────────────────────────────
  function openModal(projectId) {
    const project = PROJECTS[projectId];
    if (!project) return;

    let overlay = document.getElementById('project-modal');
    if (!overlay) {
      overlay = createModalHTML();
    }

    // Fill data
    document.getElementById('modal-type').textContent = project.type;
    document.getElementById('modal-period').textContent = project.period;
    document.getElementById('modal-title').textContent = project.title;
    document.getElementById('modal-subtitle').textContent = project.subtitle;

    // Roles
    const rolesEl = document.getElementById('modal-roles');
    rolesEl.innerHTML = project.roles.map((r) => `<li>${r}</li>`).join('');

    // Metrics
    const metricsEl = document.getElementById('modal-metrics');
    metricsEl.innerHTML = project.achievements
      .map(
        (m) => `
        <div class="modal-metric">
          <div class="modal-metric-value">${m.value}</div>
          <div class="modal-metric-label">${m.label}</div>
        </div>
      `
      )
      .join('');

    // Diagram
    const diagramSection = document.getElementById('modal-diagram-section');
    const diagramEl = document.getElementById('modal-diagram');
    const captionEl = document.getElementById('modal-diagram-caption');

    if (project.diagram && DIAGRAMS[project.diagram]) {
      diagramSection.style.display = '';
      diagramEl.innerHTML = DIAGRAMS[project.diagram];
      captionEl.textContent = project.title + ' - AWS Architecture';
    } else if (project.diagramImage) {
      diagramSection.style.display = '';
      diagramEl.innerHTML = `<img src="${project.diagramImage}" alt="${project.title} Architecture" loading="lazy" />`;
      captionEl.textContent = project.title + ' - Architecture';
    } else {
      diagramSection.style.display = 'none';
    }

    // Tags
    const tagsEl = document.getElementById('modal-tags');
    tagsEl.innerHTML = project.tags.map((t) => `<span class="tag">${t}</span>`).join('');

    // Links
    const linksEl = document.getElementById('modal-links');
    let linksHTML = '';
    if (project.links.github) {
      linksHTML += `<a href="${project.links.github}" target="_blank" class="modal-link">${GITHUB_SVG} GitHub</a>`;
    }
    if (project.links.notion) {
      linksHTML += `<a href="${project.links.notion}" target="_blank" class="modal-link">&#128196; Notion</a>`;
    }
    if (project.links.live) {
      linksHTML += `<a href="${project.links.live}" target="_blank" class="modal-link">&#127760; Live Site</a>`;
    }
    linksEl.innerHTML = linksHTML;

    // Show
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Focus trap
    overlay.querySelector('.modal-close').focus();
  }

  // ── Close Modal ────────────────────────────────────────────────
  function closeModal() {
    const overlay = document.getElementById('project-modal');
    if (!overlay) return;

    overlay.classList.add('closing');
    setTimeout(() => {
      overlay.classList.remove('open', 'closing');
      document.body.style.overflow = '';
    }, 300);
  }

  // ── Event Binding ──────────────────────────────────────────────
  function init() {
    // Add click handlers to project cards
    const cards = document.querySelectorAll('.project-card[data-project]');
    cards.forEach((card) => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        // Don't open modal if clicking a link
        if (e.target.closest('a')) return;
        // Don't open modal if clicking diagram thumb (lightbox handles it)
        if (e.target.closest('.diagram-thumb')) return;

        const projectId = card.dataset.project;
        openModal(projectId);
      });
    });

    // Close handlers
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) closeModal();
      if (e.target.classList.contains('modal-close')) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for programmatic use
  window.openProjectModal = openModal;
  window.closeProjectModal = closeModal;
})();
