// ═══════════════════════════════════════════════════
//  Lucas Hu Portfolio
//  B = focus-pull (blur → sharp) on everything
//  C = cascade-left / cascade-right where it fits
//  animObserver handles BOTH entry (in) AND exit (out)
// ═══════════════════════════════════════════════════

// ─── Bidirectional animation observer ─────────────
// Adds .in-view on enter, removes it on exit so CSS
// plays the transition in reverse automatically.

const animObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in-view', 'was-seen');
    } else if (e.target.classList.contains('was-seen')) {
      e.target.classList.remove('in-view');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -16px 0px' });

// ─── Data renderers ───────────────────────────────

function renderProjects() {
  const el = document.getElementById('render-projects');
  if (!el) return;
  el.innerHTML = DATA.projects.map((p, i) => {
    const tags  = (p.tags || []).map(t => `<span class="card-tag">${t}</span>`).join('');
    const links = [
      p.links?.github ? `<a href="${p.links.github}" style="font-family:var(--font-mono);font-size:0.76rem;color:var(--text-dim);text-decoration:none;" target="_blank">→ GitHub</a>` : '',
      p.links?.live   ? `<a href="${p.links.live}"   style="font-family:var(--font-mono);font-size:0.76rem;color:var(--magenta);text-decoration:none;" target="_blank">→ Live</a>` : ''
    ].filter(Boolean).join('<span style="margin:0 6px;color:var(--muted)">·</span>');
    const sl  = (p.status || '').toLowerCase();
    const cls = sl.includes('live') || sl.includes('done') || sl.includes('current') ? 'live'
               : sl.includes('wip') || sl.includes('progress') ? 'wip' : 'paused';
    // C: odd cards from left, even cards from right
    const animCls = i % 2 === 0 ? 'cascade-left' : 'cascade-right';
    return `<div class="proj-card ${animCls}" style="--d:${i * 55}ms">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <span class="card-status ${cls}">${p.status || 'TBD'}</span>
        <span style="font-family:var(--font-mono);font-size:0.70rem;color:var(--muted)">${p.year ?? '—'}</span>
      </div>
      <h3 class="card-title">${p.name ?? 'Coming soon'}</h3>
      <p class="card-desc">${p.description ?? 'Details coming soon.'}</p>
      ${tags  ? `<div class="card-tags-row">${tags}</div>` : ''}
      ${links ? `<div style="margin-top:12px;display:flex;gap:6px;align-items:center">${links}</div>` : ''}
    </div>`;
  }).join('');
  observePanel(el);
}

function renderInternships() {
  const el = document.getElementById('render-internships');
  if (!el) return;
  el.innerHTML = DATA.internships.map((item, i) => {
    const d = i * 70;
    // C: left column slides from left, right column from right, slightly delayed
    return `<div class="timeline-item">
      <div class="tl-left cascade-left" style="--d:${d}ms">
        <p class="tl-period">${item.range ?? '—'}</p>
        ${item.type ? `<span class="card-status paused">${item.type}</span>` : ''}
      </div>
      <div class="tl-line"></div>
      <div class="tl-right cascade-right" style="--d:${d + 80}ms">
        <p class="tl-org">${item.role ?? '<span style="opacity:0.4;font-style:italic">Coming soon</span>'}</p>
        ${item.company ? `<p class="tl-role">@ ${item.company}</p>` : ''}
        <p class="tl-desc">${item.description ?? 'Details will be added here.'}</p>
      </div>
    </div>`;
  }).join('');
  observePanel(el);
}

function renderAwards() {
  const el = document.getElementById('render-awards');
  if (!el) return;
  el.innerHTML = DATA.awards.map((a, i) => `
    <div class="list-item cascade-left" style="--d:${i * 40}ms">
      <span class="list-num">${String(i + 1).padStart(2, '0')}</span>
      <div class="list-main">
        <p class="list-name">${a.name ?? '<span style="opacity:0.4;font-style:italic">Coming soon</span>'}</p>
        <p class="list-sub">${[a.issuer, a.description].filter(Boolean).join(' · ')}</p>
      </div>
      ${a.year ? `<span class="list-badge">${a.year}</span>` : ''}
    </div>`).join('');
  observePanel(el);
}

function renderEvents() {
  const el = document.getElementById('render-events');
  if (!el) return;
  el.innerHTML = DATA.events.map((e, i) => `
    <div class="list-item cascade-left" style="--d:${i * 40}ms">
      <span class="list-num">${String(i + 1).padStart(2, '0')}</span>
      <div class="list-main">
        <p class="list-name">${e.name ?? '<span style="opacity:0.4;font-style:italic">Coming soon</span>'}</p>
        <p class="list-sub">${[e.role, e.description].filter(Boolean).join(' · ')}</p>
      </div>
      ${e.year ? `<span class="list-badge">${e.year}</span>` : ''}
    </div>`).join('');
  observePanel(el);
}

// Observe all direct animatable children inside a rendered panel
function observePanel(container) {
  container.querySelectorAll(
    '.focus-pull, .reveal-up, .cascade-left, .cascade-right'
  ).forEach(el => animObserver.observe(el));
}

// ─── Canvas — night sky ───────────────────────────

(function initCanvas() {
  const canvas = document.createElement('canvas');
  canvas.id = 'starCanvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d', { alpha: false });

  const swirlOff = document.createElement('canvas');
  const cityOff  = document.createElement('canvas');
  const swirlCtx = swirlOff.getContext('2d');
  const cityCtx  = cityOff.getContext('2d');

  let W = 0, H = 0;
  let stars = [], brightStars = [];
  let scrollY = 0;
  let skyTime = 0;
  let lastTs = 0;
  let swirlTick = 0;
  let shooters = [];
  let shootCooldown = 0;
  let heroEl = null, achieveEl = null;
  let lightPhase = 'idle', lightAlpha = 0, lightTimer = 0;
  let snowflakes = [], snowTarget = 0, snowCur = 0;
  let mx = 0, my = 0, tmx = 0, tmy = 0;
  let starB = 0.45, curB = 0.45;

  function seedStars() {
    stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * W,
      y: Math.random() < 0.70 ? Math.random() * H * 0.65 : Math.random() * H,
      r: Math.random() * 1.05 + 0.20,
      a: Math.random() * 0.50 + 0.15,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.2,
      blue: Math.random() < 0.30,
      depth: 0.3 + Math.random() * 0.7,
    }));
    brightStars = Array.from({ length: 10 }, () => ({
      x: Math.random() * W, y: Math.random() * H * 0.55,
      r: 1.7 + Math.random() * 1.2,
      a: 0.70 + Math.random() * 0.30,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.7,
    }));
  }

  function initSnow() {
    snowflakes = Array.from({ length: 120 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vy: 0.65 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 3.5 + 0.8,
      a: Math.random() * 0.50 + 0.40,
      wbl: Math.random() * Math.PI * 2,
      wsp: (Math.random() - 0.5) * 0.035,
    }));
  }

  function renderSwirlLayer() {
    swirlCtx.clearRect(0, 0, W, H);
    const t = skyTime;
    const swirls = [
      { cx: W * 0.23, cy: H * 0.17, outerR: W * 0.22, innerR: W * 0.03, speed: 0.18, hue: 215, alpha: 0.16 },
      { cx: W * 0.76, cy: H * 0.21, outerR: W * 0.16, innerR: W * 0.025, speed: 0.14, hue: 222, alpha: 0.13 },
    ];
    swirls.forEach(sw => {
      for (let ring = 0; ring < 4; ring++) {
        const frac  = ring / 3;
        const ringR = sw.innerR + (sw.outerR - sw.innerR) * frac;
        const rot   = t * sw.speed + ring * 0.55;
        const arcLen = Math.PI * (1.2 + frac * 0.4);
        const a = sw.alpha * Math.max(0, 1 - Math.pow((frac - 0.25) / 0.55, 2));
        if (a < 0.005) continue;
        swirlCtx.globalAlpha = a;
        swirlCtx.strokeStyle = `hsl(${sw.hue - frac * 10},80%,${28 + frac * 40}%)`;
        swirlCtx.lineWidth   = Math.max(1.5, 10 - ring * 1.5);
        swirlCtx.lineCap     = 'round';
        swirlCtx.beginPath();
        swirlCtx.arc(sw.cx, sw.cy, ringR, rot, rot + arcLen);
        swirlCtx.stroke();
      }
    });
    swirlCtx.globalAlpha = 1;
  }

  function renderCityLayer() {
    cityCtx.clearRect(0, 0, W, H);
    const cx = W / 2, arcCenterY = H * 0.76, curveDepth = H * 0.052;
    const g1 = cityCtx.createRadialGradient(cx, H * 0.80, 0, cx, H * 0.80, W * 0.72);
    g1.addColorStop(0, 'rgba(217,70,239,0.42)'); g1.addColorStop(0.18, 'rgba(192,38,211,0.28)');
    g1.addColorStop(0.40, 'rgba(124,58,237,0.14)'); g1.addColorStop(0.68, 'rgba(79,46,220,0.05)');
    g1.addColorStop(1, 'rgba(30,15,80,0)');
    cityCtx.beginPath(); cityCtx.arc(cx, H * 0.80, W * 0.72, 0, Math.PI * 2);
    cityCtx.fillStyle = g1; cityCtx.fill();
    cityCtx.fillStyle = '#060118';
    cityCtx.beginPath(); cityCtx.moveTo(-10, H + 10);
    for (let x = -10; x <= W + 10; x += 5) {
      const fx = (x - cx) / (W / 2);
      const y  = arcCenterY + curveDepth * fx * fx;
      x === -10 ? cityCtx.moveTo(x, y) : cityCtx.lineTo(x, y);
    }
    cityCtx.lineTo(W + 10, H + 10); cityCtx.closePath(); cityCtx.fill();
    const buildings = [
      [0.04,26,17],[0.08,40,13],[0.12,33,21],[0.16,58,11],[0.19,75,15],
      [0.22,52,19],[0.25,88,11],[0.28,108,9],[0.31,85,13],[0.34,128,9],
      [0.37,152,8],[0.40,140,11],[0.43,176,7],[0.46,198,6],[0.48,228,6],
      [0.50,256,5],[0.52,240,6],[0.55,202,6],[0.58,178,7],[0.61,156,9],
      [0.64,135,11],[0.67,112,9],[0.70,92,13],[0.73,70,13],[0.77,55,19],
      [0.80,85,11],[0.83,60,15],[0.87,42,21],[0.91,35,13],[0.95,28,17],
    ];
    cityCtx.fillStyle = '#0a0224';
    buildings.forEach(([fx, bldgH, bldgW]) => {
      const x = W * fx, fn = (x - cx) / (W / 2), bY = arcCenterY + curveDepth * fn * fn;
      cityCtx.fillRect(x - bldgW / 2, bY - bldgH, bldgW, bldgH);
      if (bldgH > 155) {
        cityCtx.beginPath();
        cityCtx.moveTo(x - 3.5, bY - bldgH); cityCtx.lineTo(x, bY - bldgH - 24);
        cityCtx.lineTo(x + 3.5, bY - bldgH); cityCtx.fill();
      }
    });
    cityCtx.globalAlpha = 0.45;
    buildings.forEach(([fx, bldgH]) => {
      if (bldgH < 65) return;
      const x = W * fx, fn = (x - cx) / (W / 2), bY = arcCenterY + curveDepth * fn * fn;
      const floors = Math.floor(bldgH / 15);
      for (let f = 1; f < floors; f++) {
        if (Math.random() > 0.40) continue;
        cityCtx.fillStyle = `rgba(255,${185 + (Math.random() * 45 | 0)},80,0.75)`;
        cityCtx.fillRect(x - 2.5, bY - f * 15, 2.5, 3.5);
      }
    });
    cityCtx.globalAlpha = 1;
  }

  function resize() {
    W = canvas.width = swirlOff.width = cityOff.width = window.innerWidth;
    H = canvas.height = swirlOff.height = cityOff.height = window.innerHeight;
    mx = tmx = W / 2; my = tmy = H / 2;
    heroEl    = document.getElementById('hero');
    achieveEl = document.getElementById('achievements');
    seedStars(); initSnow();
    renderSwirlLayer(); renderCityLayer();
  }

  function drawMoon() {
    const heroH = heroEl?.offsetHeight || H;
    const alpha = Math.max(0, 1 - scrollY / (heroH * 0.70));
    if (alpha < 0.01) return;
    const MX = W * 0.74, MY = H * 0.16, r = Math.min(88, W * 0.080);
    ctx.save(); ctx.globalAlpha = alpha;
    const og = ctx.createRadialGradient(MX, MY, r * 0.5, MX, MY, r * 4.0);
    og.addColorStop(0, 'rgba(255,255,200,0.50)'); og.addColorStop(0.2, 'rgba(255,252,180,0.28)');
    og.addColorStop(0.5, 'rgba(255,248,155,0.10)'); og.addColorStop(1, 'rgba(255,244,135,0)');
    ctx.beginPath(); ctx.arc(MX, MY, r * 4.0, 0, Math.PI * 2); ctx.fillStyle = og; ctx.fill();
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.arc(MX, MY, r + 8 + i * 16, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,252,150,${0.55 - i * 0.16})`; ctx.lineWidth = 7 - i * 2; ctx.stroke();
    }
    const mg = ctx.createRadialGradient(MX - r * 0.20, MY - r * 0.20, 0, MX, MY, r);
    mg.addColorStop(0, 'rgba(255,255,248,1)'); mg.addColorStop(0.5, 'rgba(255,254,215,1)');
    mg.addColorStop(1, 'rgba(240,218,148,0.92)');
    ctx.beginPath(); ctx.arc(MX, MY, r, 0, Math.PI * 2); ctx.fillStyle = mg; ctx.fill();
    ctx.restore();
  }

  function drawStars(normTs, ox, oy) {
    stars.forEach(s => {
      const t = 0.88 + 0.12 * Math.sin(normTs * s.speed + s.phase);
      const a = s.a * t * curB;
      if (a < 0.01) return;
      ctx.globalAlpha = a;
      ctx.fillStyle   = s.blue ? 'rgb(148,196,255)' : 'rgb(218,228,255)';
      ctx.beginPath();
      ctx.arc(s.x + ox * s.depth * 40, s.y + oy * s.depth * 25, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    brightStars.forEach(s => {
      const t = 0.80 + 0.20 * Math.sin(normTs * s.speed + s.phase);
      const a = s.a * t * curB;
      if (a < 0.02) return;
      ctx.globalAlpha = a * 0.18;
      ctx.fillStyle = 'rgb(200,225,255)';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgb(240,248,255)';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function treePath(c, bw, bsY, tH) {
    c.beginPath();
    c.moveTo(bw, bsY);
    c.bezierCurveTo(bw*1.05,bsY-tH*.12,bw*.7,bsY-tH*.26,bw*.65,bsY-tH*.36);
    c.bezierCurveTo(bw*.76,bsY-tH*.46,bw*.50,bsY-tH*.59,bw*.38,bsY-tH*.66);
    c.bezierCurveTo(bw*.48,bsY-tH*.73,bw*.24,bsY-tH*.84,bw*.08,bsY-tH*.91);
    c.bezierCurveTo(bw*.14,bsY-tH*.95,5,bsY-tH+14,0,bsY-tH);
    c.bezierCurveTo(-5,bsY-tH+14,-bw*.13,bsY-tH*.95,-bw*.09,bsY-tH*.89);
    c.bezierCurveTo(-bw*.28,bsY-tH*.79,-bw*.42,bsY-tH*.66,-bw*.34,bsY-tH*.57);
    c.bezierCurveTo(-bw*.52,bsY-tH*.46,-bw*.63,bsY-tH*.33,-bw*.54,bsY-tH*.22);
    c.bezierCurveTo(-bw*.83,bsY-tH*.12,-bw*.90,bsY-tH*.06,-bw,bsY);
    c.closePath();
  }

  function drawTree() {
    if (!achieveEl) return;
    const base = achieveEl.offsetTop + achieveEl.offsetHeight * 0.55;
    const tH   = H * 1.55, bsY = base - scrollY;
    if (bsY - tH > H + 60 || bsY < -150) return;
    const cx = W * 0.09 + 48, bw = 62;
    ctx.save(); ctx.translate(cx, 0);
    treePath(ctx, bw, bsY, tH);
    ctx.fillStyle = '#152a12'; ctx.fill();
    ctx.globalCompositeOperation = 'screen';
    treePath(ctx, bw, bsY, tH);
    ctx.strokeStyle = 'rgba(60,130,46,0.60)'; ctx.lineWidth = 3.5; ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 12; i++) {
      const frac = 0.05 + i * 0.075, fy = bsY - tH * frac, fw = bw * (1 - frac * 0.80);
      if (fy < -10 || fy > H + 10) continue;
      ctx.beginPath(); ctx.moveTo(-fw, fy + 7);
      ctx.bezierCurveTo(-fw * 0.45, fy - 10, fw * 0.45, fy - 8, fw, fy + 9);
      ctx.strokeStyle = `rgba(50,95,38,${0.58 - i * 0.030})`; ctx.lineWidth = 4.5 - i * 0.25; ctx.stroke();
    }
    if (lightAlpha > 0.005) {
      const visTop = Math.max(bsY - tH, 0), visBot = Math.min(bsY, H);
      if (visBot > visTop) {
        ctx.globalCompositeOperation = 'screen';
        const lg = ctx.createLinearGradient(0, visTop, 0, visBot);
        lg.addColorStop(0, 'rgba(255,248,150,0)');
        lg.addColorStop(0.5, `rgba(255,230,80,${lightAlpha})`);
        lg.addColorStop(1, 'rgba(255,195,35,0)');
        ctx.beginPath();
        ctx.ellipse(0, (visTop + visBot) / 2, 28, (visBot - visTop) / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = lg; ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }
    }
    ctx.restore();
  }

  function updateLight(dtSec) {
    lightTimer += dtSec;
    if (lightPhase === 'idle' && lightTimer >= 7) { lightPhase = 'rising'; lightTimer = 0; }
    else if (lightPhase === 'rising') {
      lightAlpha = Math.min(1, lightTimer / 0.55);
      if (lightTimer >= 0.55) { lightPhase = 'peak'; lightTimer = 0; }
    } else if (lightPhase === 'peak' && lightTimer >= 0.50) { lightPhase = 'falling'; lightTimer = 0; }
    else if (lightPhase === 'falling') {
      lightAlpha = Math.max(0, 1 - lightTimer / 1.1);
      if (lightTimer >= 1.1) { lightPhase = 'idle'; lightAlpha = 0; lightTimer = 0; }
    }
  }

  function drawSnow(dt) {
    snowCur += (snowTarget - snowCur) * 0.015 * dt;
    if (snowCur < 0.01) return;
    snowflakes.forEach(s => {
      s.wbl += s.wsp * dt; s.x += (s.vx + Math.sin(s.wbl) * 0.28) * dt; s.y += s.vy * dt;
      if (s.y > H + 8) { s.y = -8; s.x = Math.random() * W; }
      if (s.x < -8) s.x = W + 8; if (s.x > W + 8) s.x = -8;
      ctx.globalAlpha = s.a * snowCur;
      ctx.fillStyle = 'rgba(235,248,255,1)';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function spawnShooter() {
    const angle = (8 + Math.random() * 28) * (Math.PI / 180);
    const speed = 9 + Math.random() * 7;
    shooters.push({
      x: Math.random() * W, y: Math.random() * H * 0.38,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      trail: 90 + Math.random() * 70, life: 1.0,
      decay: 0.016 + Math.random() * 0.010,
    });
  }

  function frame(ts) {
    if (document.hidden) { lastTs = 0; requestAnimationFrame(frame); return; }
    const raw = lastTs ? ts - lastTs : 16.667;
    const dt  = Math.min(raw, 33.333) / 16.667;
    lastTs    = ts;
    skyTime  += dt * 0.00035;
    updateLight(raw / 1000);
    mx   += (tmx - mx)   * 0.04 * dt;
    my   += (tmy - my)   * 0.04 * dt;
    curB += (starB - curB) * 0.018 * dt;
    const ox = mx / W - 0.5, oy = my / H - 0.5;
    const normTs = ts * 0.001;

    swirlTick++;
    if (swirlTick % 3 === 0) renderSwirlLayer();

    ctx.fillStyle = '#030510';
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = curB * 0.90;
    ctx.drawImage(swirlOff, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    drawStars(normTs, ox, oy);

    const heroH = heroEl?.offsetHeight || H;
    const globeVis = Math.max(0, 1 - scrollY / heroH);
    if (globeVis > 0.01) {
      ctx.globalAlpha = globeVis;
      ctx.drawImage(cityOff, 0, 0);
      ctx.globalAlpha = 1;
    }

    drawMoon();
    drawTree();
    drawSnow(dt);

    shootCooldown -= dt;
    if (shootCooldown <= 0 && shooters.length < 3) {
      spawnShooter(); shootCooldown = 480 + Math.random() * 360;
    }
    shooters = shooters.filter(s => s.life > 0);
    shooters.forEach(s => {
      s.x += s.vx * dt; s.y += s.vy * dt; s.life -= s.decay * dt;
      if (s.life <= 0) return;
      const steps = s.trail / s.speed;
      const g = ctx.createLinearGradient(s.x - s.vx * steps, s.y - s.vy * steps, s.x, s.y);
      g.addColorStop(0, 'rgba(180,215,255,0)');
      g.addColorStop(1, `rgba(230,245,255,${(s.life * 0.80).toFixed(3)})`);
      ctx.beginPath(); ctx.moveTo(s.x - s.vx * steps, s.y - s.vy * steps);
      ctx.lineTo(s.x, s.y); ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.globalAlpha = s.life * 0.70;
      ctx.fillStyle = 'rgba(240,248,255,0.9)';
      ctx.beginPath(); ctx.arc(s.x, s.y, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    });

    requestAnimationFrame(frame);
  }

  window.setStarBrightness = b      => { starB = b; };
  window.setSnow           = on     => { snowTarget = on ? 1 : 0; };
  window.updateStarMouse   = (x, y) => { tmx = x; tmy = y; };

  let _rt;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
  window.addEventListener('resize', () => { clearTimeout(_rt); _rt = setTimeout(resize, 180); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) lastTs = 0; });
  resize();
  requestAnimationFrame(frame);
})();

// ─── Card 3D tilt ─────────────────────────────────

let tiltedCard = null;
function resetCard(c) { c.style.transform = ''; c.style.borderColor = ''; c.style.boxShadow = ''; }

document.addEventListener('mousemove', e => {
  if (window.updateStarMouse) window.updateStarMouse(e.clientX, e.clientY);
  const card = e.target.closest('.proj-card');
  if (card) {
    const r  = card.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
    const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
    card.style.transform   = `perspective(700px) rotateX(${(-dy * 5).toFixed(1)}deg) rotateY(${(dx * 5).toFixed(1)}deg) translateY(-4px)`;
    card.style.borderColor = 'rgba(217,70,239,0.50)';
    card.style.boxShadow   = '0 16px 44px rgba(124,58,237,0.22)';
    if (tiltedCard && tiltedCard !== card) resetCard(tiltedCard);
    tiltedCard = card;
  } else if (tiltedCard) {
    resetCard(tiltedCard); tiltedCard = null;
  }
});
document.addEventListener('mouseleave', () => { if (tiltedCard) { resetCard(tiltedCard); tiltedCard = null; } });

// ─── Boot ─────────────────────────────────────────

renderProjects();
renderInternships();
renderAwards();
renderEvents();

// ─── Hero: fire entry animations immediately ───────
// Hero elements are NOT bidirectional — they stay in-view
// once triggered (hero is full-height; exit is instant).

function fireHero() {
  document.querySelectorAll('#hero .focus-pull, #hero .reveal-clip').forEach(el => {
    const d = parseInt(el.style.getPropertyValue('--d') || '0');
    setTimeout(() => el.classList.add('in-view'), d);
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fireHero);
} else {
  fireHero();
}

// ─── Observe all non-hero page elements ───────────

document.querySelectorAll(
  '.focus-pull:not(#hero *), .reveal-up:not(#hero *), ' +
  '.cascade-left:not(#hero *), .cascade-right:not(#hero *)'
).forEach(el => animObserver.observe(el));

// ─── Tab switching — re-animate panel content ─────

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const t = tab.dataset.tab;
    document.querySelectorAll('.tab').forEach(x      => x.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(x => x.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById(`tab-${t}`);
    if (!panel) return;
    panel.classList.add('active');
    // Reset animation state so items re-animate into the newly visible panel
    requestAnimationFrame(() => {
      panel.querySelectorAll('.focus-pull, .reveal-up, .cascade-left, .cascade-right').forEach(el => {
        el.classList.remove('in-view', 'was-seen');
        animObserver.unobserve(el);
        animObserver.observe(el);
      });
    });
  });
});

// ─── Scroll progress bar ──────────────────────────

const scrollBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollBar && total > 0) scrollBar.style.width = ((window.scrollY / total) * 100).toFixed(2) + '%';
}, { passive: true });

// ─── Atmosphere + snow ────────────────────────────

const atmEls = {
  dusk:     document.getElementById('atm-dusk'),
  early:    document.getElementById('atm-early'),
  midnight: document.getElementById('atm-midnight'),
  void:     document.getElementById('atm-void'),
};
let curAtm = 'dusk';
function switchAtm(name) {
  if (name === curAtm) return;
  Object.entries(atmEls).forEach(([k, el]) => el?.classList.toggle('active', k === name));
  curAtm = name;
}

const sectionCfg = {
  hero:         { atm: 'dusk',     starB: 0.45, snow: false },
  about:        { atm: 'early',    starB: 0.80, snow: false },
  achievements: { atm: 'midnight', starB: 1.10, snow: false },
  contact:      { atm: 'void',     starB: 0.08, snow: true  },
};
const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const cfg = sectionCfg[e.target.id];
    if (!cfg) return;
    switchAtm(cfg.atm);
    window.setStarBrightness?.(cfg.starB);
    window.setSnow?.(cfg.snow);
  });
}, { threshold: 0.35 });
document.querySelectorAll('section[id]').forEach(s => sectionObs.observe(s));

// ─── Nav ──────────────────────────────────────────

const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 55);
}, { passive: true });

const navLinks = document.querySelectorAll('.nav-link');
const navObs   = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    navLinks.forEach(l => l.classList.remove('active'));
    document.querySelector(`.nav-link[href="#${e.target.id}"]`)?.classList.add('active');
  });
}, { threshold: 0.45 });
document.querySelectorAll('section[id]').forEach(s => navObs.observe(s));

// ─── Stat counters ────────────────────────────────

function animCount(el, target, ms = 1100) {
  const start = performance.now();
  const step  = now => {
    const p = Math.min((now - start) / ms, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function populateStats() {
  const counts = [
    DATA.projects?.filter(p => p.name).length    || 0,
    DATA.internships?.filter(i => i.role).length  || 0,
    DATA.awards?.filter(a => a.name).length       || 0,
  ];
  document.querySelectorAll('.stat-num').forEach((el, i) => {
    el.dataset.count = counts[i] ?? 0;
  });
}
populateStats();

const statObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    statObs.unobserve(e.target);
    const numEl  = e.target.querySelector('.stat-num');
    const barFil = e.target.querySelector('.stat-bar-fill');
    if (numEl) animCount(numEl, parseInt(numEl.dataset.count) || 0);
    if (barFil) setTimeout(() => { barFil.style.width = '100%'; }, 250);
  });
}, { threshold: 0.55 });
document.querySelectorAll('.stat-card').forEach(c => statObs.observe(c));
