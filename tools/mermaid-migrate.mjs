// Mermaid migration — SVG → <div class="mermaid"> 블록 순차 치환
// Usage: node tools/mermaid-migrate.mjs <file> <mermaidArrayJson>
// JSON: ["mermaid1", "mermaid2", ...]  (파일 내 <svg> 등장 순서와 1:1)

import fs from 'node:fs';
import path from 'node:path';

const [,, target, mapPath] = process.argv;
if (!target || !mapPath) {
  console.error('usage: node mermaid-migrate.mjs <file> <mapFile>');
  process.exit(1);
}

let html = fs.readFileSync(target, 'utf8');
const arr = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

// 1) <head>에 mermaid.css 주입
if (!html.includes('css/mermaid.css')) {
  html = html.replace(
    /<link rel="stylesheet" href="\.\.\/css\/notes\.css" \/>/,
    m => `${m}\n  <link rel="stylesheet" href="../css/mermaid.css" />`,
  );
}

// 2) </body> 앞에 mermaid-init.js 주입
if (!html.includes('js/mermaid-init.js')) {
  html = html.replace(
    /(\s*)<\/body>/,
    `$1  <script type="module" src="../js/mermaid-init.js"></script>\n$1</body>`,
  );
}

// 3) <svg>…</svg> 블록을 순차적으로 치환
const svgRe = /<svg\b[\s\S]*?<\/svg>/g;
const matches = [...html.matchAll(svgRe)];
if (matches.length !== arr.length) {
  console.error(`✗ SVG 개수 불일치: 파일=${matches.length} 매핑=${arr.length}`);
  process.exit(1);
}

let out = '';
let cursor = 0;
matches.forEach((m, i) => {
  out += html.slice(cursor, m.index);
  out += `<div class="mermaid">\n${arr[i].trim()}\n            </div>`;
  cursor = m.index + m[0].length;
});
out += html.slice(cursor);

fs.writeFileSync(target, out, 'utf8');
console.log(`✓ ${path.basename(target)} — ${matches.length} SVG 치환`);
