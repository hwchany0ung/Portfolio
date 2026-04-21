/* Mermaid initialization — dark theme matching portfolio palette */
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

mermaid.initialize({
  startOnLoad: true,
  theme: 'base',
  securityLevel: 'loose',
  fontFamily: "'Noto Sans KR', 'JetBrains Mono', sans-serif",
  themeVariables: {
    // 전역 배경
    background: '#0a0a0a',
    mainBkg: '#161616',
    secondBkg: '#1f1f1f',
    tertiaryBkg: '#2a2a2a',

    // 노드/텍스트
    primaryColor: '#161616',
    primaryTextColor: '#e0e0e0',
    primaryBorderColor: '#00d4ff',
    secondaryColor: '#1a1f2e',
    secondaryTextColor: '#e0e0e0',
    secondaryBorderColor: '#e2b714',
    tertiaryColor: '#2a2a2a',
    tertiaryTextColor: '#c0c0c0',
    tertiaryBorderColor: '#3a3a3a',

    // 엣지/라인
    lineColor: '#6a6a6a',
    textColor: '#e0e0e0',
    labelTextColor: '#00d4ff',
    edgeLabelBackground: '#161616',

    // 노트
    noteBkgColor: '#1f1a0a',
    noteBorderColor: '#e2b714',
    noteTextColor: '#e0e0e0',

    // Sequence
    actorBkg: '#161616',
    actorBorder: '#00d4ff',
    actorTextColor: '#e0e0e0',
    actorLineColor: '#6a6a6a',
    signalColor: '#e0e0e0',
    signalTextColor: '#e0e0e0',
    labelBoxBkgColor: '#161616',
    labelBoxBorderColor: '#00d4ff',
    labelTextColor: '#00d4ff',
    loopTextColor: '#e0e0e0',
    activationBkgColor: '#1a1f2e',
    activationBorderColor: '#00d4ff',
    sequenceNumberColor: '#0a0a0a',

    // State
    transitionColor: '#6a6a6a',
    transitionLabelColor: '#00d4ff',
    stateLabelColor: '#e0e0e0',
    stateBkg: '#161616',
    altBackground: '#1f1f1f',
    compositeBackground: '#0a0a0a',
    compositeBorder: '#e2b714',
    compositeTitleBackground: '#161616',

    // Flowchart
    nodeBorder: '#00d4ff',
    clusterBkg: '#11141a',
    clusterBorder: '#e2b714',
    defaultLinkColor: '#8a8a8a',
    titleColor: '#00d4ff',

    // ER
    attributeBackgroundColorOdd: '#161616',
    attributeBackgroundColorEven: '#1a1a1a'
  },
  flowchart: { curve: 'basis', htmlLabels: true, padding: 14 },
  sequence: { actorMargin: 60, boxMargin: 10, messageMargin: 35, mirrorActors: false },
  state: { titleTopMargin: 20 }
});

// 페이지당 초기화 시점 문제 방지 — DOM 준비 후 명시적 render
document.addEventListener('DOMContentLoaded', () => {
  try { mermaid.run({ querySelector: '.mermaid' }); } catch (e) { console.warn('mermaid run:', e); }
});
