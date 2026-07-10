'use strict';
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   archive.js  ·  Archive page logic
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ── 1. Canvas background ──────────────────
// Offscreen swirl layer updated every 3rd frame → ~20fps visual cost
// Stars drawn directly each frame (cheap arc fills, no compositing)
// No aurora orbs — CSS radial gradient handles atmosphere

(function initCanvas() {
  const canvas = document.getElementById('arc-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });

  const swirlOff = document.createElement('canvas');
  const swirlCtx = swirlOff.getContext('2d');

  let W = 0, H = 0, stars = [];
  let skyT = 0, swirlTick = 0, lastTs = 0;

  function resize() {
    W = canvas.width  = swirlOff.width  = window.innerWidth;
    H = canvas.height = swirlOff.height = window.innerHeight;
    stars = Array.from({ length: 200 }, () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 1.2 + 0.2,
      baseA: Math.random() * 0.65 + 0.25,
      ph:    Math.random() * Math.PI * 2,
      sp:    0.5 + Math.random() * 1.1,
    }));
    renderSwirlLayer();
  }

  function renderSwirlLayer() {
    swirlCtx.clearRect(0, 0, W, H);
    const swirls = [
      { cx: W*0.22, cy: H*0.18, outerR: W*0.28, innerR: W*0.04, speed: 0.48, hue: 218, alpha: 0.14 },
      { cx: W*0.72, cy: H*0.14, outerR: W*0.22, innerR: W*0.03, speed: 0.38, hue: 200, alpha: 0.12 },
    ];
    swirls.forEach(sw => {
      for (let ring = 0; ring < 4; ring++) {
        const frac  = ring / 3;
        const ringR = sw.innerR + (sw.outerR - sw.innerR) * frac;
        const rot   = skyT * sw.speed + ring * 0.55;
        const arcL  = Math.PI * (1.2 + frac * 0.45);
        const peakA = sw.alpha * Math.max(0, 1 - Math.pow((frac - 0.35) / 0.5, 2));
        if (peakA < 0.005) continue;
        const ll  = 35 + frac * 36;
        const sat = 80 - frac * 14;
        swirlCtx.globalCompositeOperation = 'screen';
        swirlCtx.globalAlpha   = peakA;
        swirlCtx.strokeStyle   = `hsl(${sw.hue - frac * 10},${sat}%,${ll}%)`;
        swirlCtx.lineWidth     = Math.max(1.5, 9 - ring * 0.8);
        swirlCtx.lineCap       = 'round';
        swirlCtx.beginPath();
        swirlCtx.arc(sw.cx, sw.cy, ringR, rot, rot + arcL);
        swirlCtx.stroke();
      }
    });
    swirlCtx.globalAlpha = 1;
    swirlCtx.globalCompositeOperation = 'source-over';
  }

  function frame(ts) {
    if (document.hidden) { lastTs = 0; requestAnimationFrame(frame); return; }
    const raw = lastTs ? ts - lastTs : 16.667;
    const dt  = Math.min(raw, 33.333) / 16.667; // clamp prevents jump after sleep/tab switch
    lastTs = ts;
    skyT += dt * 0.00045;

    swirlTick++;
    if (swirlTick % 3 === 0) renderSwirlLayer();

    // fillRect instead of clearRect — faster for opaque background
    ctx.fillStyle = '#030510';
    ctx.fillRect(0, 0, W, H);

    // Composite offscreen swirl in one call
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 1;
    ctx.drawImage(swirlOff, 0, 0);
    ctx.globalCompositeOperation = 'source-over';

    // Stars — no compositing needed
    const normTs = ts * 0.001;
    ctx.fillStyle = 'rgba(210,228,255,1)';
    stars.forEach(s => {
      ctx.globalAlpha = s.baseA * (0.82 + 0.18 * Math.sin(normTs * s.sp + s.ph));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    requestAnimationFrame(frame);
  }

  let _rt;
  window.addEventListener('resize', () => { clearTimeout(_rt); _rt = setTimeout(resize, 150); });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) { lastTs = 0; }
  });

  resize();
  requestAnimationFrame(frame);
})();

// ── 2. Hero fire immediately on load ──────

