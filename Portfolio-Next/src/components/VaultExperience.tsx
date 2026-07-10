'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { DATA } from '@/lib/data'

type VaultState = 'vault' | 'opening' | 'room' | 'focusing' | 'closing' | 'exit'
type LeftSection  = 'projects' | 'internships'
type RightSection = 'awards'   | 'events'

// ── Expandable shelf item ────────────────────────
function ShelfItem({ year, name, body, placeholder }: {
  year: string | null; name: string | null; body: React.ReactNode; placeholder?: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`shelf-item${open ? ' open' : ''}`}>
      <button className="shelf-item-header" onClick={() => !placeholder && setOpen(o => !o)}>
        <span className="si-year mono">{year ?? '—'}</span>
        <span className={`si-name${placeholder ? ' muted' : ''}`}>
          {name ?? <em>Coming soon</em>}
        </span>
        <span className="si-arrow">▸</span>
      </button>
      <div className="shelf-item-body">{body}</div>
    </div>
  )
}

// ── Books row helper ─────────────────────────────
const LEFT_BOOKS  = [
  { h:'88px',w:'18px',c:'#4a1e10' },{ h:'72px',w:'22px',c:'#1e3a4a' },
  { h:'96px',w:'16px',c:'#2e1a0e' },{ h:'80px',w:'24px',c:'#1a2e1a' },
  { h:'68px',w:'18px',c:'#3a2a10' },{ h:'92px',w:'20px',c:'#2a1830' },
  { h:'76px',w:'14px',c:'#1e2838' },
]
const RIGHT_BOOKS = [
  { h:'82px',w:'20px',c:'#2a3a1e' },{ h:'94px',w:'16px',c:'#3a1e28' },
  { h:'70px',w:'22px',c:'#1e3028' },{ h:'86px',w:'18px',c:'#2e2010' },
  { h:'78px',w:'24px',c:'#1a1e3a' },{ h:'90px',w:'16px',c:'#2a1018' },
  { h:'74px',w:'20px',c:'#102428' },
]

// ── Torch sub-component ──────────────────────────
function Torch() {
  return (
    <div className="torch-flame">
      <div className="flame f1" /><div className="flame f2" /><div className="flame f3" />
    </div>
  )
}

