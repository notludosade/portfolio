'use client'

import { useEffect } from 'react'

export default function StarCanvas() {
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.id = 'stars-canvas'
    document.body.prepend(canvas)
    const ctx = canvas.getContext('2d')!

    let W = 0, H = 0
    let blueStars: any[] = [], whiteStars: any[] = [], brightStars: any[] = []
    let mx = 0, my = 0, tmx = 0, tmy = 0
    let brightness = 0.45, curB = 0.45
    let shooters: any[] = [], shootTick = 0
    let nextShoot = 150 + Math.floor(Math.random() * 220)
    let lastTs = 0
    let scrollY = 0
    let skyTime = 0
    let heroEl: HTMLElement | null = null
    let achieveEl: HTMLElement | null = null
    let lightPhase = 'idle', lightAlpha = 0, lightTimer = 0
    let snowflakes: any[] = [], snowIntensity = 0, curSnowInt = 0
    let rafId = 0

    function spawnShooter() {
      const angle = (10 + Math.random() * 32) * (Math.PI / 180)
      const speed = 11 + Math.random() * 9
      shooters.push({
        x: Math.random() * W * 1.1 - W * 0.05,
        y: Math.random() * H * 0.42,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        speed, trail: 110 + Math.random() * 90,
        life: 1.0, decay: 0.013 + Math.random() * 0.010,
      })
    }

    function seedStars() {
      blueStars = []; whiteStars = []; brightStars = []
      for (let i = 0; i < 360; i++) {
        const isBlue = Math.random() < 0.28
        const yBias  = Math.random() < 0.65 ? Math.random() * 0.65 : Math.random()
        ;(isBlue ? blueStars : whiteStars).push({
          x: Math.random() * W, y: yBias * H,
          r: Math.random() * 1.1 + 0.25,
          baseA: Math.random() * 0.65 + 0.20,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.8 + Math.random() * 1.4,
          depth: Math.random(),
        })
      }
      for (let i = 0; i < 18; i++) {
        brightStars.push({
          x: Math.random() * W, y: Math.random() * H * 0.55,
          r: 1.8 + Math.random() * 1.4,
          baseA: 0.75 + Math.random() * 0.25,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.5 + Math.random() * 0.8,
          depth: Math.random(),
        })
      }
    }

    function initSnow() {
      snowflakes = Array.from({ length: 180 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vy: 0.6 + Math.random() * 2.0,
        vx: (Math.random() - 0.5) * 0.7,
        r: Math.random() * 3.8 + 0.8,
        a: Math.random() * 0.55 + 0.45,
        wbl: Math.random() * Math.PI * 2,
        wsp: (Math.random() - 0.5) * 0.04,
      }))
    }

    function resize() {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
      seedStars()
      initSnow()
      heroEl    = heroEl    || document.getElementById('hero')
      achieveEl = achieveEl || document.getElementById('achievements')
    }

    // ── Van Gogh sky swirls ──────────────────────

    function drawVanGoghSky() {
      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      const swirls = [
        { cx: W*0.22, cy: H*0.18, outerR: W*0.26, innerR: W*0.04, speed: 0.50, hue: 215, alpha: 0.38 },
        { cx: W*0.50, cy: H*0.12, outerR: W*0.20, innerR: W*0.03, speed: 0.38, hue: 200, alpha: 0.30 },
        { cx: W*0.70, cy: H*0.22, outerR: W*0.18, innerR: W*0.03, speed: 0.45, hue: 228, alpha: 0.34 },
        { cx: W*0.84, cy: H*0.09, outerR: W*0.13, innerR: W*0.02, speed: 0.60, hue: 208, alpha: 0.26 },
        { cx: W*0.35, cy: H*0.33, outerR: W*0.14, innerR: W*0.02, speed: 0.32, hue: 222, alpha: 0.22 },
      ]
      swirls.forEach(sw => {
        for (let ring = 0; ring < 9; ring++) {
          const frac  = ring / 8
          const ringR = sw.innerR + (sw.outerR - sw.innerR) * frac
          const rot   = skyTime * sw.speed + ring * 0.42
          const arcLen = Math.PI * (1.3 + frac * 0.5)
          const peakA = sw.alpha * Math.max(0, 1 - Math.pow((frac - 0.3) / 0.5, 2))
          if (peakA < 0.01) continue
          const lightness = 30 + frac * 45, sat = 88 - frac * 18
          ctx.globalAlpha = peakA
          ctx.strokeStyle = `hsl(${sw.hue - frac * 12},${sat}%,${lightness}%)`
          ctx.lineWidth   = Math.max(1.5, 12 - ring * 1.0)
          ctx.lineCap     = 'round'
          ctx.beginPath(); ctx.arc(sw.cx, sw.cy, ringR, rot, rot + arcLen); ctx.stroke()
          ctx.globalAlpha = peakA * 0.45
          ctx.lineWidth   = Math.max(1, 6 - ring * 0.5)
          ctx.beginPath(); ctx.arc(sw.cx, sw.cy, ringR * 1.1, rot + Math.PI + 0.2, rot + Math.PI + arcLen * 0.55); ctx.stroke()
        }
      })
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
      ctx.restore()
    }

    // ── Stars ────────────────────────────────────

    function drawGroup(group: any[], rgb: string, ox: number, oy: number, normTs: number) {
      ctx.fillStyle = `rgb(${rgb})`
      group.forEach(s => {
        const twinkle = 0.88 + 0.12 * Math.sin(normTs * s.twinkleSpeed + s.twinklePhase)
        const a = Math.max(0, s.baseA * curB * twinkle)
        if (a < 0.005) return
        ctx.globalAlpha = a
        ctx.beginPath()
        ctx.arc(s.x + ox * s.depth * 55, s.y + oy * s.depth * 32, s.r, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    function drawBrightStars(ox: number, oy: number, normTs: number) {
      brightStars.forEach(s => {
        const twinkle = 0.80 + 0.20 * Math.sin(normTs * s.twinkleSpeed + s.twinklePhase)
        const a = Math.max(0, s.baseA * curB * twinkle)
        if (a < 0.01) return
        const sx = s.x + ox * s.depth * 55
        const sy = s.y + oy * s.depth * 32
        ctx.save()
        ctx.globalCompositeOperation = 'screen'
        const hg = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 5)
        hg.addColorStop(0,   `rgba(210,230,255,${a * 0.8})`)
        hg.addColorStop(0.4, `rgba(180,215,255,${a * 0.3})`)
        hg.addColorStop(1,   'rgba(150,200,255,0)')
        ctx.fillStyle = hg
        ctx.beginPath(); ctx.arc(sx, sy, s.r * 5, 0, Math.PI * 2); ctx.fill()
        ctx.globalCompositeOperation = 'source-over'
        ctx.restore()
        ctx.globalAlpha = a
        ctx.fillStyle = 'rgb(240,248,255)'
        ctx.beginPath(); ctx.arc(sx, sy, s.r, 0, Math.PI * 2); ctx.fill()
      })
      ctx.globalAlpha = 1
    }

    // ── Moon ─────────────────────────────────────

    function drawMoon() {
      const heroH = (heroEl as HTMLElement)?.offsetHeight || H
      const alpha = Math.max(0, 1 - scrollY / (heroH * 0.65))
      if (alpha < 0.01) return
      const MX = W * 0.74, MY = H * 0.16, r = Math.min(96, W * 0.088)
      ctx.save()
      ctx.globalAlpha = alpha

      // Huge atmospheric bloom
      const og = ctx.createRadialGradient(MX, MY, r * 0.4, MX, MY, r * 7.5)
      og.addColorStop(0,    'rgba(255,255,200,0.65)')
      og.addColorStop(0.10, 'rgba(255,252,185,0.42)')
      og.addColorStop(0.30, 'rgba(255,248,165,0.22)')
      og.addColorStop(0.55, 'rgba(255,244,145,0.10)')
      og.addColorStop(0.80, 'rgba(255,240,125,0.04)')
      og.addColorStop(1,    'rgba(255,236,110,0)')
      ctx.beginPath(); ctx.arc(MX, MY, r * 7.5, 0, Math.PI * 2)
      ctx.fillStyle = og; ctx.fill()

      // Wide secondary halo
      const wg = ctx.createRadialGradient(MX, MY, r, MX, MY, r * 4.2)
      wg.addColorStop(0, 'rgba(255,250,160,0.28)')
      wg.addColorStop(1, 'rgba(255,246,140,0)')
      ctx.beginPath(); ctx.arc(MX, MY, r * 4.2, 0, Math.PI * 2)
      ctx.fillStyle = wg; ctx.fill()

      // 6 concentric halo rings — very visible
      for (let i = 0; i < 6; i++) {
        ctx.beginPath(); ctx.arc(MX, MY, r + 10 + i * 18, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255,252,150,${0.70 - i * 0.11})`
        ctx.lineWidth   = 9 - i * 1.3; ctx.stroke()
      }

      // Moon body
      const mg = ctx.createRadialGradient(MX - r * 0.22, MY - r * 0.22, 0, MX, MY, r)
      mg.addColorStop(0,    'rgba(255,255,248,1)')
      mg.addColorStop(0.45, 'rgba(255,254,218,1)')
      mg.addColorStop(0.78, 'rgba(248,235,172,0.97)')
      mg.addColorStop(1,    'rgba(225,205,126,0.92)')
      ctx.beginPath(); ctx.arc(MX, MY, r, 0, Math.PI * 2)
      ctx.fillStyle = mg; ctx.fill()
      ctx.restore()
    }

    // ── Tree ─────────────────────────────────────

    function treePath(cx: number, bw: number, bsY: number, treeDocH: number) {
      ctx.beginPath()
      ctx.moveTo(cx - bw, bsY)
      ctx.bezierCurveTo(cx-bw*1.05,bsY-treeDocH*0.12, cx-bw*0.7, bsY-treeDocH*0.26, cx-bw*0.65,bsY-treeDocH*0.36)
      ctx.bezierCurveTo(cx-bw*0.76,bsY-treeDocH*0.46, cx-bw*0.50,bsY-treeDocH*0.59, cx-bw*0.38,bsY-treeDocH*0.66)
      ctx.bezierCurveTo(cx-bw*0.48,bsY-treeDocH*0.73, cx-bw*0.24,bsY-treeDocH*0.84, cx-bw*0.08,bsY-treeDocH*0.91)
      ctx.bezierCurveTo(cx-bw*0.14,bsY-treeDocH*0.95, cx-5, bsY-treeDocH+14, cx, bsY-treeDocH)
      ctx.bezierCurveTo(cx+5, bsY-treeDocH+14, cx+bw*0.13,bsY-treeDocH*0.95, cx+bw*0.09,bsY-treeDocH*0.89)
      ctx.bezierCurveTo(cx+bw*0.28,bsY-treeDocH*0.79, cx+bw*0.42,bsY-treeDocH*0.66, cx+bw*0.34,bsY-treeDocH*0.57)
      ctx.bezierCurveTo(cx+bw*0.52,bsY-treeDocH*0.46, cx+bw*0.63,bsY-treeDocH*0.33, cx+bw*0.54,bsY-treeDocH*0.22)
      ctx.bezierCurveTo(cx+bw*0.83,bsY-treeDocH*0.12, cx+bw*0.90,bsY-treeDocH*0.06, cx+bw, bsY)
      ctx.closePath()
    }

    function drawTree() {
      if (!achieveEl) return
      const treeDocBase = (achieveEl as HTMLElement).offsetTop + (achieveEl as HTMLElement).offsetHeight * 0.55
      const treeDocH    = H * 1.55
      const bsY = treeDocBase - scrollY
      const tpY = bsY - treeDocH
      if (tpY > H + 60 || bsY < -150) return

      const cx = W * 0.09 + 48, bw = 62
      ctx.save()

      // Outer green glow halo (screen)
      ctx.globalCompositeOperation = 'screen'
      const haloG = ctx.createLinearGradient(cx - bw * 1.4, tpY, cx + bw * 1.4, bsY)
      haloG.addColorStop(0,   'rgba(35,90,28,0.0)')
      haloG.addColorStop(0.5, 'rgba(55,130,40,0.72)')
      haloG.addColorStop(1,   'rgba(35,90,28,0.0)')
      treePath(cx, bw * 1.35, bsY + 8, treeDocH * 1.02)
      ctx.fillStyle = haloG; ctx.fill()
      ctx.globalCompositeOperation = 'source-over'

      // Dark silhouette
      treePath(cx, bw, bsY, treeDocH)
      ctx.fillStyle = '#152a12'; ctx.fill()

      // Edge glow (screen)
      ctx.globalCompositeOperation = 'screen'
      treePath(cx, bw, bsY, treeDocH)
      ctx.strokeStyle = 'rgba(70,140,52,0.75)'; ctx.lineWidth = 4; ctx.stroke()
      ctx.globalCompositeOperation = 'source-over'

      // Brushstrokes
      for (let i = 0; i < 15; i++) {
        const frac = 0.04 + i * 0.065
        const fy   = bsY - treeDocH * frac
        const fw   = bw * (1 - frac * 0.78) * 0.95
        if (fy < -10 || fy > H + 10) continue
        ctx.beginPath()
        ctx.moveTo(cx - fw, fy + 7)
        ctx.bezierCurveTo(cx-fw*0.45, fy-11, cx+fw*0.45, fy-9, cx+fw, fy+9)
        ctx.strokeStyle = `rgba(55,100,42,${0.65 - i * 0.025})`
        ctx.lineWidth = 5 - i * 0.22; ctx.stroke()
      }

      // Light pulse
      if (lightAlpha > 0.005) {
        const visTop = Math.max(tpY, 0), visBot = Math.min(bsY, H)
        if (visBot > visTop) {
          ctx.globalCompositeOperation = 'screen'
          const lg = ctx.createLinearGradient(cx, visTop, cx, visBot)
          lg.addColorStop(0,    'rgba(255,248,150,0)')
          lg.addColorStop(0.08, `rgba(255,240,100,${lightAlpha * 0.82})`)
          lg.addColorStop(0.5,  `rgba(255,230,80,${lightAlpha})`)
          lg.addColorStop(0.92, `rgba(255,210,55,${lightAlpha * 0.75})`)
          lg.addColorStop(1,    'rgba(255,195,35,0)')
          ctx.beginPath()
          ctx.ellipse(cx, (visTop+visBot)/2, 30, (visBot-visTop)/2, 0, 0, Math.PI*2)
          ctx.fillStyle = lg; ctx.fill()
          ctx.globalCompositeOperation = 'source-over'
        }
      }
      ctx.restore()
    }

    // ── Roots ────────────────────────────────────

    function drawRoots() {
      if (!achieveEl) return
      const treeDocBase = (achieveEl as HTMLElement).offsetTop + (achieveEl as HTMLElement).offsetHeight * 0.55
      const bsY = treeDocBase - scrollY
      const vis = Math.max(0, 1 - Math.abs(bsY - H * 0.52) / (H * 0.42))
      if (vis < 0.01) return
      const cx = W * 0.09 + 48
      ctx.save()
      ctx.globalAlpha = vis; ctx.strokeStyle = '#1e3c18'; ctx.lineCap = 'round'
      const roots = [
        { ex:-185, ey:58,  c1x:-58,  c1y:18, c2x:-135, c2y:44, lw:7 },
        { ex:-305, ey:38,  c1x:-85,  c1y:11, c2x:-225, c2y:29, lw:5 },
        { ex:-108, ey:88,  c1x:-32,  c1y:42, c2x:-80,  c2y:72, lw:4 },
        { ex: 165, ey:54,  c1x: 52,  c1y:17, c2x: 118, c2y:41, lw:7 },
        { ex: 275, ey:36,  c1x: 72,  c1y:10, c2x: 200, c2y:27, lw:5 },
        { ex:  95, ey:84,  c1x: 30,  c1y:40, c2x:  72, c2y:68, lw:4 },
      ]
      roots.forEach(r => {
        ctx.lineWidth = r.lw
        ctx.beginPath(); ctx.moveTo(cx, bsY)
        ctx.bezierCurveTo(cx+r.c1x, bsY+r.c1y, cx+r.c2x, bsY+r.c2y, cx+r.ex, bsY+r.ey)
        ctx.stroke()
        const bx = cx+r.ex*0.6, by = bsY+r.ey*0.6
        const mag = Math.sqrt(r.ex*r.ex+r.ey*r.ey)
        const px = (-r.ey/mag)*35, py = (r.ex/mag)*35
        ctx.lineWidth = r.lw * 0.45
        ctx.beginPath(); ctx.moveTo(bx, by)
        ctx.bezierCurveTo(bx+px*0.4, by+py*0.4+7, bx+px*0.8, by+py*0.8+16, bx+px, by+py+22)
        ctx.stroke()
      })
      ctx.restore()
    }

    // ── Snow ─────────────────────────────────────

    function drawSnow(dt: number) {
      curSnowInt += (snowIntensity - curSnowInt) * (0.018 * dt)
      if (curSnowInt < 0.01) return
      snowflakes.forEach(s => {
        s.wbl += s.wsp * dt
        s.x   += (s.vx + Math.sin(s.wbl) * 0.32) * dt
        s.y   += s.vy * dt
        if (s.y > H + 10) { s.y = -8; s.x = Math.random() * W }
        if (s.x < -10) s.x = W + 10
        if (s.x > W + 10) s.x = -10
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(235,248,255,${s.a * curSnowInt})`; ctx.fill()
        if (s.r > 2.0) {
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 2.0, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(200,230,255,${s.a * curSnowInt * 0.30})`; ctx.fill()
        }
      })
    }

    // ── Town ─────────────────────────────────────

    function drawTown() {
      if (curSnowInt < 0.01) return
      ctx.save()
      ctx.globalAlpha = curSnowInt * 0.70
      const hg = ctx.createLinearGradient(0, H-160, 0, H)
      hg.addColorStop(0, 'rgba(80,110,170,0)'); hg.addColorStop(1, 'rgba(50,80,145,0.55)')
      ctx.fillStyle = hg; ctx.fillRect(0, H-160, W, 160)

      ctx.globalAlpha = curSnowInt * 0.35
      ctx.fillStyle = 'rgba(255,220,120,0.5)'
      for (let i = 0; i < 22; i++) {
        const wx = W * (0.03 + i * 0.045), wh = 55 + (i * 31 % 60)
        ctx.fillRect(wx + 5, H - wh + 12, 4, 5)
        ctx.fillRect(wx + 12, H - wh + 22, 3, 4)
      }

      ctx.globalAlpha = curSnowInt * 0.92
      ctx.fillStyle = '#0a1828'
      ctx.beginPath(); ctx.moveTo(0, H)
      const blds: [number,number,boolean?][] = [
        [W*0.02,72],[W*0.08,92,true],[W*0.14,58],[W*0.21,82],[W*0.28,65],
        [W*0.34,106,true],[W*0.40,48],[W*0.46,74],[W*0.52,88],[W*0.58,54],
        [W*0.64,112,true],[W*0.71,68],[W*0.77,80],[W*0.83,58],[W*0.89,92],
        [W*0.94,52],[W*1.0,68],
      ]
      let px = 0
      blds.forEach(([x, h, spire]) => {
        const bw2 = (x - px) * 0.85
        ctx.lineTo(px, H); ctx.lineTo(px, H - h)
        if (spire) { ctx.lineTo(px+bw2/2, H-h-28); ctx.lineTo(px+bw2, H-h) }
        else { ctx.lineTo(px+bw2, H-h) }
        px = x
      })
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill()
      ctx.restore()
    }

    // ── Light pulse ───────────────────────────────

    function updateLight(dtSec: number) {
      lightTimer += dtSec
      if (lightPhase === 'idle') {
        if (lightTimer >= 6) { lightPhase = 'rising'; lightTimer = 0 }
      } else if (lightPhase === 'rising') {
        lightAlpha = Math.min(1, lightTimer / 0.6)
        if (lightTimer >= 0.6) { lightPhase = 'peak'; lightTimer = 0 }
      } else if (lightPhase === 'peak') {
        if (lightTimer >= 0.45) { lightPhase = 'falling'; lightTimer = 0 }
      } else if (lightPhase === 'falling') {
        lightAlpha = Math.max(0, 1 - lightTimer / 1.2)
        if (lightTimer >= 1.2) { lightPhase = 'idle'; lightAlpha = 0; lightTimer = 0 }
      }
    }

    // ── Frame loop ────────────────────────────────

    function frame(ts: number) {
      if (document.hidden) return
      const dt = lastTs ? Math.min((ts - lastTs) / 16.667, 3) : 1
      lastTs = ts
      skyTime += dt * 0.00055

      updateLight(dt * 16.667 / 1000)
      mx   += (tmx - mx)          * (0.055 * dt)
      my   += (tmy - my)          * (0.055 * dt)
      curB += (brightness - curB) * (0.022 * dt)

      ctx.clearRect(0, 0, W, H)
      const ox = mx / W - 0.5, oy = my / H - 0.5
      const normTs = ts * 0.001

      drawVanGoghSky()
      drawGroup(blueStars,  '148,196,255', ox, oy, normTs)
      drawGroup(whiteStars, '215,230,255', ox, oy, normTs)
      drawBrightStars(ox, oy, normTs)
      ctx.globalAlpha = 1

      drawMoon(); drawTree(); drawRoots()
      drawSnow(dt); drawTown()

      // Shooting stars
      shootTick += dt
      if (shootTick >= nextShoot) {
        spawnShooter(); shootTick = 0
        nextShoot = 150 + Math.floor(Math.random() * 220)
      }
      shooters = shooters.filter(s => s.life > 0)
      shooters.forEach(s => {
        s.x += s.vx * dt; s.y += s.vy * dt; s.life -= s.decay * dt
        if (s.life <= 0) return
        const steps = s.trail / s.speed
        const tx = s.x - s.vx * steps, ty = s.y - s.vy * steps
        const grad = ctx.createLinearGradient(tx, ty, s.x, s.y)
        grad.addColorStop(0, 'rgba(180,215,255,0)')
        grad.addColorStop(1, `rgba(230,245,255,${(s.life * 0.95).toFixed(3)})`)
        ctx.save()
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(s.x, s.y)
        ctx.strokeStyle = grad; ctx.lineWidth = 1.8; ctx.stroke()
        ctx.globalCompositeOperation = 'screen'
        ctx.beginPath(); ctx.arc(s.x, s.y, 8, 0, Math.PI*2)
        ctx.fillStyle = `rgba(200,225,255,${(s.life*0.12).toFixed(3)})`; ctx.fill()
        ctx.beginPath(); ctx.arc(s.x, s.y, 4, 0, Math.PI*2)
        ctx.fillStyle = `rgba(220,240,255,${(s.life*0.40).toFixed(3)})`; ctx.fill()
        ctx.beginPath(); ctx.arc(s.x, s.y, 2, 0, Math.PI*2)
        ctx.fillStyle = `rgba(255,255,255,${s.life.toFixed(3)})`; ctx.fill()
        ctx.globalCompositeOperation = 'source-over'
        ctx.restore()
      })

      rafId = requestAnimationFrame(frame)
    }

    window.setStarBrightness     = b      => { brightness = b }
    window.updateStarMouseTarget = (x, y) => { tmx = x; tmy = y }
    window.setSnow               = on     => { snowIntensity = on ? 1 : 0 }

    let _rt: number
    const handleResize = () => { clearTimeout(_rt); _rt = window.setTimeout(resize, 150) }
    const handleVis    = () => { if (!document.hidden) { lastTs = 0; rafId = requestAnimationFrame(frame) } }
    const handleScroll = () => { scrollY = window.scrollY }

    window.addEventListener('resize',           handleResize)
    window.addEventListener('scroll',           handleScroll, { passive: true })
    document.addEventListener('visibilitychange', handleVis)

    resize()
    rafId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafId)
      canvas.remove()
      window.removeEventListener('resize',           handleResize)
      window.removeEventListener('scroll',           handleScroll)
      document.removeEventListener('visibilitychange', handleVis)
      delete (window as any).setStarBrightness
      delete (window as any).updateStarMouseTarget
      delete (window as any).setSnow
    }
  }, [])

  return null
}