(function fireHero() {
  const hero = document.querySelector('.arc-hero');
  if (!hero) return;
  hero.querySelectorAll('.cascade-left, .reveal-clip, .focus-pull').forEach(el => {
    const d = parseInt(el.style.getPropertyValue('--d') || '0');
    setTimeout(() => el.classList.add('in-view'), d);
  });
})();

// ── 3. Bidirectional section observer ────
// Acc-groups animate cascade-left in on scroll, reverse on exit

const animObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in-view', 'was-seen');
    } else if (e.target.classList.contains('was-seen')) {
      e.target.classList.remove('in-view');
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -12px 0px' });

document.querySelectorAll('.acc-group').forEach(el => animObserver.observe(el));

// ── 4. Terminal print ─────────────────────
// RAF-based char-by-char reveal for small text elements
// el must have data-print set; textContent starts empty, fills over dur ms

function termPrint(el) {
  const text = el.dataset.print;
  if (!text) return;
  const dur  = Math.max(300, Math.min(600, text.length * 12));
  const start = performance.now();
  function tick(now) {
    const p     = Math.min(1, (now - start) / dur);
    const chars = Math.floor(p * text.length);
    el.textContent = text.slice(0, chars) + (p < 1 ? '▌' : '');
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ── 5. Entry animations ───────────────────

function animateEntries(container) {
  const entries = container.querySelectorAll('.arc-entry');
  // Reset to start state, stagger delays
  entries.forEach((entry, i) => {
    entry.style.setProperty('--d', `${i * 50}ms`);
    entry.classList.remove('entry-in');
    void entry.offsetHeight; // force reflow so transition restarts
  });
  requestAnimationFrame(() => {
    entries.forEach(entry => entry.classList.add('entry-in'));
  });
  // Terminal print begins once cascade has settled (~450ms)
  setTimeout(() => {
    entries.forEach(entry => {
      entry.querySelectorAll('[data-print]').forEach(termPrint);
    });
  }, 450);
}

function resetEntries(container) {
  container.querySelectorAll('.arc-entry').forEach(entry => {
    entry.classList.remove('entry-in');
    // Restore original text so terminal-print re-runs on next open
    entry.querySelectorAll('[data-print]').forEach(el => {
      el.textContent = el.dataset.print || '';
    });
  });
}

// ── 6. Build functions ────────────────────
// data-print on year/meta/desc elements → terminal print on open
// title is printed immediately (it's the primary anchor, not small text)

function escAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildProjects(container) {
  // Show all named projects unless explicitly excluded with archive: false
  const d = (DATA.projects || []).filter(p => p.name && p.archive !== false);
  const countEl = document.getElementById('cnt-projects');
  if (countEl) {
    countEl.textContent = `${d.length} ${d.length === 1 ? 'entry' : 'entries'}`;
  }
  container.innerHTML = d.map(p => {
    const sl = (p.status || '').toLowerCase();
    const statusCls = sl.includes('live') || sl.includes('done') || sl.includes('current') || sl.includes('completed')
      ? 'live' : sl.includes('wip') || sl.includes('progress') || sl.includes('planned') ? 'wip' : 'paused';
    const tags  = (p.tags  || []).map(t => `<span class="arc-entry-tag">${t}</span>`).join('');
    const links = [
      p.links?.github ? `<a href="${p.links.github}" class="arc-entry-link" target="_blank">→ GitHub</a>` : '',
      p.links?.live   ? `<a href="${p.links.live}"   class="arc-entry-link" target="_blank">→ Live</a>`   : '',
    ].filter(Boolean).join('');
    return `<div class="arc-entry">
      <div class="arc-entry-year" data-print="${escAttr(p.year ?? '—')}"></div>
      <div class="arc-entry-body">
        ${p.status ? `<span class="arc-entry-status ${statusCls}">${p.status}</span>` : ''}
        <div class="arc-entry-title">${p.name}</div>
        ${p.description ? `<div class="arc-entry-desc" data-print="${escAttr(p.description)}"></div>` : ''}
        ${tags  ? `<div class="arc-entry-tags">${tags}</div>`   : ''}
        ${links ? `<div class="arc-entry-links">${links}</div>` : ''}
      </div>
    </div>`;
  }).join('');
}

function buildInternships(container) {
  const d = DATA.internships || [];
  const countEl = document.getElementById('cnt-internships');
  if (countEl) {
    const n = d.filter(i => i.role).length;
    countEl.textContent = `${n} ${n === 1 ? 'entry' : 'entries'}`;
  }
  container.innerHTML = d.map(i => {
    const meta = i.company ? `@ ${i.company}` : '';
    return `<div class="arc-entry${!i.role ? ' placeholder' : ''}">
      <div class="arc-entry-year" data-print="${escAttr(i.range ?? '—')}"></div>
      <div class="arc-entry-body">
        ${i.type ? `<span class="arc-entry-status paused">${i.type}</span>` : ''}
        <div class="arc-entry-title">${i.role ?? 'Coming soon'}</div>
        ${meta          ? `<div class="arc-entry-meta" data-print="${escAttr(meta)}"></div>`          : ''}
        ${i.description ? `<div class="arc-entry-desc" data-print="${escAttr(i.description)}"></div>` : ''}
      </div>
    </div>`;
  }).join('');
}

function buildAwards(container) {
  const d = DATA.awards || [];
  const countEl = document.getElementById('cnt-awards');
  if (countEl) {
    const n = d.filter(a => a.name).length;
    countEl.textContent = `${n} ${n === 1 ? 'entry' : 'entries'}`;
  }
  container.innerHTML = d.map(a => {
    return `<div class="arc-entry${!a.name ? ' placeholder' : ''}">
      <div class="arc-entry-year" data-print="${escAttr(a.year ?? '—')}"></div>
      <div class="arc-entry-body">
        <div class="arc-entry-title">${a.name ?? 'Coming soon'}</div>
        ${a.issuer      ? `<div class="arc-entry-meta" data-print="${escAttr(a.issuer)}"></div>`      : ''}
        ${a.description ? `<div class="arc-entry-desc" data-print="${escAttr(a.description)}"></div>` : ''}
      </div>
    </div>`;
  }).join('');
}

function buildEvents(container) {
  const d = DATA.events || [];
  const countEl = document.getElementById('cnt-events');
  if (countEl) {
    const n = d.filter(e => e.name).length;
    countEl.textContent = `${n} ${n === 1 ? 'entry' : 'entries'}`;
  }
  container.innerHTML = d.map(e => {
    return `<div class="arc-entry${!e.name ? ' placeholder' : ''}">
      <div class="arc-entry-year" data-print="${escAttr(e.year ?? '—')}"></div>
      <div class="arc-entry-body">
        <div class="arc-entry-title">${e.name ?? 'Coming soon'}</div>
        ${e.role        ? `<div class="arc-entry-meta" data-print="${escAttr(e.role)}"></div>`        : ''}
        ${e.description ? `<div class="arc-entry-desc" data-print="${escAttr(e.description)}"></div>` : ''}
      </div>
    </div>`;
  }).join('');
}

// ── 7. Accordion ──────────────────────────

const accDefs = [
  { id: 'projects',    build: buildProjects    },
  { id: 'internships', build: buildInternships },
  { id: 'awards',      build: buildAwards      },
  { id: 'events',      build: buildEvents      },
];

accDefs.forEach(({ id, build }) => {
  const group     = document.getElementById(`acc-${id}`);
  const header    = group?.querySelector('.acc-header');
  const container = document.getElementById(`archive-${id}`);
  if (!group || !header || !container) return;

  build(container);

  header.addEventListener('click', () => {
    const isOpen = group.classList.contains('open');

    // Close all other open groups
    document.querySelectorAll('.acc-group.open').forEach(g => {
      if (g !== group) {
        g.classList.remove('open');
        g.querySelector('.acc-header').setAttribute('aria-expanded', 'false');
        const c = g.querySelector('.acc-entry-list');
        if (c) resetEntries(c);
      }
    });

    if (isOpen) {
      group.classList.remove('open');
      header.setAttribute('aria-expanded', 'false');
      resetEntries(container);
    } else {
      group.classList.add('open');
      header.setAttribute('aria-expanded', 'true');
      // Short delay so max-height transition has started before we run the entry cascade
      setTimeout(() => animateEntries(container), 60);
    }
  });
});
