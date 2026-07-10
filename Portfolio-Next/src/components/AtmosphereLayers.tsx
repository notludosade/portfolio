'use client'

import { useEffect, useRef } from 'react'

const sectionCfg: Record<string, { atm: string; starB: number; snow: boolean }> = {
  hero:         { atm: 'dusk',     starB: 0.45, snow: false },
  about:        { atm: 'early',    starB: 0.78, snow: false },
  achievements: { atm: 'midnight', starB: 1.15, snow: false },
  contact:      { atm: 'void',     starB: 0.08, snow: true  },
}

export default function AtmosphereLayers() {
  const atmRefs = useRef<Record<string, HTMLDivElement | null>>({})
  let curAtm = 'dusk'

  useEffect(() => {
    // ── Atmosphere observer ──
    function switchAtm(name: string) {
      if (name === curAtm) return
      Object.entries(atmRefs.current).forEach(([k, el]) => {
        el?.classList.toggle('active', k === name)
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
      curAtm = name
    }

    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        const cfg = sectionCfg[e.target.id]
        if (!cfg) return
        switchAtm(cfg.atm)
        window.setStarBrightness?.(cfg.starB)
        window.setSnow?.(cfg.snow)
      })
    }, { threshold: 0.35 })

    document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s))

    // ── Fade-in observer ──
    const fadeObserver = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('section, .card, .timeline-item, .list-item').forEach(el => {
      el.classList.add('fade-in')
      fadeObserver.observe(el)
    })

    // ── Active nav observer ──
    const navObserver = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (!e.isIntersecting) return
        document.querySelectorAll('.nav-links a').forEach(l => ((l as HTMLElement).style.color = ''))
        const a = document.querySelector<HTMLElement>(`.nav-links a[href="#${e.target.id}"]`)
        if (a) a.style.color = '#e2e2e2'
      }),
      { threshold: 0.4 }
    )
    document.querySelectorAll('section[id]').forEach(s => navObserver.observe(s))

    return () => {
      sectionObserver.disconnect()
      fadeObserver.disconnect()
      navObserver.disconnect()
    }
  }, [])

  return (
    <>
      <div className="atm-layer atm-dusk active" id="atm-dusk"
           ref={el => { atmRefs.current['dusk'] = el }} />
      <div className="atm-layer atm-early"        id="atm-early"
           ref={el => { atmRefs.current['early'] = el }} />
      <div className="atm-layer atm-midnight"     id="atm-midnight"
           ref={el => { atmRefs.current['midnight'] = el }} />
      <div className="atm-layer atm-void"         id="atm-void"
           ref={el => { atmRefs.current['void'] = el }} />
    </>
  )
}
