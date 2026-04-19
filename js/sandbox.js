/* sandbox.js — 브라우저 내 가짜 터미널 시뮬레이터
 *
 * 사용법:
 *   1) 페이지에 <div id="sandbox-root"></div> 배치
 *   2) window.SANDBOX_CONFIG = { prompt, banner, commands: {...}, challenges: [...], links: [...] }
 *   3) <script src="../js/sandbox.js"></script>
 *
 * commands: 배열 형태
 *   { match: /^docker ps$/, run: (ctx, args) => '출력 문자열' }
 * 내장 명령: help, clear, history
 */

(function () {
  'use strict';

  const ROOT_ID = 'sandbox-root';

  // 외부 API: 다른 페이지(예: practice.html)에서 탭 전환 시 재마운트
  window.Sandbox = {
    mount(rootEl, cfg) {
      if (!rootEl || !cfg) return;
      rootEl.innerHTML = '';
      rootEl.className = '';
      initSandbox(rootEl, cfg);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById(ROOT_ID);
    const cfg = window.SANDBOX_CONFIG;
    if (!root || !cfg) return;
    initSandbox(root, cfg);
  });

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function initSandbox(root, cfg) {
    const state = {
      history: [],
      histIdx: -1,
      state: cfg.initialState ? JSON.parse(JSON.stringify(cfg.initialState)) : {},
      challenge: null,
      challengeIdx: -1
    };

    root.classList.add('sb-wrap');
    root.innerHTML = `
      <div class="sb-head">
        <div class="sb-title">
          <span class="sb-dot r"></span><span class="sb-dot y"></span><span class="sb-dot g"></span>
          <span class="sb-titletxt">${cfg.title || '실습 터미널'}</span>
        </div>
        <div class="sb-actions">
          <button class="sb-btn" data-act="help">help</button>
          <button class="sb-btn" data-act="clear">clear</button>
          <button class="sb-btn" data-act="reset">reset</button>
        </div>
      </div>
      <div class="sb-body">
        <div class="sb-output" id="sb-out"></div>
        <div class="sb-line">
          <span class="sb-prompt">${cfg.prompt || '$'}</span>
          <input class="sb-input" id="sb-in" autocomplete="off" spellcheck="false" autocapitalize="off" />
        </div>
      </div>
      ${cfg.challenges && cfg.challenges.length ? `
      <div class="sb-challenge" id="sb-challenge">
        <div class="sb-ch-head">
          <span class="sb-ch-label">🎯 챌린지</span>
          <span class="sb-ch-title" id="sb-ch-title">시작하려면 아래 버튼을 누르세요</span>
          <span class="sb-ch-status" id="sb-ch-status"></span>
        </div>
        <div class="sb-ch-actions">
          <button class="sb-btn primary" id="sb-ch-start">챌린지 시작</button>
          <button class="sb-btn" id="sb-ch-hint">힌트</button>
          <button class="sb-btn" id="sb-ch-next">다음</button>
          <button class="sb-btn" id="sb-ch-skip">건너뛰기</button>
        </div>
        <div class="sb-ch-hint" id="sb-ch-hintbox" hidden></div>
      </div>` : ''}
      ${cfg.links && cfg.links.length ? `
      <div class="sb-links">
        <div class="sb-links-title">🔗 진짜 환경에서 실습하기</div>
        <div class="sb-links-grid">
          ${cfg.links.map(l => `<a class="sb-link" href="${l.href}" target="_blank" rel="noopener"><strong>${l.name}</strong><span>${l.desc}</span></a>`).join('')}
        </div>
      </div>` : ''}
    `;

    const out = root.querySelector('#sb-out');
    const input = root.querySelector('#sb-in');

    function writeRaw(html) {
      out.insertAdjacentHTML('beforeend', html);
      out.scrollTop = out.scrollHeight;
    }
    function writePrompt(cmd) {
      writeRaw(`<div class="sb-ln"><span class="sb-p">${cfg.prompt || '$'}</span> <span class="sb-c">${escapeHtml(cmd)}</span></div>`);
    }
    function writeOut(txt, cls) {
      const c = cls ? ` ${cls}` : '';
      writeRaw(`<pre class="sb-o${c}">${escapeHtml(txt)}</pre>`);
    }
    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    // 배너
    if (cfg.banner) writeOut(cfg.banner, 'banner');

    function runCmd(raw) {
      const cmd = raw.trim();
      if (!cmd) return;
      state.history.push(cmd);
      state.histIdx = state.history.length;
      writePrompt(cmd);

      // 내장
      if (cmd === 'help') return showHelp();
      if (cmd === 'clear') { out.innerHTML = ''; return; }
      if (cmd === 'history') {
        writeOut(state.history.map((h, i) => `${String(i + 1).padStart(4, ' ')}  ${h}`).join('\n'));
        return;
      }

      // 매칭
      const cmds = cfg.commands || [];
      for (const entry of cmds) {
        const m = cmd.match(entry.match);
        if (m) {
          try {
            const res = entry.run({ state: state.state, write: writeOut, writeRaw }, m, cmd);
            if (typeof res === 'string') writeOut(res);
            else if (res && res.then) res.then(r => r && writeOut(r));
          } catch (err) {
            writeOut(String(err && err.message || err), 'err');
          }
          checkChallenge(cmd);
          return;
        }
      }

      writeOut(`${cmd.split(' ')[0]}: command not found (지원 명령어: help)`, 'err');
    }

    function showHelp() {
      const cmds = cfg.commands || [];
      const lines = ['사용 가능한 명령어 예시:', ''];
      (cfg.helpList || cmds.map(c => c.hint).filter(Boolean)).forEach(h => lines.push('  ' + h));
      lines.push('', '내장: help · clear · reset · history · ↑/↓로 이전 명령 탐색');
      writeOut(lines.join('\n'), 'info');
    }

    function checkChallenge(cmd) {
      if (state.challengeIdx < 0) return;
      const ch = cfg.challenges[state.challengeIdx];
      if (!ch) return;
      const ok = typeof ch.check === 'function'
        ? !!ch.check(cmd, state.state)
        : ch.answer instanceof RegExp ? ch.answer.test(cmd)
        : cmd === ch.answer;
      if (ok) {
        writeOut('✅ 통과! — ' + (ch.praise || '좋습니다.'), 'ok');
        markChallenge('통과 ✅', 'ok');
      }
    }

    function markChallenge(text, cls) {
      const s = root.querySelector('#sb-ch-status');
      if (!s) return;
      s.textContent = text;
      s.className = 'sb-ch-status ' + (cls || '');
    }

    function startChallenge(i) {
      state.challengeIdx = i;
      const ch = cfg.challenges[i];
      root.querySelector('#sb-ch-title').textContent = ch.goal;
      root.querySelector('#sb-ch-hintbox').hidden = true;
      markChallenge('진행 중', 'run');
      writeOut('🎯 챌린지: ' + ch.goal, 'task');
    }

    // 액션 버튼
    root.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => {
      const a = b.dataset.act;
      if (a === 'help') runCmd('help');
      if (a === 'clear') runCmd('clear');
      if (a === 'reset') {
        state.state = cfg.initialState ? JSON.parse(JSON.stringify(cfg.initialState)) : {};
        out.innerHTML = '';
        if (cfg.banner) writeOut(cfg.banner, 'banner');
        writeOut('상태 초기화', 'info');
      }
    }));

    const chStart = root.querySelector('#sb-ch-start');
    const chNext = root.querySelector('#sb-ch-next');
    const chSkip = root.querySelector('#sb-ch-skip');
    const chHint = root.querySelector('#sb-ch-hint');
    if (chStart) chStart.addEventListener('click', () => startChallenge(0));
    if (chNext) chNext.addEventListener('click', () => {
      if (state.challengeIdx < 0) return startChallenge(0);
      const next = state.challengeIdx + 1;
      if (next >= cfg.challenges.length) {
        markChallenge('모든 챌린지 완료 🎉', 'ok');
        writeOut('🎉 모든 챌린지를 완료했습니다.', 'ok');
        state.challengeIdx = -1;
        return;
      }
      startChallenge(next);
    });
    if (chSkip) chSkip.addEventListener('click', () => {
      if (state.challengeIdx < 0) return;
      writeOut('⏭ 건너뜀', 'info');
      chNext.click();
    });
    if (chHint) chHint.addEventListener('click', () => {
      if (state.challengeIdx < 0) return;
      const ch = cfg.challenges[state.challengeIdx];
      const box = root.querySelector('#sb-ch-hintbox');
      box.textContent = '힌트: ' + (ch.hint || '아직 준비된 힌트가 없습니다.');
      box.hidden = false;
    });

    // Tab 자동완성
    function defaultCandidates(line, token, s) {
      // 1) 라인 맨 앞 단어: helpList 의 첫 단어
      const before = line.slice(0, line.length - token.length);
      if (!before.trim()) {
        const firstWords = (cfg.helpList || []).map(h => (h.split(/\s+/)[0] || '').replace(/[^\w\-]/g, ''));
        const builtins = ['help', 'clear', 'reset', 'history'];
        return Array.from(new Set([...builtins, ...firstWords])).filter(Boolean);
      }
      return [];
    }
    function handleTab() {
      const v = input.value;
      const pos = input.selectionStart || v.length;
      const left = v.slice(0, pos);
      const right = v.slice(pos);
      const tm = left.match(/(\S*)$/);
      const token = tm ? tm[1] : '';
      const prefix = left.slice(0, left.length - token.length);

      let cands = [];
      if (typeof cfg.complete === 'function') {
        try { cands = cfg.complete(token, left, state.state) || []; } catch (_) { cands = []; }
      }
      if (!cands.length) cands = defaultCandidates(left, token, state.state);

      const seen = new Set();
      const matches = cands.filter(c => c && c.startsWith(token) && !seen.has(c) && seen.add(c));
      if (!matches.length) return;
      if (matches.length === 1) {
        const done = matches[0];
        const suffix = right.startsWith(' ') || right === '' ? ' ' : '';
        input.value = prefix + done + suffix + right;
        const np = (prefix + done + suffix).length;
        input.selectionStart = input.selectionEnd = np;
        return;
      }
      // 공통 prefix 까지 확장
      const lcp = longestCommonPrefix(matches);
      if (lcp.length > token.length) {
        input.value = prefix + lcp + right;
        const np = (prefix + lcp).length;
        input.selectionStart = input.selectionEnd = np;
      }
      // 후보 목록 표시
      writePrompt(input.value);
      writeOut(matches.slice(0, 40).join('  ') + (matches.length > 40 ? `  ... +${matches.length - 40}` : ''), 'info');
    }
    function longestCommonPrefix(arr) {
      if (!arr.length) return '';
      let p = arr[0];
      for (let i = 1; i < arr.length; i++) {
        while (arr[i].indexOf(p) !== 0) { p = p.slice(0, -1); if (!p) return ''; }
      }
      return p;
    }

    // 입력 핸들링
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        handleTab();
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const v = input.value;
        input.value = '';
        runCmd(v);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (state.history.length && state.histIdx > 0) {
          state.histIdx--;
          input.value = state.history[state.histIdx] || '';
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (state.histIdx < state.history.length - 1) {
          state.histIdx++;
          input.value = state.history[state.histIdx] || '';
        } else {
          state.histIdx = state.history.length;
          input.value = '';
        }
      }
    });

    // 클릭 시 입력 포커스
    root.querySelector('.sb-body').addEventListener('click', (e) => {
      if (e.target.tagName !== 'A') input.focus();
    });
  }
})();
