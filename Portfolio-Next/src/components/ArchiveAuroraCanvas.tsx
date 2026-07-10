'use client'

import { useEffect } from 'react'

export default function ArchiveAuroraCanvas() {
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.id = 'arc-canvas'
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none'
    document.body.prepend(canvas)
    const ctx = canvas.getContext('2d')!

    let W = 0, H = 0, lastTs = 0, skyT = 0
    let orbs: any[] = [], stars: any[] = []

    function resize() {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
      orbs = [
        { x:W*0.25, y:H*0.30, vx: 0.12, vy: 0.08, r:Math.min(W,H)*0.62, a:0.055, h:222, _grad:null, _px:-1 },
        { x:W*0.70, y:H*0.22, vx:-0.09, vy: 0.11, r:Math.min(W,H)*0.52, a:0.048, h:265, _grad:null, _px:-1 },
        { x:W*0.50, y:H*0.65, vx: 0.07, vy:-0.10, r:Math.min(W,H)*0.45, a:0.040, h:200, _grad:null, _px:-1 },
        { x:W*0.80, y:H*0.70, vx:-0.11, vy:-0.07, r:Math.min(W,H)*0.38, a:0.035, h:285, _grad:null, _px:-1 },
      ]
      stars = Array.from({ length: 320 }, () => ({
        x: Math.random()*W, y: Math.random()*H,
        r: Math.random()*1.3+0.2,
        baseA: Math.random()*0.70+0.25,
        ph: Math.random()*Math.PI*2,
        sp: 0.6+Math.random()*1.2,
      }))
    }

    function drawVanGoghSky() {
      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      const swirls = [
        { cx:W*0.22, cy:H*0.18, outerR:W*0.26, innerR:W*0.04, speed:0.50, hue:215, alpha:0.30 },
        { cx:W*0.60, cy:H*0.12, outerR:W*0.20, innerR:W*0.03, speed:0.38, hue:200, alpha:0.25 },
        { cx:W*0.80, cy:H*0.28, outerR:W*0.18, innerR:W*0.03, speed:0.45, hue:228, alpha:0.28 },
      ]
      swirls.forEach(sw => {
        for (let ring = 0; ring < 8; ring++) {
          const frac  = ring / 7
          const ringR = sw.innerR + (sw.outerR - sw.innerR) * frac
          const rot   = skyT * sw.speed + ring * 0.45
          const arcLen = Math.PI * (1.3 + frac * 0.5)
          const peakA = sw.alpha * Math.max(0, 1 - Math.pow((frac-0.3)/0.5, 2))
          if (peakA < 0.01) continue
          const ll = 30 + frac*42, sat = 88 - frac*18
          ctx.globalAlpha = peakA
          ctx.strokeStyle = `hsl(${sw.hue - frac*12},${sat}%,${ll}%)`
          ctx.lineWidth   = Math.max(1.5, 11 - ring * 1.0)
          ctx.lineCap     = 'round'
          ctx.beginPath(); ctx.arc(sw.cx, sw.cy, ringR, rot, rot+arcLen); ctx.stroke()
          ctx.globalAlpha = peakA * 0.40
          ctx.lineWidth   = Math.max(1, 5.5 - ring * 0.5)
          ctx.beginPath(); ctx.arc(sw.cx, sw.cy, ringR*1.1, rot+Math.PI+0.2, rot+Math.PI+arcLen*0.55); ctx.stroke()
        }
      })
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
      ctx.restore()
    }

    let rafId = 0
    function frame(ts: number) {
      if (document.hidden) return
      const dt = lastTs ? Math.min((ts-lastTs)/16.667, 3) : 1
      lastTs = ts; skyT += dt * 0.00055

      ctx.clearRect(0, 0, W, H)

      // Aurora orbs
      ctx.globalCompositeOperation = 'screen'
      orbs.forEach(o => {
        o.x += o.vx*dt; o.y += o.vy*dt
        if (o.x < -o.r) o.x = W+o.r
        if (o.x > W+o.r) o.x = -o.r
        if (o.y < -o.r) o.y = H+o.r
        if (o.y > H+o.r) o.y = -o.r
        if (!o._grad || Math.abs(o.x-o._px) > 3) {
          const g = ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r)
          g.addColorStop(0,   `hsla(${o.h},80%,65%,${o.a})`)
          g.addColorStop(0.5, `hsla(${o.h},70%,55%,${o.a*0.45})`)
          g.addColorStop(1,   `hsla(${o.h},60%,45%,0)`)
          o._grad = g; o._px = o.x
        }
        ctx.globalAlpha = 1; ctx.fillStyle = o._grad
        ctx.beginPath(); ctx.arc(o.x,o.y,o.r,0,Math.PI*2); ctx.fill()
      })
      ctx.globalCompositeOperation = 'source-over'

      drawVanGoghSky()

      // Stars with twinkle
      const normTs = ts * 0.001
      stars.forEach(s => {
        const a = s.baseA * (0.82 + 0.18 * Math.sin(normTs * s.sp + s.ph))
        ctx.globalAlpha = a
        ctx.fillStyle = 'rgba(210,228,255,1)'
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill()
      })
      ctx.globalAlpha = 1

      rafId = requestAnimationFrame(frame)
    }

    let _rt: number
    const onResize = () => { clearTimeout(_rt); _rt = window.setTimeout(resize, 150) }
    const onVis    = () => { if (!document.hidden) { lastTs = 0; rafId = requestAnimationFrame(frame) } }
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVis)
    resize()
    rafId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafId)
      canvas.remove()
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return null
}
