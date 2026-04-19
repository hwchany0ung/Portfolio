/* notes.js — 허브 뷰 전환 + 개별 페이지 사이드바 스크롤 스파이 */

document.addEventListener('DOMContentLoaded', () => {
  initViewTabs();
  initStatusEditor();
  initTableRowNav();
  initScrollSpy();
  initSidebarNav();
});

/* 0. 진행 상태 뱃지 토글 — 클릭 시 시작 전 → 진행 중 → 완료 → 시작 전 */
function initStatusEditor() {
  const STORAGE_KEY = 'portfolio.notes.status';
  const cycle = [
    { cls: 'not-started', label: '시작 전' },
    { cls: 'in-progress', label: '진행 중' },
    { cls: 'done',        label: '완료' }
  ];

  const getKey = (badge) => {
    const card = badge.closest('a.notes-card');
    if (card) return card.getAttribute('href');
    const row = badge.closest('tr[data-href]');
    if (row) return row.dataset.href;
    return null;
  };

  const loadStore = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
  };
  const saveStore = (s) => localStorage.setItem(STORAGE_KEY, JSON.stringify(s));

  const applyBadge = (badge, cls) => {
    const st = cycle.find(c => c.cls === cls);
    if (!st) return;
    badge.classList.remove('not-started', 'in-progress', 'done');
    badge.classList.add(st.cls);
    badge.textContent = st.label;
  };

  const applyKey = (key, cls) => {
    document.querySelectorAll('.status-badge').forEach(b => {
      if (getKey(b) === key) applyBadge(b, cls);
    });
  };

  // 1) 저장된 상태 복원
  const store = loadStore();
  Object.keys(store).forEach(k => applyKey(k, store[k]));

  // 2) 편집 가능 힌트 + 클릭 토글
  document.querySelectorAll('.status-badge').forEach(badge => {
    const key = getKey(badge);
    if (!key) return;
    badge.style.cursor = 'pointer';
    badge.title = '클릭하여 상태 변경 (시작 전 → 진행 중 → 완료)';
    badge.setAttribute('role', 'button');
    badge.setAttribute('tabindex', '0');

    const toggle = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const current = cycle.find(c => badge.classList.contains(c.cls)) || cycle[0];
      const nextIdx = (cycle.indexOf(current) + 1) % cycle.length;
      const next = cycle[nextIdx];
      applyKey(key, next.cls);
      const s = loadStore();
      s[key] = next.cls;
      saveStore(s);
    };

    badge.addEventListener('click', toggle);
    badge.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') toggle(e);
    });
  });
}

/* 1. 한눈에 보기 ↔ 표 보기 탭 전환 */
function initViewTabs() {
  const tabs = document.querySelectorAll('.view-tab');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const view = tab.dataset.view;
      document.getElementById('view-gallery').style.display = view === 'gallery' ? 'grid' : 'none';
      document.getElementById('view-table').style.display  = view === 'table'   ? 'block' : 'none';
    });
  });
}

/* 2. 표 보기 행 클릭 → 페이지 이동 */
function initTableRowNav() {
  document.querySelectorAll('.notes-table tbody tr[data-href]').forEach(row => {
    row.addEventListener('click', () => {
      window.location.href = row.dataset.href;
    });
  });
}

/* 3. 사이드바 스크롤 스파이 (개별 페이지) */
function initScrollSpy() {
  const links = document.querySelectorAll('.sidebar-chapter');
  if (!links.length) return;

  const headings = Array.from(links)
    .map(l => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);

  if (!headings.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = '#' + entry.target.id;
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === id));
    });
  }, {
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  });

  headings.forEach(h => observer.observe(h));
}

/* 4. 사이드바 클릭 smooth scroll */
function initSidebarNav() {
  document.querySelectorAll('.sidebar-chapter').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}
