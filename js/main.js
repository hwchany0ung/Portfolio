/* ========================
   Main JavaScript
   ======================== */

// ── Navbar scroll effect ──────────────────────────────────────
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// ── Mobile hamburger ──────────────────────────────────────────
const hamburger = document.querySelector('.nav-hamburger');
const navLinks  = document.querySelector('.nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    const isOpen = navLinks.classList.contains('open');
    spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px, 5px)' : '';
    spans[1].style.opacity   = isOpen ? '0' : '1';
    spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px, -5px)' : '';
  });

  // Close on nav link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => {
        s.style.transform = '';
        s.style.opacity   = '1';
      });
    });
  });
}

// ── Active nav highlight ──────────────────────────────────────
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === path || (path === '' && href === 'index.html'));
  });
}
setActiveNav();

// ── Scroll reveal ─────────────────────────────────────────────
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Animate skill bars inside visible cards
          entry.target.querySelectorAll('.skill-bar-fill[data-width]').forEach(bar => {
            bar.style.width = bar.dataset.width;
          });
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    observer.observe(el);
  });
}

// ── Skill bar animation on load ───────────────────────────────
function initSkillBars() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          setTimeout(() => {
            bar.style.width = bar.dataset.width;
          }, 100);
          observer.unobserve(bar);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('.skill-bar-fill[data-width]').forEach(bar => {
    observer.observe(bar);
  });
}

// ── Typewriter effect ─────────────────────────────────────────
function typewriter(el, texts, speed = 80, pause = 2000) {
  if (!el) return;
  let textIdx = 0;
  let charIdx = 0;
  let isDeleting = false;

  function tick() {
    const current = texts[textIdx];
    el.textContent = current.substring(0, charIdx);

    if (!isDeleting && charIdx < current.length) {
      charIdx++;
      setTimeout(tick, speed);
    } else if (!isDeleting && charIdx === current.length) {
      isDeleting = true;
      setTimeout(tick, pause);
    } else if (isDeleting && charIdx > 0) {
      charIdx--;
      setTimeout(tick, speed / 2);
    } else {
      isDeleting = false;
      textIdx = (textIdx + 1) % texts.length;
      setTimeout(tick, 400);
    }
  }
  tick();
}

// ── Project filter ────────────────────────────────────────────
function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      projectCards.forEach(card => {
        const categories = card.dataset.category?.split(' ') || [];
        const show = filter === 'all' || categories.includes(filter);
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
          card.style.display = show ? '' : 'none';
          if (show) {
            requestAnimationFrame(() => {
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            });
          }
        }, 150);
      });
    });
  });
}

// ── Timeline progress ─────────────────────────────────────────
function initTimeline() {
  const timelineItems = document.querySelectorAll('.timeline-item');
  if (!timelineItems.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    },
    { threshold: 0.3 }
  );

  timelineItems.forEach(item => observer.observe(item));
}

// ── Smooth number counter ─────────────────────────────────────
function animateCounter(el, target, duration = 1500) {
  const start = performance.now();
  function update(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target, parseInt(entry.target.dataset.counter));
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach(c => observer.observe(c));
}

// ── Copy to clipboard ─────────────────────────────────────────
function initCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.copy).then(() => {
        const original = btn.textContent;
        btn.textContent = '복사됨!';
        btn.style.color = 'var(--accent-cyan)';
        setTimeout(() => {
          btn.textContent = original;
          btn.style.color = '';
        }, 1500);
      });
    });
  });
}

// ── Init all on DOM ready ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initSkillBars();
  initProjectFilter();
  initTimeline();
  initCounters();
  initCopyButtons();

  // Hero typewriter
  const typeEl = document.querySelector('[data-typewriter]');
  if (typeEl) {
    const texts = JSON.parse(typeEl.dataset.typewriter || '[]');
    typewriter(typeEl, texts);
  }
});