// ── Main component ───────────────────────────────
export default function VaultExperience() {
  const [vaultState,      setVState]      = useState<VaultState>('vault')
  const [panelsOpen,      setPanelsOpen]  = useState(false)
  const [libraryVisible,  setLibVisible]  = useState(false)
  const [gearSpinning,    setGearSpin]    = useState(false)
  const [exitVisible,     setExitVis]     = useState(false)
  const [vaultInView,     setInView]      = useState(false)
  const [focusDir,        setFocusDir]    = useState<'left'|'right'|null>(null)
  const [activeLeft,      setActiveLeft]  = useState<LeftSection>('projects')
  const [activeRight,     setActiveRight] = useState<RightSection>('awards')

  const stateRef  = useRef<VaultState>('vault')
  const vaultRef  = useRef<HTMLElement>(null)
  const timerIds  = useRef<ReturnType<typeof setTimeout>[]>([])

  function later(fn: () => void, ms: number) {
    const id = setTimeout(fn, ms); timerIds.current.push(id)
  }
  useEffect(() => () => { timerIds.current.forEach(clearTimeout) }, [])

  // Vault fade-in on scroll
  useEffect(() => {
    if (!vaultRef.current) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true) },
      { threshold: 0.25 }
    )
    obs.observe(vaultRef.current)
    return () => obs.disconnect()
  }, [])

  function transition(next: VaultState) {
    stateRef.current = next; setVState(next)

    if (next === 'opening') {
      setGearSpin(true)
      later(() => {
        setPanelsOpen(true)
        later(() => { setGearSpin(false); setLibVisible(true); transition('room') }, 1300)
      }, 820)
    }
    if (next === 'closing') {
      setLibVisible(false); setFocusDir(null)
      later(() => setPanelsOpen(false), 520)
      later(() => setGearSpin(true), 620)
      later(() => { setGearSpin(false); transition('exit') }, 1800)
    }
    if (next === 'exit')  { setExitVis(true) }
    if (next === 'vault') { setExitVis(false); setFocusDir(null) }
  }

  function handleLock() {
    if (stateRef.current !== 'vault') return
    transition('opening')
  }

  function handleShelfBtn(section: LeftSection | RightSection) {
    if (!['room','focusing'].includes(stateRef.current)) return
    const isLeft = section === 'projects' || section === 'internships'
    const curActive = isLeft ? activeLeft : activeRight
    if (curActive === section && focusDir === (isLeft ? 'left' : 'right')) {
      setFocusDir(null); stateRef.current='room'; setVState('room')
    } else {
      if (isLeft) setActiveLeft(section as LeftSection)
      else        setActiveRight(section as RightSection)
      setFocusDir(isLeft ? 'left' : 'right')
      stateRef.current='focusing'; setVState('focusing')
    }
  }

  function handleClose() {
    if (!['room','focusing'].includes(stateRef.current)) return
    transition('closing')
  }

  function handleContinue() {
    if (stateRef.current !== 'exit') return
    transition('vault')
    vaultRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // ── Shelf item renderers ─────────────────────

  const projectItems = DATA.projects.map((p, i) => (
    <ShelfItem key={i} year={p.year} name={p.name} placeholder={!p.name} body={
      <>
        <p>{p.description ?? 'Details will be added when this project is ready.'}</p>
        {p.status && <p className="mono" style={{fontSize:'0.65rem',opacity:0.6}}>● {p.status}</p>}
        {p.tags.length > 0 && (
          <div className="si-tags">
            {p.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        )}
        {(p.links.github||p.links.live) && (
          <div className="si-links">
            {p.links.github && <a href={p.links.github} className="si-link">→ GitHub</a>}
            {p.links.live   && <a href={p.links.live}   className="si-link">→ Live</a>}
          </div>
        )}
      </>
    }/>
  ))

  const internshipItems = DATA.internships.map((inn, i) => (
    <ShelfItem key={i} year={null} name={inn.role} placeholder={!inn.role} body={
      <>
        {inn.range && <p className="mono" style={{fontSize:'0.65rem',opacity:0.6}}>{inn.range}{inn.type?` · ${inn.type}`:''}</p>}
        {inn.company && <p style={{fontSize:'0.72rem',color:'rgba(200,155,70,0.7)'}}>@ {inn.company}</p>}
        <p>{inn.description ?? 'Details will be added here.'}</p>
      </>
    }/>
  ))

  const awardItems = DATA.awards.map((a, i) => (
    <ShelfItem key={i} year={a.year} name={a.name} placeholder={!a.name} body={
      <>
        {a.issuer && <p style={{fontSize:'0.72rem',color:'rgba(180,140,70,0.7)'}}>{a.issuer}</p>}
        {a.description && <p>{a.description}</p>}
        {!a.name && <p>Award details will be added here.</p>}
      </>
    }/>
  ))

  const eventItems = DATA.events.map((ev, i) => (
    <ShelfItem key={i} year={ev.year} name={ev.name} placeholder={!ev.name} body={
      <>
        {ev.role && <p style={{fontSize:'0.72rem',color:'rgba(180,140,70,0.7)'}}>{ev.role}</p>}
        {ev.description && <p>{ev.description}</p>}
        {!ev.name && <p>Event details will be added here.</p>}
      </>
    }/>
  ))

  const sceneClass = `library-scene${focusDir==='left' ? ' focus-left' : focusDir==='right' ? ' focus-right' : ''}`

  return (
    <>
      {/* ══ VAULT SECTION ══ */}
      <section id="arc-vault" ref={vaultRef as React.RefObject<HTMLElement>}>
        <div className="vault-wrap">

          <div className="torch torch-left">
            <Torch /><div className="torch-body" /><div className="torch-mount" />
          </div>
          <div className="torch torch-right">
            <Torch /><div className="torch-body" /><div className="torch-mount" />
          </div>

          <div className={`vault-rig${vaultInView ? ' visible' : ''}`}>

            {/* Left panel */}
            <div className={`vault-panel vault-panel-left${panelsOpen ? ' open' : ''}`}>
              <div className="vault-panel-inner">
                <div className="vault-bar vb-top" /><div className="vault-bar vb-mid" /><div className="vault-bar vb-bot" />
                <div className="vault-rivets">
                  <span className="rivet"/><span className="rivet"/><span className="rivet"/><span className="rivet"/>
                </div>
                <div className="vault-engrave">I</div>
              </div>
            </div>

            {/* Lock */}
            <div className="vault-center">
              <button className="vault-lock" onClick={handleLock} aria-label="Open the vault">
                <div className="lock-glow" />
                <svg className="lock-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <g className="lock-outer-ring">
                    <circle cx="100" cy="100" r="91" fill="none" stroke="rgba(255,140,40,0.18)" strokeWidth="1.5"/>
                    <g stroke="rgba(255,140,40,0.55)" strokeLinecap="round">
                      {[0,15,30,45,60,75,90,105,120,135,150,165,180,195,210,225,240,255,270,285,300,315,330,345].map(deg => (
                        <line key={deg} x1="100" y1="5" x2="100" y2={deg % 30 === 0 ? 16 : 12}
                              transform={`rotate(${deg} 100 100)`}
                              strokeWidth={deg % 30 === 0 ? 2 : 1.2} />
                      ))}
                    </g>
                  </g>
                  <circle cx="100" cy="100" r="74" fill="rgba(28,14,6,0.97)" stroke="rgba(160,78,16,0.5)" strokeWidth="2.5"/>
                  <g className={`lock-gear-ring${gearSpinning ? ' spin' : ''}`} id="lock-gear" style={{transformOrigin:'100px 100px'}}>
                    <circle cx="100" cy="100" r="62" fill="rgba(18,9,3,0.99)" stroke="rgba(215,110,28,0.75)" strokeWidth="2"/>
                    {[0,40,80,120,160,200,240,280,320].map(deg => (
                      <polygon key={deg} points="100,36 105,48 95,48" fill="rgba(200,95,18,0.7)"
                               transform={`rotate(${deg} 100 100)`}/>
                    ))}
                    <line x1="100" y1="44" x2="100" y2="156" stroke="rgba(190,88,14,0.38)" strokeWidth="2"/>
                    <line x1="44"  y1="100" x2="156" y2="100" stroke="rgba(190,88,14,0.38)" strokeWidth="2"/>
                    <line x1="56"  y1="56"  x2="144" y2="144" stroke="rgba(190,88,14,0.22)" strokeWidth="1.5"/>
                    <line x1="144" y1="56"  x2="56"  y2="144" stroke="rgba(190,88,14,0.22)" strokeWidth="1.5"/>
                  </g>
                  <circle cx="100" cy="100" r="22" fill="rgba(14,7,2,1)" stroke="rgba(235,128,32,0.9)" strokeWidth="2.5"/>
                  <circle cx="100" cy="100" r="10" fill="rgba(255,145,45,0.55)"/>
                  <circle cx="100" cy="100" r="4"  fill="rgba(255,210,90,0.92)"/>
                </svg>
                <p className="lock-prompt mono">[ click to open ]</p>
              </button>
            </div>

            {/* Right panel */}
            <div className={`vault-panel vault-panel-right${panelsOpen ? ' open' : ''}`}>
              <div className="vault-panel-inner">
                <div className="vault-bar vb-top" /><div className="vault-bar vb-mid" /><div className="vault-bar vb-bot" />
                <div className="vault-rivets">
                  <span className="rivet"/><span className="rivet"/><span className="rivet"/><span className="rivet"/>
                </div>
                <div className="vault-engrave">II</div>
              </div>
            </div>

          </div>{/* /.vault-rig */}
          <div className="vault-floor" />
        </div>
      </section>

      {/* ══ LIBRARY OVERLAY ══ */}
      <div id="arc-library" className={`arc-library${libraryVisible ? ' visible' : ''}`}
           aria-hidden={!libraryVisible}>
        <div className="room-bg" />

        <div className={sceneClass} id="library-scene">

          {/* Left shelf */}
          <aside className="shelf shelf-left" id="shelf-left">
            <div className="shelf-cap top" />
            <div className="shelf-section-btns">
              {(['projects','internships'] as LeftSection[]).map(s => (
                <button key={s} className={`shelf-btn${activeLeft===s&&focusDir==='left'?' active':''}`}
                        onClick={() => handleShelfBtn(s)}>
                  {s.charAt(0).toUpperCase()+s.slice(1)}
                </button>
              ))}
            </div>
            <div className="shelf-books-row">
              {LEFT_BOOKS.map((b,i) => (
                <div key={i} className="book"
                     style={{'--bh':b.h,'--bw':b.w,'--bc':b.c} as React.CSSProperties}/>
              ))}
            </div>
            <div className="shelf-rail" />
            <div className={`shelf-items-panel${activeLeft!=='projects' ? ' hidden' : ''}`}>
              <div className="shelf-item-list">{projectItems}</div>
            </div>
            <div className={`shelf-items-panel${activeLeft!=='internships' ? ' hidden' : ''}`}>
              <div className="shelf-item-list">{internshipItems}</div>
            </div>
            <div className="shelf-cap bottom" />
          </aside>

          {/* Centre room */}
          <div className="room-center">
            <div className="ceiling-lantern">
              <div className="lantern-chain" />
              <div className="lantern-cage">
                <div className="lantern-bar lb1" /><div className="lantern-bar lb2" />
                <div className="lantern-glow-inner" />
              </div>
              <div className="lantern-halo" />
            </div>
            <div className="desk-wrap">
              <div className="desk-surface">
                <div className="dsk-candle">
                  <div className="dsk-flame"><div className="flame f1"/><div className="flame f2"/></div>
                  <div className="dsk-candle-body"/>
                </div>
                <div className="dsk-book"/>
                <div className="dsk-paper"/>
              </div>
              <div className="desk-apron"/>
              <div className="desk-legs-row">
                <div className="desk-leg"/><div className="desk-leg"/>
              </div>
            </div>
            <div className="chair-wrap">
              <div className="chair-back">
                <div className="chair-spindle"/><div className="chair-spindle"/><div className="chair-spindle"/>
              </div>
              <div className="chair-seat"/>
              <div className="chair-legs-row">
                <div className="chair-leg"/><div className="chair-leg"/>
              </div>
            </div>
            <p className="room-label mono">— The Archive —</p>
          </div>

          {/* Right shelf */}
          <aside className="shelf shelf-right" id="shelf-right">
            <div className="shelf-cap top" />
            <div className="shelf-section-btns">
              {(['awards','events'] as RightSection[]).map(s => (
                <button key={s} className={`shelf-btn${activeRight===s&&focusDir==='right'?' active':''}`}
                        onClick={() => handleShelfBtn(s)}>
                  {s.charAt(0).toUpperCase()+s.slice(1)}
                </button>
              ))}
            </div>
            <div className="shelf-books-row">
              {RIGHT_BOOKS.map((b,i) => (
                <div key={i} className="book"
                     style={{'--bh':b.h,'--bw':b.w,'--bc':b.c} as React.CSSProperties}/>
              ))}
            </div>
            <div className="shelf-rail" />
            <div className={`shelf-items-panel${activeRight!=='awards' ? ' hidden' : ''}`}>
              <div className="shelf-item-list">{awardItems}</div>
            </div>
            <div className={`shelf-items-panel${activeRight!=='events' ? ' hidden' : ''}`}>
              <div className="shelf-item-list">{eventItems}</div>
            </div>
            <div className="shelf-cap bottom" />
          </aside>

        </div>{/* /.library-scene */}

        <button className="lib-exit-btn mono" onClick={handleClose}>✕  Close the Vault</button>
      </div>

      {/* ══ EXIT OVERLAY ══ */}
      <div id="arc-exit" className={`arc-exit${exitVisible ? ' visible' : ''}`}
           aria-hidden={!exitVisible}>
        <div className="exit-inner">
          <div className="exit-seal mono">⊘ VAULT SEALED</div>
          <h2 className="exit-heading">Where to next?</h2>
          <p className="exit-sub muted">The vault locks itself once more, waiting in silence.</p>
          <div className="exit-btns">
            <button className="btn-primary" onClick={handleContinue}>Continue Looking</button>
            <Link href="/" className="btn-ghost mono">Return to the Village</Link>
          </div>
        </div>
      </div>
    </>
  )
}
